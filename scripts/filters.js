import { displayCards, getCardsDisplayed } from "./display.js";
import { sortAndDisplayCards } from "./sorting.js";
import { applySearchFilters } from "./search.js";
import { cardsData } from "./api.js";

const colorFilters = document.querySelectorAll(".color-filter");
const typeFilters = document.querySelectorAll(".type-filter");
const setNameFilters = document.querySelectorAll(".set-name");
const inkableSelect = document.getElementById("inkable-select");

export function filterAndDisplayCards() {
  let filteredCards = cardsData;

  filteredCards = applyColorFilter(filteredCards);
  filteredCards = applyInkableFilter(filteredCards);
  filteredCards = applyCostFilter(filteredCards);
  filteredCards = applyTypeFilter(filteredCards);
  filteredCards = applySetFilter(filteredCards);

  filteredCards = applySearchFilters(filteredCards);
  sortAndDisplayCards(filteredCards);
  displayCards(filteredCards.slice(0, getCardsDisplayed()));
}

function applyColorFilter(cards) {
  const activeColors = Array.from(colorFilters)
    .filter((filter) => filter.classList.contains("active"))
    .map((filter) => filter.getAttribute("data-color"));

  if (activeColors.length > 0) {
    return cards.filter((card) => activeColors.includes(card.Color));
  }
  return cards;
}

function applyInkableFilter(cards) {
  const inkableValue = inkableSelect.value;
  if (inkableValue !== "any") {
    const inkableBoolean = inkableValue === "true";
    return cards.filter((card) => card.Inkable === inkableBoolean);
  }
  return cards;
}

function applyCostFilter(cards) {
  const minInk = parseInt(document.getElementById("min-value").innerHTML);
  const maxInk = parseInt(document.getElementById("max-value").innerHTML);
  return cards.filter((card) => card.Cost >= minInk && card.Cost <= maxInk);
}

function applyTypeFilter(cards) {
  const activeTypes = Array.from(typeFilters)
    .filter((filter) => filter.classList.contains("active"))
    .map((filter) => filter.getAttribute("type"));

  if (activeTypes.length > 0) {
    return cards.filter((card) => activeTypes.includes(card.Type));
  }
  return cards;
}

function applySetFilter(cards) {
  const activeSet = Array.from(setNameFilters)
    .filter((filter) => filter.classList.contains("active"))
    .map((filter) => filter.getAttribute("set_name"));

  if (activeSet.length > 0) {
    return cards.filter((card) => activeSet.includes(card.Set_Name));
  }
  return cards;
}

export function resetFilters() {
  colorFilters.forEach((filter) => filter.classList.remove("active"));
  typeFilters.forEach((filter) => filter.classList.remove("active"));
  setNameFilters.forEach((filter) => filter.classList.remove("active"));
  inkableSelect.value = "any";
  setDefaultRangeValues();
  filterAndDisplayCards();
}

export function validateRange() {
  let minInk = parseInt(document.querySelector(".min-ink").value);
  let maxInk = parseInt(document.querySelector(".max-ink").value);

  if (minInk > maxInk) {
    let tempValue = maxInk;
    maxInk = minInk;
    minInk = tempValue;
  }

  document.getElementById("min-value").innerHTML = minInk;
  document.getElementById("max-value").innerHTML = maxInk;

  filterAndDisplayCards();
}

function setDefaultRangeValues() {
  const minRangeInput = document.querySelector(".min-ink");
  const maxRangeInput = document.querySelector(".max-ink");
  document.getElementById("min-value").innerHTML = 1;
  document.getElementById("max-value").innerHTML = 10;
  minRangeInput.value = 1;
  maxRangeInput.value = 10;

  const rangeFill = document.querySelector(".range-fill");
  rangeFill.style.width = "0%";
}
