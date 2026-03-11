// ── api.js ───────────────────────────────────────────────────────
// Reads card data from /api/api.json (local file, no API key needed).
//
// To add or update cards, edit /api/api.json directly.
//
// The old mock/proxy/Riot API logic is preserved in api.test.js
// ────────────────────────────────────────────────────────────────

export let cardsData = [];

export function fetchCardsData() {
  return fetch('./api/api.json')
    .then(res => {
      if (!res.ok) throw new Error(`Could not load api.json: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const cards = Array.isArray(data) ? data : [];
      cardsData = cards
        .filter(c => c.cardType && c.name && c.images?.large)
        .map(mapCard);

      console.log(`[api] Loaded ${cardsData.length} cards from api.json`);
      return cardsData;
    });
}

function mapCard(card) {
  // domain: semicolon-separated string "Fury;Calm" → array ["Fury","Calm"]
  const domain = card.domain && card.domain !== 'None'
    ? card.domain.split(';').map(d => d.trim()).filter(Boolean)
    : [];

  // cardType: take first part for filtering ("Unit;Token" → "Unit")
  const type = card.cardType ? card.cardType.split(';')[0].trim() : '';

  // card number: "001/298" → 1
  const cardNum = parseInt(card.number) || 0;

  return {
    ID:          card.id             || '',
    Name:        card.name           || '',
    CleanName:   card.cleanName      || card.name || '',
    Type:        type,
    FullType:    card.cardType       || '',
    Rarity:      card.rarity         || '',
    Domain:      domain,
    Set_ID:      card.set?.id        || '',
    Set_Name:    card.set?.name      || '',
    Set_Date:    card.set?.releaseDate || '',
    Card_Num:    cardNum,
    Card_Code:   card.code           || '',
    Energy:      card.energyCost != null ? parseInt(card.energyCost) : null,
    Power:       card.powerCost  != null ? parseInt(card.powerCost)  : null,
    Might:       card.might      != null ? parseInt(card.might)      : null,
    Body_Text:   card.description    || '',
    Flavor_Text: card.flavorText     || '',
    Image:       card.images?.large  || card.images?.small || '',
    Thumbnail:   card.images?.small  || card.images?.large || '',
    TCGPlayer:   card.tcgplayer?.url || '',
    Orientation: 'portrait',
  };
}