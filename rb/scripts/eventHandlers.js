import { filterAndDisplayCards, resetFilters, validateRange } from './filters.js';
import { getCardsDisplayed, setCardsDisplayed } from './display.js';
import { cardsData, fetchCardsData } from './api.js';
import { buildDynamicFilters } from './filterBuilder.js';

export function setupEventHandlers() {
  // Search inputs
  ['search-name','search-text','search-global','search-artist'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', filterAndDisplayCards);
  });

  // Load more / all
  document.getElementById('load-more-button')?.addEventListener('click', () => {
    setCardsDisplayed(getCardsDisplayed() + 20);
    filterAndDisplayCards();
  });
  document.getElementById('load-all-button')?.addEventListener('click', () => {
    setCardsDisplayed(cardsData.length);
    filterAndDisplayCards();
  });

  // Clear all
  document.getElementById('clear-all')?.addEventListener('click', () => {
    resetFilters();
    ['search-name','search-text','search-global','search-artist'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    filterAndDisplayCards();
  });

  // Range inputs
  document.querySelectorAll('.min-energy,.max-energy').forEach(el => {
    el.addEventListener('input', validateRange);
  });

  // Collapsible filter sections
  document.querySelectorAll('.filter-section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('data-target'));
      const isOpen = target?.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });
}
