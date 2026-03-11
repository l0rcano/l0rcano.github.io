import { cardsData, fetchCardsData } from './api.js';
import { buildDynamicFilters } from './filterBuilder.js';
import { filterAndDisplayCards } from './filters.js';
import { setupEventHandlers } from './eventHandlers.js';
import { generateDeckPdf } from './pdfProxy.js';

// ── Deck state ────────────────────────────────────────────────────
// Fixed slots (1 each)
let legend      = null;
let champion    = null;
// Fixed rows (up to 3 / 12)
let battlefields = [];  // max 3
let runes        = [];  // max 12 (3 copies each)
// Variable lists (max 3 copies each)
let mainDeck = [];
let sideDeck = [];

const MAIN_MAX   = 40;
const SIDE_MAX   = 8;
const BF_MAX     = 3;
const RUNE_MAX   = 12;
const MAX_COPIES = 3;
const RUNE_COPIES = 12; // max copies of a single rune (capped by RUNE_MAX total)

// Where new cards go: 'main' or 'side'
let addTarget = 'main';

// ── Computed ──────────────────────────────────────────────────────
function mainTotal()  { return mainDeck.reduce((a,c) => a + c.copies, 0) + (champion ? 1 : 0); }
function sideTotal()  { return sideDeck.reduce((a,c) => a + c.copies, 0); }
function runeTotal()  { return runes.reduce((a,c) => a + c.copies, 0); }

// ── Notifications ─────────────────────────────────────────────────
function notify(msg) {
  const box = document.getElementById('notification-container');
  const div = document.createElement('div');
  div.className = 'notification';
  div.innerHTML = msg;
  const x = document.createElement('span');
  x.className = 'notif-close'; x.textContent = '×';
  x.addEventListener('click', () => div.remove());
  div.appendChild(x);
  box.appendChild(div);
  setTimeout(() => div.classList.add('show'), 50);
  setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 4000);
}

// ── Add card ──────────────────────────────────────────────────────
function addCard(name, cleanName, image, type, orientation) {
  const t  = (type || '').trim();
  const cn = cleanName || name;
  const or = orientation || (t === 'Battlefield' ? 'battlefield' : 'portrait');

  // Legend
  if (t === 'Legend') {
    if (legend) { notify(`Legend slot taken by <strong>${legend.Name}</strong>.`); return; }
    legend = { Name: name, CleanName: cn, Image: image, Type: t, Orientation: or };
    renderDeck(); return;
  }

  // Champion Unit — first one fills the showcase slot, extras go to main/side
  if (t === 'Champion Unit') {
    if (!champion) {
      champion = { Name: name, CleanName: cn, Image: image, Type: t, Orientation: or };
      renderDeck(); return;
    }
    // If slot already filled, fall through to main/side logic below
  }

  // Battlefield
  if (t === 'Battlefield') {
    if (battlefields.length >= BF_MAX) { notify('Maximum 3 Battlefields.'); return; }
    if (battlefields.find(b => b.CleanName === cn)) { notify(`<strong>${name}</strong> already in Battlefields.`); return; }
    battlefields.push({ Name: name, CleanName: cn, Image: image, Type: t, Orientation: or });
    renderDeck(); return;
  }

  // Rune — goes to its own pool regardless of addTarget
  if (t === 'Rune') {
    if (runeTotal() >= RUNE_MAX) { notify('Maximum 12 Runes.'); return; }
    const ex = runes.find(c => c.CleanName === cn);
    if (ex) {
      if (ex.copies >= RUNE_COPIES) { notify(`Max ${RUNE_COPIES} copies of <strong>${cn}</strong>.`); return; }
      ex.copies++;
    } else {
      runes.push({ Name: name, CleanName: cn, Image: image, Type: t, Orientation: or, copies: 1 });
    }
    renderDeck(); return;
  }

  // Main or side depending on toggle
  if (addTarget === 'side') {
    if (sideTotal() >= SIDE_MAX) { notify(`Sidedeck full (${SIDE_MAX} cards).`); return; }
    const ex = sideDeck.find(c => c.CleanName === cn);
    if (ex) {
      if (ex.copies >= MAX_COPIES) { notify(`Max ${MAX_COPIES} copies.`); return; }
      ex.copies++;
    } else {
      sideDeck.push({ Name: name, CleanName: cn, Image: image, Type: t, Orientation: or, copies: 1 });
    }
  } else {
    if (mainTotal() >= MAIN_MAX) { notify(`Main deck full (${MAIN_MAX} cards).`); return; }
    const ex = mainDeck.find(c => c.CleanName === cn);
    if (ex) {
      if (ex.copies >= MAX_COPIES) { notify(`Max ${MAX_COPIES} copies.`); return; }
      ex.copies++;
    } else {
      mainDeck.push({ Name: name, CleanName: cn, Image: image, Type: t, Orientation: or, copies: 1 });
    }
  }
  renderDeck();
}

