// https://lorcanajson.org/
const apiUrl = "../api.json";
export let cardsData = [];

// function cleanFilename(filename) {
//   return filename.replace(/[\\/*?:"<>|]/g, '_').replace(/\s+/g, '_');
// }

function cleanFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[\\/*?:"<>|]/g, '_')
    .replace(/\s+/g, '_');
}

export function fetchCardsData() {
  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data.map(card => {
        const cardName = cleanFilename(card.Name);
        console.log(cardName)
        card.Image = `resources/img/en/${cardName}.jpg`;
        console.log(card.Image)
        return card;
      });
      return cardsData;
    });
}
