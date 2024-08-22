import requests
import os
from PIL import Image
from io import BytesIO
import re

# Directorio donde se guardarán las imágenes
output_dir = "shimmering_skies_images"
os.makedirs(output_dir, exist_ok=True)

# Función para limpiar el nombre de archivo
def clean_filename(filename):
    return re.sub(r'[\/:*?"<>|]', '', filename)

# URL de la API
url = "https://api.lorcana-api.com/cards/all"

# Realizamos la petición a la API
response = requests.get(url)
cards = response.json()

# Filtrar cartas del set "Shimmering Skies"
setNameToDownload = [card for card in cards if card["Set_Name"] == "Shimmering Skies"]

# Descargar y comprimir imágenes
for card in setNameToDownload:
    image_url = card["Image"]
    card_name = clean_filename(card["Name"].replace(" ", "_"))  # Limpia y reemplaza espacios por guiones bajos
    image_path = os.path.join(output_dir, f"{card_name}.png")
    
    # Comprobar si la imagen ya existe
    if os.path.exists(image_path):
        print(f"Imagen de {card_name} ya existe. Omite la descarga.")
        continue
    
    # Descargar la imagen
    image_response = requests.get(image_url)
    image = Image.open(BytesIO(image_response.content))
    
    # Comprimir y guardar la imagen
    image.save(image_path, format='PNG', optimize=True, quality=10)  # Comprime al máximo con calidad baja

    print(f"Imagen de {card_name} descargada y comprimida.")

print("Descarga y compresión completadas.")
