const searchInput = document.getElementById("search-input");
const searchInputAtt = document.getElementById("search-input-att");
const searchInputEff = document.getElementById("search-input-eff");
const searchInputGlobal = document.getElementById("search-input-global");


export function applySearchFilters(cards) {
  cards = searchByName(cards);
  cards = searchByAttributes(cards);
  cards = searchByEffect(cards);
  cards = searchByGlobal(cards);
  return cards;
}

function searchByName(cards) {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    return cards.filter((card) => card.Name.toLowerCase().includes(searchTerm));
  }
  return cards;
}

function searchByAttributes(cards) {
  const searchTermAtt = searchInputAtt.value.toLowerCase();
  if (searchTermAtt) {
    return cards.filter((card) => {
      const abilities = card.Abilities ? card.Abilities.toLowerCase() : "";
      const bodyText = card.Body_Text ? card.Body_Text.toLowerCase() : "";
      const classifications = card.Classifications ? card.Classifications.toLowerCase() : "";
      return abilities.includes(searchTermAtt) || bodyText.includes(searchTermAtt) || classifications.includes(searchTermAtt);
    });
  }
  return cards;
}

function searchByEffect(cards) {
  const searchTermEff = searchInputEff.value.toLowerCase();
  if (searchTermEff) {
    return cards.filter((card) => {
      const bodyText = card.Body_Text ? card.Body_Text.toLowerCase() : "";
      return  bodyText.includes(searchTermEff);
    });
  }
  return cards;
}

function searchByGlobal(cards) {
  const searchTermGlobal = searchInputGlobal.value.toLowerCase();
  if (searchTermGlobal) {
    return cards.filter((card) => {
      const cardValues = Object.keys(card)
        .filter((key) => key !== "Flavor_Text" && key !== "Set_Num" && key !== "Card_Num")
        .map((key) => card[key])
        .join(" ")
        .toLowerCase();
      return cardValues.includes(searchTermGlobal);
    });
  }
  return cards;
}
