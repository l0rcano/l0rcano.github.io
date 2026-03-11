import { updateApiUrl } from "./lang.js";

export let cardsData = [];

export function fetchCardsData() {
  const apiUrl = updateApiUrl();
  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      cardsData = data.cards.map(card => {
        return {
          Artist:          card.artistsText || "",
          Set_Name:        data.sets[card.setCode]?.name || "",
          Classifications: card.subtypesText || "",
          Date_Added:      data.metadata?.generatedOn || "",
          Abilities:       (card.keywordAbilities || []).join(", "),
          Set_Num:         parseInt(card.setCode, 10) || 0,
          Color:           card.color || "",
          Gamemode:        "Lorcana",
          Franchise:       card.story || "",
          Image:           card.images?.full || card.images?.thumbnail || "",
          Cost:            card.cost ?? 0,
          Inkable:         card.inkwell ?? false,
          Name:            card.fullName || card.name || "",
          Type:            card.type || "",
          Lore:            card.lore ?? 0,
          Rarity:          card.rarity || "",
          Unique_ID:       card.fullIdentifier || "",
          Card_Num:        card.number || 0,
          Body_Text:       card.fullText || "",
          Willpower:       card.willpower ?? 0,
          Strength:        card.strength ?? 0,
          Set_ID:          card.setCode || "",
          Enchanted:       (card.foilTypes || []).includes("Enchanted"),
          Flavor_Text:     card.flavorText || "",
        };
      });
      return cardsData;
    });
}