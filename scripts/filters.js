import { displayCards, getCardsDisplayed } from "./display.js";
import { sortAndDisplayCards } from "./sorting.js";
import { applySearchFilters } from "./search.js";
import { cardsData } from "./api.js";

// Les queries es fan lazy (dins cada funció) perquè els botons es generen
// dinàmicament per filterBuilder.js després de carregar la API.

const inkableSelect  = document.getElementById("inkable-select");
const enchantedSelect = document.getElementById("enchanted-select");

export function filterAndDisplayCards() {
  let filteredCards = cardsData;

  filteredCards = applyColorFilter(filteredCards);
  filteredCards = applyInkableFilter(filteredCards);
  filteredCards = applyEnchantedFilter(filteredCards);
  filteredCards = applyCostFilter(filteredCards);
  filteredCards = applyTypeFilter(filteredCards);
  filteredCards = applySetFilter(filteredCards);
  filteredCards = applyRarityFilter(filteredCards);

  filteredCards = applySearchFilters(filteredCards);
  sortAndDisplayCards(filteredCards);
  displayCards(filteredCards.slice(0, getCardsDisplayed()));
}

function applyColorFilter(cards) {
  const activeColors = Array.from(document.querySelectorAll(".color-filter.active"))
    .map(f => f.getAttribute("data-color"));
  if (activeColors.length > 0) {
    return cards.filter(card => activeColors.includes(card.Color));
  }
  return cards;
}

function applyInkableFilter(cards) {
  const inkableValue = inkableSelect.value;
  if (inkableValue !== "any") {
    const inkableBoolean = inkableValue === "true";
    return cards.filter(card => card.Inkable === inkableBoolean);
  }
  return cards;
}

function applyEnchantedFilter(cards) {
  const enchantedValue = enchantedSelect.value;
  if (enchantedValue !== "any") {
    const enchantedBoolean = enchantedValue === "true";
    return cards.filter(card => card.Enchanted === enchantedBoolean);
  }
  return cards;
}

function applyCostFilter(cards) {
  const minInk = parseInt(document.getElementById("min-value").innerHTML);
  const maxInk = parseInt(document.getElementById("max-value").innerHTML);
  return cards.filter(card => card.Cost >= minInk && card.Cost <= maxInk);
}

function applyTypeFilter(cards) {
  const activeTypes = Array.from(document.querySelectorAll(".type-filter.active"))
    .map(f => f.getAttribute("type"));
  if (activeTypes.length > 0) {
    return cards.filter(card => activeTypes.includes(card.Type));
  }
  return cards;
}

function applySetFilter(cards) {
  const activeSet = Array.from(document.querySelectorAll(".set-name.active"))
    .map(f => f.getAttribute("set_name"));
  if (activeSet.length > 0) {
    return cards.filter(card => activeSet.includes(card.Set_Name));
  }
  return cards;
}

function applyRarityFilter(cards) {
  const activeRarity = Array.from(document.querySelectorAll(".rarity-name.active"))
    .map(f => f.getAttribute("Rarity"));
  if (activeRarity.length > 0) {
    return cards.filter(card => activeRarity.includes(card.Rarity));
  }
  return cards;
}

export function resetFilters() {
  document.querySelectorAll(".color-filter, .type-filter, .set-name, .rarity-name").forEach(f => {
    f.classList.remove("active");
    f.style.backgroundColor = "#000";
    f.style.color = "#fff";
  });
  inkableSelect.value  = "any";
  enchantedSelect.value = "any";
  setDefaultRangeValues();
  filterAndDisplayCards();
}

export function validateRange() {
  let minInk = parseInt(document.querySelector(".min-ink").value);
  let maxInk = parseInt(document.querySelector(".max-ink").value);

  if (minInk > maxInk) {
    [minInk, maxInk] = [maxInk, minInk];
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
  if (rangeFill) rangeFill.style.width = "0%";
}