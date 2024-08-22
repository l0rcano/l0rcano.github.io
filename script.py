import requests
import os
from PIL import Image
from io import BytesIO
import re

# Directorio donde se guardarán las imágenes
output_dir = "new_set_images"
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
newSetName = [card for card in cards if card["Set_Name"] == "Shimmering Skies"]

# Descargar y comprimir imágenes
for card in newSetName:
    image_url = card["Image"]
    card_name = clean_filename(card["Name"].replace(" ", "_"))  # Limpia y reemplaza espacios por guiones bajos
    image_path = os.path.join(output_dir, f"{card_name}.jpg")
    
    # Comprobar si la imagen ya existe
    if os.path.exists(image_path):
        print(f"Imagen de {card_name} ya existe. Omite la descarga.")
        continue
    
    # Descargar la imagen
    image_response = requests.get(image_url)
    image = Image.open(BytesIO(image_response.content))
    
    # Convertir la imagen a modo RGB si no lo está (para asegurar compatibilidad con JPG)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Comprimir y guardar la imagen directamente en formato JPG
    image.save(image_path, format='JPEG', optimize=True, quality=10)  # Comprime con calidad baja

    print(f"Imagen de {card_name} descargada y comprimida en formato JPG.")

print("Descarga y compresión completadas.")