// ── Render ────────────────────────────────────────────────────────
function renderDeck() {
  const mt = mainTotal(), st = sideTotal(), rt = runeTotal();

  // Counters
  setChip('counter-main',  mt,  MAIN_MAX,  mt === MAIN_MAX);
  setChip('counter-runes', rt,  RUNE_MAX,  false);
  setChip('counter-side',  st,  SIDE_MAX,  false);

  // Section counts
  setText('bf-count',   `${battlefields.length}/3`);
  setText('rune-count', `${rt}/12`);
  setText('main-count', `${mt}/40`);
  setText('side-count', `${st}/8`);

  // Hints
  const hints = [];
  if (!legend)              hints.push('⚠ Missing Legend');
  if (!champion)            hints.push('⚠ Missing Champion Unit');
  if (battlefields.length < 3) hints.push(`⚠ Need ${3 - battlefields.length} more Battlefield(s)`);
  document.getElementById('deck-hints').innerHTML = hints.join(' &nbsp;·&nbsp; ');

  // Showcase (large cards)
  renderShowcase('showcase-legend',   legend,   'Legend');
  renderShowcase('showcase-champion', champion, 'Champion');

  // Thumb rows
  renderThumbRow('battlefield-row', battlefields, 'battlefield');
  renderThumbRow('rune-row',         runes,        'rune');

  // Card lists
  renderCardList('main-deck-list', mainDeck, 'main');
  renderCardList('side-deck-list', sideDeck, 'side');

  saveDeckAuto();
}

function setChip(id, val, max, full) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelector('b').textContent = val;
  el.className = 'counter-chip' + (full ? ' full' : '');
}
function setText(id, txt) {
  const el = document.getElementById(id); if (el) el.textContent = txt;
}

function renderShowcase(slotId, card, label) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  slot.innerHTML = '';
  if (!card) {
    slot.innerHTML = `<div class="showcase-empty">＋ ${label}</div>`;
    return;
  }
  const img = document.createElement('img');
  img.src = card.Image; img.alt = card.Name;
  img.className = 'showcase-img';

  const caption = document.createElement('div');
  caption.className = 'showcase-caption';
  caption.textContent = card.Name;

  const rm = document.createElement('button');
  rm.className = 'showcase-remove'; rm.textContent = '×';
  rm.addEventListener('click', () => {
    if (slotId === 'showcase-legend') legend = null;
    else champion = null;
    renderDeck();
  });

  slot.appendChild(img);
  slot.appendChild(caption);
  slot.appendChild(rm);
}

