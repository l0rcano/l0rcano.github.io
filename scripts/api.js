const apiUrl = "https://api.lorcana-api.com/cards/all";
export let cardsData = [];

function cleanFilename(filename) {
  return filename.replace(/[\\/*?:"<>|]/g, '_').replace(/\s+/g, '_');
}

export function fetchCardsData() {
  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data.map(card => {
        const cardName = cleanFilename(card.Name);
        card.Image = `resources/img/${cardName}.jpg`;
        return card;
      });
      return cardsData;
    });
}
