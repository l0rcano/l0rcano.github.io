import { updateApiUrl } from "./lang.js";

export let cardsData = [];

const BASE_SET_URL = "https://lorcanajson.org/files/current/en/sets/setdata.";

async function fetchSetData(setNumber) {
  const url = `${BASE_SET_URL}${setNumber}.json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

function mapCards(data) {
  return (data.cards || []).map(card => ({
    Artist:          card.artistsText || "",
    Set_Name:        data.sets?.[card.setCode]?.name || "",
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
  }));
}

export async function fetchCardsData() {
  const allData = [];
  let start = 1;

  while (true) {
    const batch = Array.from({ length: 5 }, (_, i) => start + i);
    const results = await Promise.all(batch.map(n => fetchSetData(n)));
    
    const firstNull = results.findIndex(r => r === null);
    if (firstNull !== -1) {
      // Guardamos solo los válidos de este bloque
      allData.push(...results.slice(0, firstNull));
      break;
    }
    
    allData.push(...results);
    start += 5;
  }

  cardsData = allData.flatMap(data => mapCards(data));
  console.log(`Total: ${cardsData.length} cartes de ${allData.length} sets`);
  return cardsData;
}