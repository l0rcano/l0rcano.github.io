export function applySearchFilters(cards) {
  const nameInput   = document.getElementById('search-name');
  const textInput   = document.getElementById('search-text');
  const globalInput = document.getElementById('search-global');
  const artistInput = document.getElementById('search-artist');

  if (nameInput?.value)   cards = searchByName(cards, nameInput.value);
  if (textInput?.value)   cards = searchByText(cards, textInput.value);
  if(globalInput?.value)  cards = searchGlobal(cards, globalInput.value);
  if (artistInput?.value) cards = searchByArtist(cards, artistInput.value);
  return cards;
}

function searchByName(cards, term) {
  const t = term.toLowerCase();
  return cards.filter(c => c.Name.toLowerCase().includes(t));
}

function searchByText(cards, term) {
  const t = term.toLowerCase();
  return cards.filter(c => (c.Body_Text || '').toLowerCase().includes(t));
}

function searchGlobal(cards, term) {
  const t = term.toLowerCase();
  return cards.filter(c => {
    return Object.entries(c)
      .filter(([k]) => !['Image','Thumbnail','Flavor_Text'].includes(k))
      .some(([, v]) => String(v).toLowerCase().includes(t));
  });
}

function searchByArtist(cards, term) {
  const t = term.toLowerCase();
  return cards.filter(c => (c.Artist || '').toLowerCase().includes(t));
}
