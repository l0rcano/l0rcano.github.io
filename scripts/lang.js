let idioma = "EN";

export function setIdioma(newIdioma) {
  idioma = newIdioma;
}

export function getIdioma() {
  return idioma;
}

export function updateApiUrl() {
  return `../api/api${idioma}.json`;
}