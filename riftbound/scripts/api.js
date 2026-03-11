// ---------------------------------------------------------------
// api.js — Riftbound card data fetcher
//
// The Riot API enforces CORS, so direct browser fetch is blocked.
// This module calls your server-side proxy at /api/riftbound-proxy
// which adds the API key header and forwards the request.
//
// Proxy setup (Node/Express example — place in your server):
//
//   app.get('/api/riftbound-proxy', async (req, res) => {
//     const locale = req.query.locale || 'en';
//     const url = `https://europe.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`;
//     const resp = await fetch(url, {
//       headers: { 'X-Riot-Token': 'YOUR_API_KEY_HERE' }
//     });
//     const data = await resp.json();
//     res.json(data);
//   });
//
// If you prefer to embed the key in the frontend (dev only, not recommended),
// set USE_DIRECT = true and fill in your key below.
// ---------------------------------------------------------------

const USE_DIRECT = false; // ← Set to true for local dev without a proxy
const RIOT_API_KEY = 'RGAPI-e66661e8-2d21-4c08-99bb-f82d88815808'; // ← Only used when USE_DIRECT = true
const PROXY_URL = '/api/riftbound-proxy';

export let cardsData = [];

export function fetchCardsData(locale = 'en') {
  const url = USE_DIRECT
    ? `https://europe.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`
    : `${PROXY_URL}?locale=${locale}`;

  const options = USE_DIRECT
    ? { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    : {};

  return fetch(url, options)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // The API response is an object with `sets` array, each set has `cards`
      // Flatten all cards from all sets
      const allCards = [];
      if (data.sets && Array.isArray(data.sets)) {
        data.sets.forEach(set => {
          if (set.cards && Array.isArray(set.cards)) {
            set.cards.forEach(card => {
              allCards.push(mapCard(card, set));
            });
          }
        });
      }
      cardsData = allCards;
      return cardsData;
    });
}

function mapCard(card, set) {
  // Map Riot API card structure to our internal format
  // Based on actual API response structure (media[] array, not art object)
  const imageUrl = getImageUrl(card);

  return {
    ID:             card.id || '',
    Name:           card.name || '',
    Type:           card.type || '',
    Supertype:      card.supertype || '',
    Rarity:         card.rarity || '',
    Domain:         Array.isArray(card.faction)
                      ? card.faction
                      : (card.faction ? [card.faction] : []),
    Set_ID:         set.id || card.set || '',
    Set_Name:       set.name || set.id || '',
    Card_Num:       card.collectorNumber || 0,
    Energy:         card.stats?.energy ?? card.cost ?? null,
    Might:          card.stats?.might ?? null,
    Power:          card.stats?.power ?? null,
    Keywords:       Array.isArray(card.keywords) ? card.keywords : [],
    Tags:           Array.isArray(card.tags) ? card.tags : [],
    Body_Text:      card.description || '',
    Flavor_Text:    card.flavorText || '',
    Artist:         card.art?.artist || getArtist(card),
    Image:          imageUrl,
    Thumbnail:      getThumbnail(card),
    Orientation:    card.orientation || 'portrait',
    AlternateArt:   card.metadata?.alternate_art || false,
    Signature:      card.metadata?.signature || false,
  };
}

function getImageUrl(card) {
  // Handle both documented (art.fullURL) and actual (media[]) response formats
  if (card.art?.fullURL) return card.art.fullURL;
  if (card.media && Array.isArray(card.media)) {
    const full = card.media.find(m => m.type === 'full' || m.name === 'full');
    if (full) return full.url;
    if (card.media[0]) return card.media[0].url;
  }
  // Fallback to riftcodex-style image_url if present
  if (card.image_url) return card.image_url;
  if (card.media?.image_url) return card.media.image_url;
  return '';
}

function getThumbnail(card) {
  if (card.art?.thumbnailURL) return card.art.thumbnailURL;
  if (card.media && Array.isArray(card.media)) {
    const thumb = card.media.find(m => m.type === 'thumbnail' || m.name === 'thumbnail');
    if (thumb) return thumb.url;
  }
  return getImageUrl(card);
}

function getArtist(card) {
  if (card.media && Array.isArray(card.media)) {
    const m = card.media.find(m => m.artist);
    if (m) return m.artist;
  }
  return '';
}
