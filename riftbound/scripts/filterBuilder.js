import { cardsData } from './api.js';
import { filterAndDisplayCards } from './filters.js';

// Domain metadata: color identity of Riftbound
const DOMAIN_META = {
  Fury:   { color: '#c0392b', emoji: '🔴' },
  Calm:   { color: '#27ae60', emoji: '🟢' },
  Mind:   { color: '#2980b9', emoji: '🔵' },
  Body:   { color: '#e67e22', emoji: '🟠' },
  Chaos:  { color: '#8e44ad', emoji: '🟣' },
  Order:  { color: '#f1c40f', emoji: '🟡' },
};

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

function toggle(btn, activeColor) {
  btn.addEventListener('click', function () {
    this.classList.toggle('active');
    if (this.classList.contains('active') && activeColor) {
      this.style.setProperty('--active-color', activeColor);
    } else {
      this.style.removeProperty('--active-color');
    }
    filterAndDisplayCards();
  });
}

function clearBtn(container, selector, label) {
  const btn = document.createElement('button');
  btn.className = 'clear-group-btn';
  btn.textContent = label;
  btn.addEventListener('click', () => {
    container.querySelectorAll(selector).forEach(b => {
      b.classList.remove('active');
      b.style.removeProperty('--active-color');
    });
    filterAndDisplayCards();
  });
  container.appendChild(btn);
}

export function buildDynamicFilters() {
  buildDomainFilters();
  buildTypeFilters();
  buildSetFilters();
  buildRarityFilters();
}

function buildDomainFilters() {
  const container = document.getElementById('domain-filters');
  if (!container) return;
  container.innerHTML = '';

  // Get unique domains from data (flattened from arrays)
  const inData = new Set();
  cardsData.forEach(c => (c.Domain || []).forEach(d => inData.add(d)));

  // Show in known order first, then unknowns
  const known = Object.keys(DOMAIN_META).filter(d => inData.has(d));
  const unknown = [...inData].filter(d => !DOMAIN_META[d]);
  [...known, ...unknown].forEach(domain => {
    const meta = DOMAIN_META[domain] || { color: '#888' };
    const btn = document.createElement('button');
    btn.className = 'filter-btn domain-filter';
    btn.setAttribute('data-domain', domain);
    btn.style.setProperty('--domain-color', meta.color);
    btn.innerHTML = `<span class="domain-dot"></span>${domain}`;
    container.appendChild(btn);
    toggle(btn, meta.color);
  });

  clearBtn(container, '.domain-filter', 'Clear');
}

function buildTypeFilters() {
  const container = document.getElementById('type-filters');
  if (!container) return;
  container.innerHTML = '';

  const types = [...new Set(cardsData.map(c => c.Type).filter(Boolean))].sort();
  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn type-filter';
    btn.setAttribute('data-type', type);
    btn.textContent = type;
    container.appendChild(btn);
    toggle(btn, null);
  });

  clearBtn(container, '.type-filter', 'Clear');
}

function buildSetFilters() {
  const container = document.getElementById('set-filters');
  if (!container) return;
  container.innerHTML = '';

  const seen = new Set();
  cardsData.forEach(c => {
    if (c.Set_ID && !seen.has(c.Set_ID)) {
      seen.add(c.Set_ID);
      const btn = document.createElement('button');
      btn.className = 'filter-btn set-filter';
      btn.setAttribute('data-set', c.Set_ID);
      btn.textContent = c.Set_Name || c.Set_ID;
      container.appendChild(btn);
      toggle(btn, null);
    }
  });

  clearBtn(container, '.set-filter', 'Clear');
}

function buildRarityFilters() {
  const container = document.getElementById('rarity-filters');
  if (!container) return;
  container.innerHTML = '';

  const inData = new Set(cardsData.map(c => c.Rarity).filter(Boolean));
  const unknown = [...inData].filter(r => !RARITY_ORDER.includes(r));
  const ordered = [...RARITY_ORDER.filter(r => inData.has(r)), ...unknown];

  ordered.forEach(rarity => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn rarity-filter';
    btn.setAttribute('data-rarity', rarity);
    btn.textContent = rarity;
    container.appendChild(btn);
    toggle(btn, null);
  });

  clearBtn(container, '.rarity-filter', 'Clear');
}
