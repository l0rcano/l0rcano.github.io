import { cardsData } from './api.js';
import { filterAndDisplayCards } from './filters.js';

const DOMAIN_META = {
  Fury:   { color: '#c0392b' },
  Calm:   { color: '#27ae60' },
  Mind:   { color: '#2980b9' },
  Body:   { color: '#e67e22' },
  Chaos:  { color: '#8e44ad' },
  Order:  { color: '#f1c40f' },
};

// Rarities shown in filter UI (skip print/collector variants)
const RARITY_ORDER   = ['Common', 'Uncommon', 'Rare', 'Epic'];
const RARITY_EXCLUDE = ['Alternate Art', 'Overnumbered', 'Showcase'];

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

  const inData = new Set();
  cardsData.forEach(c => (c.Domain || []).forEach(d => inData.add(d)));

  const known  = Object.keys(DOMAIN_META).filter(d => inData.has(d));
  const unknown = [...inData].filter(d => !DOMAIN_META[d]);

  [...known, ...unknown].forEach(domain => {
    const meta = DOMAIN_META[domain] || { color: '#888' };
    const btn  = document.createElement('button');
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

  // Use FullType for display but Type for filtering (first segment)
  const seen = new Set();
  cardsData.forEach(c => { if (c.Type) seen.add(c.Type); });
  const types = [...seen].sort();

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

  const seen = new Map();
  cardsData.forEach(c => {
    if (c.Set_ID && !seen.has(c.Set_ID)) seen.set(c.Set_ID, c.Set_Name);
  });

  seen.forEach((name, id) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn set-filter';
    btn.setAttribute('data-set', id);
    btn.textContent = name;
    container.appendChild(btn);
    toggle(btn, null);
  });

  clearBtn(container, '.set-filter', 'Clear');
}

function buildRarityFilters() {
  const container = document.getElementById('rarity-filters');
  if (!container) return;
  container.innerHTML = '';

  const inData = new Set(cardsData.map(c => c.Rarity).filter(Boolean));

  // Show gameplay rarities in order, skip print variants
  const ordered = RARITY_ORDER.filter(r => inData.has(r));

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