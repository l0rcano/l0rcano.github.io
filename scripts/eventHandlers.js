import { filterAndDisplayCards, resetFilters, validateRange } from "./filters.js";
import { getCardsDisplayed, setCardsDisplayed } from "./display.js";
import { setIdioma, updateApiUrl } from "./lang.js";
import { cardsData, fetchCardsData  } from "./api.js";


let isOrderReversed = false;

export function setupEventHandlers() {
  const sortSelect = document.getElementById("sort-select");
  const colorFilters = document.querySelectorAll(".color-filter");
  const typeFilters = document.querySelectorAll(".type-filter");
  const setNameFilters = document.querySelectorAll(".set-name");
  const rarityNameFilters = document.querySelectorAll(".rarity-name");
  const searchInput = document.getElementById("search-input");
  const searchInputAtt = document.getElementById("search-input-att");
  const searchInputEff = document.getElementById("search-input-eff");
  const searchInputGlobal = document.getElementById("search-input-global");
  const inkableSelect = document.getElementById("inkable-select");
  const enchantedSelect = document.getElementById("enchanted-select");
  const invertOrderButton = document.getElementById("invert-order-button");
  const loadMoreButton = document.getElementById("load-more-button");
  const loadAllButton = document.getElementById("load-all-button");
  const clearAllButton = document.getElementById("clear-all");
  const clearFiltersButton = document.querySelector(".clear-filters-button");
  const clearTypesButton = document.querySelector(".clear-types-button");
  const clearSetButton = document.querySelector(".clear-set-button");
  const clearRarityButton = document.querySelector(".clear-rarity-button");
  const clearSearchButton = document.querySelector(".clear-search");
  const inputElements = document.querySelectorAll("input");
  const toggleIdiomaEN = document.getElementById("toggleIdiomaEN");
  const toggleIdiomaFR = document.getElementById("toggleIdiomaFR");
  

  colorFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      if (this.classList.contains("active")) {
        this.style.backgroundColor = this.getAttribute("btn-color"); 
        this.style.color = "#fff";
      } else {
        this.style.backgroundColor = '#000';
        this.style.color = "#fff";
      }
      filterAndDisplayCards();
    });
  });
  
  typeFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      if (this.classList.contains("active")) {
        this.style.backgroundColor = '#fff';
        this.style.color = "#000";
      } else {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      }
      filterAndDisplayCards();
    });
  });

  setNameFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      if (this.classList.contains("active")) {
        this.style.backgroundColor = '#fff';
        this.style.color = "#000";
      } else {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      }
      filterAndDisplayCards();
    });
  });
  
  rarityNameFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      if (this.classList.contains("active")) {
        this.style.backgroundColor = '#fff';
        this.style.color = "#000";
      } else {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      }
      filterAndDisplayCards();
    });
  });

  searchInput.addEventListener("input", filterAndDisplayCards);
  searchInputAtt.addEventListener("input", filterAndDisplayCards);
  searchInputEff.addEventListener("input", filterAndDisplayCards);
  searchInputGlobal.addEventListener("input", filterAndDisplayCards);

  inkableSelect.addEventListener("change", filterAndDisplayCards);
  enchantedSelect.addEventListener("change", filterAndDisplayCards);

  invertOrderButton.addEventListener("click", function () {
    isOrderReversed = !isOrderReversed;
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
    removeAllActiveClasses();
    clearSearchFields();
    filterAndDisplayCards();
  });

  clearFiltersButton.addEventListener("click", function () {
    resetSpecificFilters("color");
    filterAndDisplayCards();
  });

  clearTypesButton.addEventListener("click", function () {
    resetSpecificFilters("type");
    filterAndDisplayCards();
  });

  clearSetButton.addEventListener("click", function () {
    resetSpecificFilters("set");
    filterAndDisplayCards();
  });

  clearRarityButton.addEventListener("click", function () {
    resetSpecificFilters("rarity-name");
    filterAndDisplayCards();
  });

  // clearSearchButton.addEventListener("click", function () {
  //   clearSearchFields();
  //   filterAndDisplayCards();
  // });

  inputElements.forEach((element) => {
    element.addEventListener("input", validateRange);
  });

  function removeAllActiveClasses() {
    const allFilters = document.querySelectorAll(".color-filter, .type-filter, .set-name, .rarity-name");
    allFilters.forEach((filter) => {
      filter.classList.remove("active");
      filter.style.backgroundColor = "#000";
      filter.style.color = "#fff";
    });
  }

  function resetSpecificFilters(filterType) {
    let filters;
    if (filterType === "color") {
      filters = document.querySelectorAll(".color-filter");
    } else if (filterType === "type") {
      filters = document.querySelectorAll(".type-filter");
    } else if (filterType === "set") {
      filters = document.querySelectorAll(".set-name");
    } else if (filterType === "rarity-name") {
      filters = document.querySelectorAll(".rarity-name");
    }

    filters.forEach((filter) => {
      filter.classList.remove("active");
      filter.style.backgroundColor = "#000";
      filter.style.color = "#fff";
    });
  }

  function clearSearchFields() {
    searchInput.value = "";
    searchInputAtt.value = "";
    searchInputEff.value = "";
    searchInputGlobal.value = "";
  }

  toggleIdiomaEN.addEventListener("click", function () {
    setIdioma("en");
    updateContent();
});

toggleIdiomaFR.addEventListener("click", function () {
    setIdioma("fr");
    updateContent();
});

function updateContent() {
  fetchCardsData().then(() => {
      filterAndDisplayCards(); 
  });
}




}

