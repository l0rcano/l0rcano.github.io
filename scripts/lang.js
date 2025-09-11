let idioma = "EN";

export function setIdioma(newIdioma) {
  idioma = newIdioma;
}

export function getIdioma() {
  return idioma;
}

// export function updateApiUrl() {
//   return `../api/api${idioma}.json`;
// }
export function updateApiUrl() {
  return `https://lorcanajson.org/files/current/${idioma.toLowerCase()}/allCards.json`;
}
