// // https://lorcanajson.org/
// import { getIdioma, updateApiUrl } from "./lang.js";

// // const apiUrl = `../api${idioma}.json`;
// export let cardsData = [];

// function cleanFilename(filename) {
//   return filename.replace(/[\\/*?:"<>|]/g, '_').replace(/\s+/g, '_');
// }

// export function fetchCardsData() {
//   const apiUrl = updateApiUrl();
//   return fetch(apiUrl)
//     .then((response) => response.json())
//     .then((data) => {
//       cardsData = data.map(card => {
//         const cardName = cleanFilename(card.Name);
//         card.Image = `resources/img/${getIdioma()}/${cardName}.jpg`;
//         return card;
//       });
//       return cardsData;
//     });
// }

import { updateApiUrl } from "./lang.js";

export let cardsData = [];

export function fetchCardsData() {
  const apiUrl = updateApiUrl();
  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data.cards.map(card => ({
        Artist: card.artistsText || "",
        Set_Name: data.sets[card.setCode]?.name || "",
        Classifications: card.subtypesText || "",
        Date_Added: data.metadata?.generatedOn || "", 
        Abilities: (card.abilities || []).map(a => a.name).join(", "),
        Set_Num: parseInt(card.setCode, 10) || 0,
        Color: card.color || "",
        Gamemode: "Lorcana",
        Franchise: card.story || "",
        Image: card.images?.full || "",
        Cost: card.cost ?? "",
        Inkable: card.inkwell ?? false,
        Name: card.fullName || card.name || "",
        Type: card.type || "",
        Lore: card.lore ?? 0,
        Rarity: card.rarity || "",
        Unique_ID: `${card.setCode}-${String(card.number).padStart(3, "0")}`,
        Card_Num: card.number,
        Body_Text: card.fullText || "",
        Willpower: card.willpower ?? 0,
        Card_Variants: "",
        Date_Modified: "",
        Strength: card.strength ?? 0,
        Set_ID: card.setCode,
        Enchanted: (card.foilTypes || []).includes("Enchanted"),
      }));
      return cardsData;
    });
}
