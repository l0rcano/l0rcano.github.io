import { cardsData, fetchCardsData } from './api.js';
import { buildDynamicFilters } from './filterBuilder.js';
import { filterAndDisplayCards } from './filters.js';
import { generateDeckPdf } from './pdfProxy.js';

document.addEventListener('DOMContentLoaded', () => {
  const deckList    = document.getElementById('deck-list');
  const deckTitle   = document.getElementById('deck-title');
  const notifBox    = document.getElementById('notification-container');
  const MAX_COPIES  = 3;
  const DECK_SIZE   = 40;
  let deck = [];

  // Load deck from localStorage
  function loadDeck() {
    try {
      const saved = localStorage.getItem('riftboundDeck');
      if (saved) { deck = JSON.parse(saved); renderDeck(); }
    } catch(e) { deck = []; }
  }

  function saveDeck() {
    localStorage.setItem('riftboundDeck', JSON.stringify(deck));
    showNotification('Deck saved ✓');
  }

  function clearDeck() {
    deck = [];
    renderDeck();
    localStorage.removeItem('riftboundDeck');
  }

  function totalCards() { return deck.reduce((a, c) => a + c.copies, 0); }

  function renderDeck() {
    deckList.innerHTML = '';
    const total = totalCards();
    deckTitle.textContent = `Your Deck (${total}/${DECK_SIZE})`;
    deckTitle.className = total === DECK_SIZE ? 'deck-title full' : 'deck-title';

    deck.forEach((card, i) => {
      const li = document.createElement('li');
      li.className = 'deck-card';

      // Stacked images
      const stack = document.createElement('div');
      stack.className = 'deck-card-stack';
      for (let j = 0; j < card.copies; j++) {
        const img = document.createElement('img');
        img.src = card.Image;
        img.alt = card.Name;
        img.style.cssText = `left:${j*8}px;top:${j*8}px`;
        stack.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'deck-card-info';

      const nameEl = document.createElement('p');
      nameEl.className = 'deck-card-name';
      nameEl.textContent = `${card.Name}`;

      const copyEl = document.createElement('p');
      copyEl.className = 'deck-card-copies';
      copyEl.textContent = `×${card.copies}`;

      const controls = document.createElement('div');
      controls.className = 'deck-card-controls';

      const addBtn = document.createElement('button');
      addBtn.textContent = '+';
      addBtn.className = 'copy-btn';
      addBtn.addEventListener('click', () => {
        if (card.copies >= MAX_COPIES) {
          showNotification(`Max ${MAX_COPIES} copies per card.`);
          return;
        }
        if (totalCards() >= DECK_SIZE) {
          showNotification(`Deck is full (${DECK_SIZE} cards).`);
          return;
        }
        card.copies++;
        renderDeck();
      });

      const rmBtn = document.createElement('button');
      rmBtn.textContent = '−';
      rmBtn.className = 'copy-btn remove';
      rmBtn.addEventListener('click', () => {
        if (card.copies > 1) { card.copies--; }
        else { deck.splice(i, 1); }
        renderDeck();
      });

      controls.appendChild(rmBtn);
      controls.appendChild(addBtn);
      info.appendChild(nameEl);
      info.appendChild(copyEl);
      info.appendChild(controls);
      li.appendChild(stack);
      li.appendChild(info);
      deckList.appendChild(li);
    });
  }

  function addCardToDeck(name, image) {
    const existing = deck.find(c => c.Name === name);
    if (existing) {
      if (existing.copies >= MAX_COPIES) {
        showNotification(`Max ${MAX_COPIES} copies of "${name}".`);
        return;
      }
      if (totalCards() >= DECK_SIZE) {
        showNotification(`Deck is full (${DECK_SIZE} cards).`);
        return;
      }
      existing.copies++;
    } else {
      if (totalCards() >= DECK_SIZE) {
        showNotification(`Deck is full (${DECK_SIZE} cards).`);
        return;
      }
      deck.push({ Name: name, Image: image, copies: 1 });
    }
    renderDeck();
  }

  // Click on card in browse list adds to deck
  document.getElementById('file-list')?.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    const name  = img.getAttribute('data-card-name');
    const image = img.src || img.getAttribute('data-src');
    if (name) addCardToDeck(name, image);
  });

  // Export deck as text
  document.getElementById('export-deck-button')?.addEventListener('click', () => {
    const text = deck.map(c => `${c.copies} ${c.Name}`).join('\n');
    navigator.clipboard.writeText(text)
      .then(() => showNotification('Deck copied to clipboard ✓'))
      .catch(() => showNotification('Could not copy to clipboard.'));
  });

  // Import deck from textarea
  document.getElementById('import-deck-button')?.addEventListener('click', () => {
    const text = document.getElementById('import-deck-input')?.value?.trim();
    if (!text) return;
    deck = [];
    text.split('\n').forEach(line => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) return;
      const copies = Math.min(parseInt(match[1]), MAX_COPIES);
      const name   = match[2].trim();
      const cardData = cardsData.find(c => c.Name.toLowerCase() === name.toLowerCase());
      if (cardData) {
        deck.push({ Name: cardData.Name, Image: cardData.Image, copies });
      } else {
        showNotification(`Card not found: <strong>${name}</strong>`);
      }
    });
    renderDeck();
  });

  document.getElementById('save-deck-button')?.addEventListener('click', saveDeck);
  document.getElementById('clear-deck-button')?.addEventListener('click', clearDeck);
  document.getElementById('generate-deck-pdf-button')?.addEventListener('click', () => {
    generateDeckPdf(deck, notifBox);
  });

  function showNotification(msg) {
    const div = document.createElement('div');
    div.className = 'notification';
    div.innerHTML = msg;
    const x = document.createElement('span');
    x.className = 'notif-close';
    x.textContent = '×';
    x.addEventListener('click', () => div.remove());
    div.appendChild(x);
    notifBox.appendChild(div);
    setTimeout(() => div.classList.add('show'), 50);
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 5000);
  }

  // Init
  fetchCardsData().then(() => {
    buildDynamicFilters();
    filterAndDisplayCards();
    loadDeck();
  });
});
