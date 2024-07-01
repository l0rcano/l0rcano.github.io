import { displayCards, getCardsDisplayed } from "./display.js";
import { cardsData } from "./api.js";

const sortSelect = document.getElementById("sort-select");
const invertOrderButton = document.getElementById("invert-order-button");
let isOrderReversed = false;

sortSelect.addEventListener("change", () => sortAndDisplayCards(cardsData));
invertOrderButton.addEventListener("click", () => {
  isOrderReversed = !isOrderReversed;
  sortAndDisplayCards(cardsData);
});

export function sortAndDisplayCards(cards) {
  const sortBy = sortSelect.value;
  cards.sort((a, b) => {
    if (sortBy === "name") {
      return a.Name.localeCompare(b.Name) || a.Cost - b.Cost;
    } else if (sortBy === "color") {
      return a.Color.localeCompare(b.Color) || a.Cost - b.Cost || a.Name.localeCompare(b.Name);
    } else if (sortBy === "card-number") {
      return a.Set_Num - b.Set_Num || a.Card_Num - b.Card_Num;
    } else {
      return a.Cost - b.Cost || a.Name.localeCompare(b.Name);
    }
  });

  if (isOrderReversed) {
    cards.reverse();
  }

  displayCards(cards.slice(0, getCardsDisplayed()));
}
