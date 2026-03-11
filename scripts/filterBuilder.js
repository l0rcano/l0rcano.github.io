import { cardsData } from "./api.js";
import { filterAndDisplayCards } from "./filters.js";

// Color metadata: ordre fix i colors visuals
const COLOR_META = {
  Amethyst: { label: "Lila",    btnColor: "purple" },
  Emerald:  { label: "Verd",    btnColor: "green"  },
  Ruby:     { label: "Vermell", btnColor: "red"    },
  Steel:    { label: "Gris",    btnColor: "grey"   },
  Amber:    { label: "Ambar",   btnColor: "orange" },
  Sapphire: { label: "Blau",    btnColor: "blue"   },
};

// Rareses en ordre lògic
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Super Rare", "Legendary", "Enchanted"];

// Icones de rareses (rutes relatives als recursos existents)
const RARITY_ICONS = {
  Common:     "/resources/common.webp",
  Uncommon:   "/resources/uncommon.webp",
  Rare:       "/resources/rare.webp",
  "Super Rare": "/resources/superare.webp",
  Legendary:  "/resources/legendary.webp",
  Enchanted:  "/resources/enchanted.webp",
};

function applyActiveStyle(btn, isActive, btnColor = null) {
  if (isActive) {
    btn.style.backgroundColor = btnColor || "#fff";
    btn.style.color = btnColor ? "#fff" : "#000";
  } else {
    btn.style.backgroundColor = "#000";
    btn.style.color = "#fff";
  }
}

function makeToggleHandler(btn, btnColor = null) {
  btn.addEventListener("click", function () {
    this.classList.toggle("active");
    applyActiveStyle(this, this.classList.contains("active"), btnColor);
    filterAndDisplayCards();
  });
}

function addClearButton(container, selector, labelText) {
  const br = document.createElement("br");
  container.appendChild(br);
  const clearBtn = document.createElement("button");
  clearBtn.textContent = labelText;
  clearBtn.className = "clearBtn";
  clearBtn.addEventListener("click", () => {
    container.querySelectorAll(selector).forEach(btn => {
      btn.classList.remove("active");
      applyActiveStyle(btn, false);
    });
    filterAndDisplayCards();
  });
  container.appendChild(clearBtn);
}

function insertLineBreaks(container, items, perRow) {
  // Insereix <br> cada `perRow` botons (ignora els <br> i <button> de clear ja existents)
  const buttons = Array.from(container.querySelectorAll("button:not(.clearBtn)"));
  buttons.forEach((btn, i) => {
    if (i > 0 && i % perRow === 0) {
      container.insertBefore(document.createElement("br"), btn);
    }
  });
}

export function buildDynamicFilters() {
  buildColorFilters();
  buildTypeFilters();
  buildSetFilters();
  buildRarityFilters();
}

function buildColorFilters() {
  const container = document.getElementById("color-filters");
  if (!container) return;
  container.innerHTML = "";

  const colorsInData = new Set(cardsData.map(c => c.Color).filter(Boolean));

  Object.entries(COLOR_META).forEach(([color, meta], i) => {
    if (!colorsInData.has(color)) return;
    const btn = document.createElement("button");
    btn.className = "color-filter";
    btn.setAttribute("data-color", color);
    btn.setAttribute("btn-color", meta.btnColor);
    btn.textContent = meta.label;
    container.appendChild(btn);
    makeToggleHandler(btn, meta.btnColor);
  });

  insertLineBreaks(container, null, 3);
  addClearButton(container, ".color-filter", "Esborra els filtres");
}

function buildTypeFilters() {
  const container = document.getElementById("card-type");
  if (!container) return;
  container.innerHTML = "";

  const TYPE_LABELS = {
    Item:            "Item",
    Action:          "Acció",
    "Action - Song": "Cançó",
    Location:        "Ubicació",
    Character:       "Personatge",
  };

  const typesInData = [...new Set(cardsData.map(c => c.Type).filter(Boolean))].sort();

  typesInData.forEach(type => {
    const btn = document.createElement("button");
    btn.className = "type-filter";
    btn.setAttribute("type", type);
    btn.textContent = TYPE_LABELS[type] || type;
    container.appendChild(btn);
    makeToggleHandler(btn);
  });

  insertLineBreaks(container, null, 3);
  addClearButton(container, ".type-filter", "Esborra els filtres");
}

function buildSetFilters() {
  const container = document.getElementById("set-name-filter");
  if (!container) return;
  container.innerHTML = "";

  // Obtenim sets únics mantenint l'ordre d'aparició (que sol ser cronològic)
  const seen = new Set();
  const sets = cardsData
    .map(c => c.Set_Name)
    .filter(s => s && !seen.has(s) && seen.add(s));

  sets.forEach(setName => {
    const btn = document.createElement("button");
    btn.className = "set-name";
    btn.setAttribute("set_name", setName);
    btn.textContent = setName;
    container.appendChild(btn);
    makeToggleHandler(btn);
  });

  insertLineBreaks(container, null, 3);
  addClearButton(container, ".set-name", "Esborra els filtres");
}

function buildRarityFilters() {
  const container = document.getElementById("rarity-filter");
  if (!container) return;
  container.innerHTML = "";

  const raritiesInData = new Set(cardsData.map(c => c.Rarity).filter(Boolean));

  // Mostrem les rareses en ordre lògic; les desconegudes s'afegeixen al final
  const unknown = [...raritiesInData].filter(r => !RARITY_ORDER.includes(r));
  const ordered = [...RARITY_ORDER.filter(r => raritiesInData.has(r)), ...unknown];

  ordered.forEach(rarity => {
    const btn = document.createElement("button");
    btn.className = "rarity-name";
    btn.setAttribute("Rarity", rarity);

    if (RARITY_ICONS[rarity]) {
      const img = document.createElement("img");
      img.src = RARITY_ICONS[rarity];
      img.alt = rarity;
      btn.appendChild(img);
    } else {
      btn.textContent = rarity;
    }

    container.appendChild(btn);
    makeToggleHandler(btn);
  });

  insertLineBreaks(container, null, 3);
  addClearButton(container, ".rarity-name", "Esborra els filtres");
}