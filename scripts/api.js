// https://lorcanajson.org/
import { getIdioma, updateApiUrl } from "./lang.js";

// const apiUrl = `../api${idioma}.json`;
export let cardsData = [];

function cleanFilename(filename) {
  return filename.replace(/[\\/*?:"<>|]/g, '_').replace(/\s+/g, '_');
}

export function fetchCardsData() {
  const apiUrl = updateApiUrl();
  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data.map(card => {
        const cardName = cleanFilename(card.Name);
        card.Image = `resources/img/${getIdioma()}/${cardName}.jpg`;
        return card;
      });
      return cardsData;
    });
}
