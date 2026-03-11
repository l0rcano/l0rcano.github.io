import { fetchCardsData } from "./api.js";
import { filterAndDisplayCards } from "./filters.js";
import { setupEventHandlers } from "./eventHandlers.js";
import { buildDynamicFilters } from "./filterBuilder.js";

document.addEventListener("DOMContentLoaded", function () {
  initApp();
});

function initApp() {
  fetchCardsData()
    .then(() => {
      buildDynamicFilters();  
      filterAndDisplayCards();
      hidePlaceholder();
    })
    .catch((error) => console.error("Error obtenint dades de l'API:", error));

  setupEventHandlers();
}

function hidePlaceholder() {
  const placeholderElement = document.getElementById("placeholder");
  if (placeholderElement) placeholderElement.style.display = "none";
}