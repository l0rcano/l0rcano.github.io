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

// ── Configuration ──────────────────────────────────────────────
//
// Option A (recommended): Use the proxy server (proxy-server.js)
//   → Keep USE_DIRECT = false, set your key in proxy-server.js
//
// Option B (quick local test): Direct fetch with key in frontend
//   → Set USE_DIRECT = true and paste your key in RIOT_API_KEY
//   → NOT recommended for production (exposes your key)
//
// Regions tried in order: europe → americas → asia
// If europe returns 404, the code will automatically try americas.
// ───────────────────────────────────────────────────────────────

const USE_DIRECT  = false;
const RIOT_API_KEY = 'RGAPI-e66661e8-2d21-4c08-99bb-f82d88815808';
const PROXY_URL   = '/api/riftbound-proxy';

// Regions to try in order when USE_DIRECT = true
const REGIONS = ['europe', 'americas', 'asia'];

export let cardsData = [];

export function fetchCardsData(locale = 'en') {
  if (USE_DIRECT) {
    return fetchDirect(locale);
  }
  return fetchViaProxy(locale);
}

function fetchViaProxy(locale) {
  const url = `${PROXY_URL}?locale=${locale}`;
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Proxy error ${res.status} — check proxy-server.js is running and your API key is set`);
      return res.json();
    })
    .then(parseResponse);
}

async function fetchDirect(locale) {
  for (const region of REGIONS) {
    const url = `https://${region}.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`;
    console.log(`[api] trying ${url}`);
    try {
      const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
      if (res.status === 404) {
        console.warn(`[api] 404 on ${region}, trying next region…`);
        continue;
      }
      if (!res.ok) throw new Error(`API error ${res.status} (${region}): ${res.statusText}`);
      const data = await res.json();
      console.log(`[api] loaded from ${region}`);
      return parseResponse(data);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        console.warn(`[api] CORS blocked on ${region} (expected in browser) — use the proxy instead`);
        break;
      }
      throw err;
    }
  }
  throw new Error('Could not reach Riftbound API on any region. Use proxy-server.js to bypass CORS.');
}

function parseResponse(data) {
  const allCards = [];
  if (data.sets && Array.isArray(data.sets)) {
    data.sets.forEach(set => {
      if (set.cards && Array.isArray(set.cards)) {
        set.cards.forEach(card => allCards.push(mapCard(card, set)));
      }
    });
  }
  if (allCards.length === 0) {
    console.warn('[api] Response parsed but no cards found. Raw response:', data);
  } else {
    console.log(`[api] Loaded ${allCards.length} cards across ${data.sets?.length ?? 0} sets`);
  }
  cardsData = allCards;
  return cardsData;
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