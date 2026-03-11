import { displayCards, getCardsDisplayed } from './display.js';

const sortSelect = document.getElementById('sort-select');
const invertBtn  = document.getElementById('invert-order-button');
let isReversed = false;

if (sortSelect) sortSelect.addEventListener('change', () => sortAndDisplayCards(_lastCards));
if (invertBtn)  invertBtn.addEventListener('click', () => {
  isReversed = !isReversed;
  sortAndDisplayCards(_lastCards);
});

let _lastCards = [];

export function sortAndDisplayCards(cards) {
  _lastCards = cards;
  const by = sortSelect?.value || 'name';
  const sorted = [...cards];

  sorted.sort((a, b) => {
    switch (by) {
      case 'name':    return a.Name.localeCompare(b.Name);
      case 'energy':  return (a.Energy ?? 99) - (b.Energy ?? 99) || a.Name.localeCompare(b.Name);
      case 'type':    return a.Type.localeCompare(b.Type) || a.Name.localeCompare(b.Name);
      case 'rarity': {
        const ORDER = ['Common','Uncommon','Rare','Epic','Legendary'];
        return (ORDER.indexOf(a.Rarity) - ORDER.indexOf(b.Rarity)) || a.Name.localeCompare(b.Name);
      }
      case 'set':     return (a.Card_Num - b.Card_Num);
      default:        return a.Name.localeCompare(b.Name);
    }
  });

  if (isReversed) sorted.reverse();
  displayCards(sorted.slice(0, getCardsDisplayed()));
}
