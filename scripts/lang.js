let idioma = "en";

export function setIdioma(newIdioma) {
  idioma = newIdioma;
}

export function getIdioma() {
  return idioma;
}

export function updateApiUrl() {
  return `../api${idioma}.json`;
}