import { fetchCardsData } from './api.js';
import { filterAndDisplayCards } from './filters.js';
import { setupEventHandlers } from './eventHandlers.js';
import { buildDynamicFilters } from './filterBuilder.js';

document.addEventListener('DOMContentLoaded', () => {
  setupEventHandlers();

  fetchCardsData()
    .then(() => {
      buildDynamicFilters();
      filterAndDisplayCards();
      document.getElementById('placeholder')?.remove();
    })
    .catch(err => {
      console.error('Failed to load card data:', err);
      const ph = document.getElementById('placeholder');
      if (ph) ph.innerHTML = `
        <div class="error-state">
          <p>⚠️ Could not load cards. Check your API proxy configuration.</p>
          <p class="error-detail">${err.message}</p>
        </div>`;
    });
});
