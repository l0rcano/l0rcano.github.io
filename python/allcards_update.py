import os
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# --- Configuración ---
BASE_DIR = Path(__file__).parent.parent
JSON_URL = "https://lorcanajson.org/files/current/en/allCards.json"
LOCAL_JSON = BASE_DIR / "api" / "allcards.json"
MINIMAL_JSON = BASE_DIR / "api" / "allcards_minimal.json"
IMG_DIR = BASE_DIR / "resources" / "imgs"
INDEX_HTML = BASE_DIR / "index.html"
DECK_HTML = BASE_DIR / "deck.html"

# --- Funciones ---
def download_json():
    print("📥 Descargando JSON completo...")
    r = requests.get(JSON_URL)
    r.raise_for_status()
    data = r.json()

    LOCAL_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(LOCAL_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return data

def generate_minimal_json(data):
    print("🗂️ Generando JSON reducido para la web...")
    cards_min = []
    # Solo cartas de sets numerados del 1 al 8
    cards = [c for c in data["cards"] if c.get("setCode", "").isdigit() and 1 <= int(c["setCode"]) <= 8]

    total = len(cards)
    for i, c in enumerate(cards, start=1):
        image_file = f"{c['setCode']}-{str(c['number']).zfill(3)}.jpg"
        cards_min.append({
            "Artist": c.get("artistsText", ""),
            "Set_Name": data["sets"][c["setCode"]]["name"] if c.get("setCode") in data["sets"] else "",
            "Classifications": c.get("subtypesText", ""),
            "Date_Added": data["metadata"].get("generatedOn", ""),
            "Abilities": ", ".join(a.get("name", "") for a in c.get("abilities", [])),
            "Set_Num": int(c.get("setCode", 0)),
            "Color": c.get("color", ""),
            "Gamemode": "Lorcana",
            "Franchise": c.get("story", ""),
            "Image": f"resources/imgs/{image_file}",  # thumbnail
            "Cost": c.get("cost", ""),
            "Inkable": c.get("inkwell", False),
            "Name": c.get("fullName") or c.get("name", ""),
            "Type": c.get("type", ""),
            "Lore": c.get("lore", 0),
            "Rarity": c.get("rarity", ""),
            "Unique_ID": f"{c.get('setCode')}-{str(c.get('number')).zfill(3)}",
            "Card_Num": c.get("number"),
            "Body_Text": c.get("fullText", ""),
            "Willpower": c.get("willpower", 0),
            "Card_Variants": "",
            "Date_Modified": "",
            "Strength": c.get("strength", 0),
            "Set_ID": c.get("setCode"),
            "Enchanted": "Enchanted" in c.get("foilTypes", [])
        })
        percent = (i / total) * 100
        print(f"\rProcesando cartas: {i}/{total} ({percent:.1f}%)", end="")

    MINIMAL_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(MINIMAL_JSON, "w", encoding="utf-8") as f:
        json.dump(cards_min, f, separators=(',', ':'), ensure_ascii=False)
    print(f"\n✅ JSON reducido generado: {MINIMAL_JSON} ({len(cards_min)} cartas)")

def download_images(cards):
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    cards = [c for c in cards if c.get("setCode", "").isdigit() and 1 <= int(c["setCode"]) <= 8]
    total = len(cards)
    downloaded, skipped = 0, 0

    for idx, card in enumerate(cards, start=1):
        img_url = card["images"]["thumbnail"]
        img_path = IMG_DIR / f"{card['setCode']}-{str(card['number']).zfill(3)}.jpg"

        if os.path.exists(img_path):
            skipped += 1
        else:
            try:
                r = requests.get(img_url, stream=True)
                r.raise_for_status()
                with open(img_path, "wb") as f:
                    for chunk in r.iter_content(1024):
                        f.write(chunk)
                downloaded += 1
            except Exception as e:
                print(f"⚠️ Error con {img_url}: {e}")
        
        percent = (idx / total) * 100
        print(f"\r📸 Descargando thumbnails: {idx}/{total} ({percent:.1f}%)", end="")
    print(f"\n✅ Thumbnails nuevas: {downloaded}, ya existentes: {skipped}")

def update_html(html_file, sets):
    if not os.path.exists(html_file):
        print(f"⚠️ {html_file} no existe")
        return
    
    with open(html_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    set_div = soup.find("div", {"id": "set-name-filter"})
    if not set_div:
        print(f"⚠️ No se encontró div #set-name-filter en {html_file}")
        return

    set_div.clear()
    
    # Sets permitidos: numerados 1-10 + Winterspell (11)
    allowed_set_numbers = set(str(i) for i in range(1, 12))
    allowed_set_numbers.add("11")  # Winterspell
    # Quitar Q1 y Q2
    disallowed_sets = {"Q1", "Q2", "Fabled"}

    filtered_sets = [s for code, s in sets.items() 
                     if code not in disallowed_sets and str(s.get("number")) in allowed_set_numbers]
    sorted_sets = sorted(filtered_sets, key=lambda x: x["number"])

    for i, s in enumerate(sorted_sets):
        btn = soup.new_tag("button", **{"class": "set-name", "set_name": s["name"]})
        btn.string = s["name"]
        set_div.append(btn)
        if (i + 1) % 3 == 0:
            set_div.append(soup.new_tag("br"))
        percent = ((i + 1) / len(sorted_sets)) * 100
        print(f"\rActualizando sets en {html_file}: {i+1}/{len(sorted_sets)} ({percent:.1f}%)", end="")

    clear_btn = soup.new_tag("button", **{"class": "clear-set-button clearBtn"})
    clear_btn.string = "Esborra els filtres"
    set_div.append(clear_btn)

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(str(soup.prettify()))
    print(f"\n✅ {html_file} actualizado con sets permitidos")

# --- Main ---
def main():
    data = download_json()
    cards = data["cards"]
    sets = data["sets"]

    download_images(cards)
    generate_minimal_json(data)
    update_html(INDEX_HTML, sets)
    update_html(DECK_HTML, sets)
    print("🎉 Actualización completada.")

if __name__ == "__main__":
    main()
