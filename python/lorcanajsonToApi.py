import json
from datetime import datetime

# Función para transformar los datos de una carta
def transform_card_data(card):
    current_date_added = datetime.now().strftime("%Y-%m-%dT%H:%M")
    current_date_modified = datetime.now().strftime("%Y-%m-%d %H:%M:%S.0")

    # Manejo seguro de habilidades (abilities)
    abilities = card.get("abilities", [])
    ability_text = ""
    if abilities and isinstance(abilities, list) and len(abilities) > 0:
        ability_text = f"{abilities[0].get('name', '')} - {abilities[0].get('effect', '')}"
    
    return {
        "Artist": card.get("artistsText", ""),  # Si no tiene, asigna cadena vacía
        "Set_Name": "Archazia's Island",  # Nombre estático del set
        "Classifications": ", ".join(card.get("subtypes", [])),  # Asigna lista vacía si no tiene subtipos
        "Date_Added": current_date_added,
        "Set_Num": 6,  # Número de set estático
        "Color": card.get("color", ""),  # Si no tiene, asigna cadena vacía
        "Franchise": card.get("story", ""),  # Si no tiene, asigna cadena vacía
        "Image": card.get("images", {}).get("full", ""),  # Si no tiene, asigna cadena vacía
        "Cost": card.get("cost", 0),  # Si no tiene, asigna 0
        "Inkable": card.get("inkwell", False),  # Si no tiene, asigna False
        "Name": f"{card.get('name', '')} - {card.get('version', '')}",  # Si no tiene, asigna cadena vacía
        "Type": card.get("type", ""),  # Si no tiene, asigna cadena vacía
        "Lore": card.get("lore", 0),  # Si no tiene, asigna 0
        "Rarity": card.get("rarity", ""),  # Si no tiene, asigna cadena vacía
        "Flavor_Text": card.get("flavorText", ""),  # Si no tiene, asigna cadena vacía
        "Unique_ID": f"AZS-{int(card.get('number', 0)):03}",  # Si no tiene, asigna 0
        "Card_Num": card.get("number", 0),  # Si no tiene, asigna 0
        "Body_Text": ability_text,  # Si no tiene habilidades, será una cadena vacía
        "Willpower": card.get("willpower", 0),  # Si no tiene, asigna 0
        "Card_Variants": card.get("variants", ""),  # Si no tiene, asigna cadena vacía
        "Date_Modified": current_date_modified,
        "Strength": card.get("strength", 0),  # Si no tiene, asigna 0
        "Set_ID": "AZS",  # Set estático
        "Enchanted": "Enchanted" in card.get("fullName", "")  # Verifica si está "enchanted" en el nombre
    }

# Cargar el archivo JSON original
input_file = "api7.json"  # Asegúrate de que el archivo exista en el mismo directorio
output_file = "newSet.json"

with open(input_file, "r", encoding="utf-8") as file:
    original_data = json.load(file)

# Verificar que el archivo tenga el formato esperado
if not isinstance(original_data, dict) or "cards" not in original_data:
    raise ValueError("El archivo JSON no tiene el formato esperado. Asegúrate de que contenga una clave 'cards'.")

# Procesar solo las cartas dentro del campo "cards"
cards = original_data["cards"]
transformed_data = [transform_card_data(card) for card in cards]

# Guardar el archivo transformado
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(transformed_data, file, ensure_ascii=False, indent=2)

print(f"Archivo transformado guardado como '{output_file}'")
