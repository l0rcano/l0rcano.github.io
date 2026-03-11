import { displayCards, getCardsDisplayed } from './display.js';
import { sortAndDisplayCards } from './sorting.js';
import { applySearchFilters } from './search.js';
import { cardsData } from './api.js';

export function filterAndDisplayCards() {
  let cards = [...cardsData];
  cards = applyDomainFilter(cards);
  cards = applyTypeFilter(cards);
  cards = applySetFilter(cards);
  cards = applyRarityFilter(cards);
  cards = applyEnergyFilter(cards);
  cards = applySearchFilters(cards);
  sortAndDisplayCards(cards);
  updateCounter(cards.length);
}

function applyDomainFilter(cards) {
  const active = [...document.querySelectorAll('.domain-filter.active')]
    .map(b => b.getAttribute('data-domain'));
  if (!active.length) return cards;
  return cards.filter(c => c.Domain && c.Domain.some(d => active.includes(d)));
}

function applyTypeFilter(cards) {
  const active = [...document.querySelectorAll('.type-filter.active')]
    .map(b => b.getAttribute('data-type'));
  if (!active.length) return cards;
  return cards.filter(c => active.includes(c.Type));
}

function applySetFilter(cards) {
  const active = [...document.querySelectorAll('.set-filter.active')]
    .map(b => b.getAttribute('data-set'));
  if (!active.length) return cards;
  return cards.filter(c => active.includes(c.Set_ID));
}

function applyRarityFilter(cards) {
  const active = [...document.querySelectorAll('.rarity-filter.active')]
    .map(b => b.getAttribute('data-rarity'));
  if (!active.length) return cards;
  return cards.filter(c => active.includes(c.Rarity));
}

function applyEnergyFilter(cards) {
  const minEl = document.getElementById('min-value');
  const maxEl = document.getElementById('max-value');
  if (!minEl || !maxEl) return cards;
  const min = parseInt(minEl.textContent);
  const max = parseInt(maxEl.textContent);
  return cards.filter(c => {
    const e = c.Energy;
    if (e === null || e === undefined || e === '') return true; // cards without energy cost pass
    return e >= min && e <= max;
  });
}

function updateCounter(count) {
  const el = document.getElementById('results-count');
  if (el) el.textContent = `${count} cards`;
}

export function resetFilters() {
  document.querySelectorAll('.domain-filter,.type-filter,.set-filter,.rarity-filter').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('style');
  });
  const inkSel = document.getElementById('inkable-select');
  if (inkSel) inkSel.value = 'any';
  setDefaultEnergy();
}

export function validateRange() {
  const minInput = document.querySelector('.min-energy');
  const maxInput = document.querySelector('.max-energy');
  if (!minInput || !maxInput) return;
  let min = parseInt(minInput.value);
  let max = parseInt(maxInput.value);
  if (min > max) [min, max] = [max, min];
  document.getElementById('min-value').textContent = min;
  document.getElementById('max-value').textContent = max;
  filterAndDisplayCards();
}

function setDefaultEnergy() {
  const minInput = document.querySelector('.min-energy');
  const maxInput = document.querySelector('.max-energy');
  if (!minInput || !maxInput) return;
  minInput.value = 0;
  maxInput.value = 10;
  document.getElementById('min-value').textContent = 0;
  document.getElementById('max-value').textContent = 10;
}