function renderThumbRow(containerId, cards, zone) {
  const row = document.getElementById(containerId);
  if (!row) return;
  row.innerHTML = '';

  if (!cards.length) {
    row.innerHTML = `<span class="thumb-empty">${zone === 'battlefield' ? 'No battlefields added' : 'No runes added'}</span>`;
    return;
  }

  cards.forEach((card, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'card-thumb-wrap';

    const stack = document.createElement('div');
    stack.className = 'card-thumb-stack';
    const copies = card.copies || 1;
    for (let j = 0; j < Math.min(copies, 3); j++) {
      const img = document.createElement('img');
      img.src = card.Image; img.alt = card.Name;
      img.style.cssText = `left:${j*4}px;top:${j*4}px`;
      stack.appendChild(img);
    }

    const name = document.createElement('span');
    name.className = 'thumb-name';
    name.textContent = card.Name;

    const controls = document.createElement('div');
    controls.className = 'thumb-controls';

    const rm = document.createElement('button');
    rm.className = 'thumb-btn remove'; rm.textContent = '−';
    rm.addEventListener('click', () => {
      if (zone === 'battlefield') {
        battlefields.splice(i, 1);
      } else {
        if (card.copies > 1) card.copies--;
        else runes.splice(i, 1);
      }
      renderDeck();
    });

    if (zone === 'rune') {
      const add = document.createElement('button');
      add.className = 'thumb-btn'; add.textContent = '+';
      add.addEventListener('click', () => {
        if (card.copies >= RUNE_COPIES) { notify(`Max ${RUNE_COPIES} copies.`); return; }
        if (runeTotal() >= RUNE_MAX)   { notify('Max 12 runes.'); return; }
        card.copies++; renderDeck();
      });
      const copyLabel = document.createElement('span');
      copyLabel.className = 'thumb-copies'; copyLabel.textContent = `×${card.copies}`;
      controls.append(rm, copyLabel, add);
    } else {
      controls.appendChild(rm);
    }

    wrap.appendChild(stack);
    wrap.appendChild(name);
    wrap.appendChild(controls);
    row.appendChild(wrap);
  });
}

function renderCardList(ulId, cards, zone) {
  const ul = document.getElementById(ulId);
  if (!ul) return;
  ul.innerHTML = '';

  if (!cards.length) {
    ul.innerHTML = `<li class="deck-list-empty">${zone === 'main' ? 'No cards yet — click a card to add' : 'Empty sidedeck'}</li>`;
    return;
  }

  cards.forEach((card, i) => {
    const li = document.createElement('li');
    li.className = 'deck-list-item';

    const thumb = document.createElement('img');
    thumb.src = card.Image; thumb.alt = card.Name;
    thumb.className = 'deck-list-thumb';

    const info = document.createElement('div');
    info.className = 'deck-list-info';
    info.innerHTML = `<span class="deck-list-name">${card.Name}</span><span class="deck-list-type">${card.Type}</span>`;

    const ctrl = document.createElement('div');
    ctrl.className = 'deck-list-ctrl';

    const rm = document.createElement('button');
    rm.className = 'copy-btn remove'; rm.textContent = '−';
    rm.addEventListener('click', () => {
      if (card.copies > 1) card.copies--;
      else {
        if (zone === 'main') mainDeck.splice(i, 1);
        else sideDeck.splice(i, 1);
      }
      renderDeck();
    });

    const copies = document.createElement('span');
    copies.className = 'deck-list-copies'; copies.textContent = `×${card.copies}`;

    const add = document.createElement('button');
    add.className = 'copy-btn'; add.textContent = '+';
    add.addEventListener('click', () => {
      if (card.copies >= MAX_COPIES) { notify('Max 3 copies.'); return; }
      if (zone === 'main' && mainTotal() >= MAIN_MAX) { notify('Main deck full.'); return; }
      if (zone === 'side' && sideTotal() >= SIDE_MAX) { notify('Sidedeck full.'); return; }
      card.copies++; renderDeck();
    });

    ctrl.append(rm, copies, add);
    li.append(thumb, info, ctrl);
    ul.appendChild(li);
  });
}

// ── Persist ───────────────────────────────────────────────────────
function saveDeckAuto() {
  try {
    localStorage.setItem('riftboundDeck', JSON.stringify(
      { legend, champion, battlefields, runes, mainDeck, sideDeck }
    ));
  } catch(e) {}
}

function loadDeck() {
  try {
    const s = localStorage.getItem('riftboundDeck');
    if (!s) return;
    const d = JSON.parse(s);
    legend       = d.legend       || null;
    champion     = d.champion     || null;
    battlefields = d.battlefields || [];
    runes        = d.runes        || [];
    mainDeck     = d.mainDeck     || [];
    sideDeck     = d.sideDeck     || [];
    renderDeck();
  } catch(e) {}
}

function clearDeck() {
  legend = null; champion = null;
  battlefields = []; runes = [];
  mainDeck = []; sideDeck = [];
  localStorage.removeItem('riftboundDeck');
  renderDeck();
}

