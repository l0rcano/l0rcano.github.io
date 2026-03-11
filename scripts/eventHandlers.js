import { filterAndDisplayCards, resetFilters, validateRange } from "./filters.js";
import { getCardsDisplayed, setCardsDisplayed } from "./display.js";
import { setIdioma, updateApiUrl } from "./lang.js";
import { cardsData, fetchCardsData } from "./api.js";
import { buildDynamicFilters } from "./filterBuilder.js";

export function setupEventHandlers() {
  const sortSelect          = document.getElementById("sort-select");
  const searchInput         = document.getElementById("search-input");
  const searchInputAtt      = document.getElementById("search-input-att");
  const searchInputEff      = document.getElementById("search-input-eff");
  const searchInputGlobal   = document.getElementById("search-input-global");
  const inkableSelect       = document.getElementById("inkable-select");
  const enchantedSelect     = document.getElementById("enchanted-select");
  const invertOrderButton   = document.getElementById("invert-order-button");
  const loadMoreButton      = document.getElementById("load-more-button");
  const loadAllButton       = document.getElementById("load-all-button");
  const clearAllButton      = document.getElementById("clear-all");
  const inputElements       = document.querySelectorAll("input");
  const toggleIdiomaEN      = document.getElementById("toggleIdiomaEN");
  const toggleIdiomaFR      = document.getElementById("toggleIdiomaFR");

  searchInput.addEventListener("input", filterAndDisplayCards);
  searchInputAtt.addEventListener("input", filterAndDisplayCards);
  searchInputEff.addEventListener("input", filterAndDisplayCards);
  searchInputGlobal.addEventListener("input", filterAndDisplayCards);

  inkableSelect.addEventListener("change", filterAndDisplayCards);
  enchantedSelect.addEventListener("change", filterAndDisplayCards);

  invertOrderButton.addEventListener("click", function () {
    filterAndDisplayCards();
  });

  loadMoreButton.addEventListener("click", function () {
    setCardsDisplayed(getCardsDisplayed() + 10);
    filterAndDisplayCards();
  });

  loadMoreButton.addEventListener("touchstart", function (event) {
    event.preventDefault();
    setCardsDisplayed(getCardsDisplayed() + 10);
    filterAndDisplayCards();
  });

  loadAllButton.addEventListener("click", function () {
    setCardsDisplayed(cardsData.length);
    filterAndDisplayCards();
  });

  loadAllButton.addEventListener("touchstart", function (event) {
    event.preventDefault();
    setCardsDisplayed(cardsData.length);
    filterAndDisplayCards();
  });

  clearAllButton.addEventListener("click", function () {
    resetFilters();
    clearSearchFields();
  });

  inputElements.forEach((element) => {
    element.addEventListener("input", validateRange);
  });

  function clearSearchFields() {
    searchInput.value       = "";
    searchInputAtt.value    = "";
    searchInputEff.value    = "";
    searchInputGlobal.value = "";
  }

  // Idioma
  const idiomas = [
    { code: "EN", button: toggleIdiomaEN },
    { code: "FR", button: toggleIdiomaFR },
  ];

  idiomas.forEach(({ code, button }) => {
    button.addEventListener("click", function () {
      setIdioma(code);

      idiomas.forEach(({ button: btn }) => {
        if (btn === button) {
          btn.classList.add("activeIdioma");
          btn.style.backgroundColor = "#fff";
          btn.style.color = "#000";
        } else {
          btn.classList.remove("activeIdioma");
          btn.style.backgroundColor = "#000";
          btn.style.color = "#fff";
        }
      });

      fetchCardsData().then(() => {
        buildDynamicFilters();
        filterAndDisplayCards();
      });
    });
  });
}