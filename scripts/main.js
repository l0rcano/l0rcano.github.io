import { fetchCardsData, cardsData } from "./api.js";
import { filterAndDisplayCards } from "./filters.js";
import { setupEventHandlers } from "./eventHandlers.js";

document.addEventListener("DOMContentLoaded", function () {
  initApp();
});

function initApp() {
  fetchCardsData()
    .then(() => {
      filterAndDisplayCards();
      hidePlaceholder();
    })
    .catch((error) => console.error("Error obtenint dades de l'API:", error));

  setupEventHandlers();
}

function hidePlaceholder() {
  const placeholderElement = document.getElementById("placeholder");
  placeholderElement.style.display = "none";
}