// ── Export / Import ───────────────────────────────────────────────
function exportDeck() {
  const lines = [];
  const dn = document.getElementById('deck-name-input')?.value?.trim();
  if (dn) lines.push(`// ${dn}`, '');
  if (legend)   lines.push(`1 ${legend.Name}`);
  if (champion) lines.push(`1 ${champion.Name}`);
  battlefields.forEach(b => lines.push(`1 ${b.Name}`));
  mainDeck.forEach(c => lines.push(`${c.copies} ${c.Name}`));
  if (runes.length) {
    lines.push('', '// Runes');
    runes.forEach(c => lines.push(`${c.copies} ${c.Name}`));
  }
  if (sideDeck.length) {
    lines.push('', '// Sidedeck');
    sideDeck.forEach(c => lines.push(`${c.copies} ${c.Name}`));
  }
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => notify('Deck copied to clipboard ✓'))
    .catch(() => notify('Could not copy to clipboard.'));
}

function importDeck() {
  const text = document.getElementById('import-deck-input')?.value?.trim();
  if (!text) return;
  clearDeck();
  let zone = 'main';
  text.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith('//')) {
      const l = line.toLowerCase();
      if (l.includes('side')) zone = 'side';
      else if (l.includes('rune')) zone = 'rune';
      return;
    }
    const m = line.match(/^(\d+)\s+(.+)$/);
    if (!m) return;
    const copies = Math.min(parseInt(m[1]), MAX_COPIES);
    const name   = m[2].trim();
    const card   = cardsData.find(c => c.Name.toLowerCase() === name.toLowerCase());
    if (!card) { notify(`Not found: <strong>${name}</strong>`); return; }
    const prevTarget = addTarget;
    if (zone === 'side') addTarget = 'side'; else addTarget = 'main';
    for (let i = 0; i < copies; i++) addCard(card.Name, card.CleanName || card.Name, card.Image, card.Type, card.Orientation);
    addTarget = prevTarget;
  });
}

// ── Click handler on card grid ────────────────────────────────────
function setupCardClick() {
  document.getElementById('file-list')?.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    const name        = img.getAttribute('data-card-name');
    const cleanName   = img.getAttribute('data-card-cleanname') || name;
    const type        = img.getAttribute('data-card-type');
    const orientation = img.getAttribute('data-card-orientation') || 'portrait';
    const image       = img.src || img.getAttribute('data-src');
    if (name) addCard(name, cleanName, image, type, orientation);
  });
}

// ── Target toggle ─────────────────────────────────────────────────
function setupTargetToggle() {
  document.getElementById('target-main')?.addEventListener('click', () => {
    addTarget = 'main';
    document.getElementById('target-main').classList.add('active');
    document.getElementById('target-side').classList.remove('active');
  });
  document.getElementById('target-side')?.addEventListener('click', () => {
    addTarget = 'side';
    document.getElementById('target-side').classList.add('active');
    document.getElementById('target-main').classList.remove('active');
  });
}

// ── PDF ───────────────────────────────────────────────────────────
function buildPdfCards() {
  const all = [];
  if (legend)   all.push({ ...legend,   copies: 1 });
  if (champion) all.push({ ...champion, copies: 1 });
  battlefields.forEach(b => all.push({ ...b, copies: 1 }));
  runes.forEach(c => all.push(c));
  mainDeck.forEach(c => all.push(c));
  return all;
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupEventHandlers();
  setupCardClick();
  setupTargetToggle();

  document.getElementById('save-deck-button')?.addEventListener('click', () => { saveDeckAuto(); notify('Deck saved ✓'); });
  document.getElementById('clear-deck-button')?.addEventListener('click', clearDeck);
  document.getElementById('export-deck-button')?.addEventListener('click', exportDeck);
  document.getElementById('import-deck-button')?.addEventListener('click', importDeck);
  document.getElementById('generate-deck-pdf-button')?.addEventListener('click', () => {
    generateDeckPdf(buildPdfCards(), document.getElementById('notification-container'));
  });

  fetchCardsData()
    .then(() => {
      buildDynamicFilters();
      filterAndDisplayCards();
      document.getElementById('placeholder')?.remove();
      loadDeck();
      renderDeck();
    });
});