import requests
from PIL import Image, ImageOps
from io import BytesIO
import os
import re

# Crear un directorio para almacenar las imágenes descargadas
if not os.path.exists('lorcana_cards'):
    os.makedirs('lorcana_cards')

# Función para limpiar los nombres de archivo
def clean_filename(filename):
    return re.sub(r'[\/:*?"<>|]', '_', filename)

# Función para descargar una imagen desde una URL
def download_image(image_url, card_name):
    try:
        response = requests.get(image_url, stream=True)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            return img
        else:
            print(f"Error al descargar la imagen de {card_name}: {response.status_code}")
            return None
    except Exception as e:
        print(f"Excepción al descargar la imagen de {card_name}: {e}")
        return None

# Función para eliminar bordes blancos y reemplazarlos con negro
def remove_white_borders_and_add_black(img):
    # Convertir a escala de grises
    gray_img = img.convert("L")
    
    # Detectar el bbox de la imagen no blanca
    bbox = ImageOps.invert(gray_img).getbbox()
    
    if bbox:
        # Calcular el tamaño de la nueva imagen con fondo negro
        new_width = img.width
        new_height = img.height
        
        # Crear una nueva imagen con fondo negro del tamaño ajustado
        img_with_black_background = Image.new("RGB", (new_width, new_height), "black")
        
        # Recortar la región de la imagen no blanca
        img_no_white_borders = img.crop(bbox)
        
        # Calcular la posición para pegar la imagen recortada en el fondo negro
        paste_x = (new_width - img_no_white_borders.width) // 2
        paste_y = (new_height - img_no_white_borders.height) // 2
        
        # Pegar la imagen recortada en el fondo negro
        img_with_black_background.paste(img_no_white_borders, (paste_x, paste_y))
    else:
        # Si no se detecta bbox, simplemente poner la imagen original sobre fondo negro
        img_with_black_background = Image.new("RGB", img.size, "black")
        img_with_black_background.paste(img, (0, 0))
    
    return img_with_black_background
# Función para reducir la calidad y tamaño del archivo, asegurándose de que pese menos de 100 KB
def save_image_optimized(img, card_name, max_file_size_kb=100, quality_step=5):
    card_name = clean_filename(card_name)
    path = f"lorcana_cards/{card_name}.jpg"
    
    max_width = 800
    if img.width > max_width:
        img = img.resize((max_width, int(img.height * (max_width / img.width))), Image.Resampling.LANCZOS)

    quality = 85
    while quality > 10:
        img_byte_arr = BytesIO()
        img.convert('RGB').save(img_byte_arr, format='JPEG', quality=quality, optimize=True)
        file_size_kb = len(img_byte_arr.getvalue()) / 1024
        
        if file_size_kb <= max_file_size_kb:
            with open(path, 'wb') as f:
                f.write(img_byte_arr.getvalue())
            print(f"Imagen guardada en {path} con {round(file_size_kb, 2)} KB y calidad {quality}")
            return
        else:
            quality -= quality_step
    
    print(f"Advertencia: No se pudo reducir {card_name} por debajo de {max_file_size_kb} KB.")
    img.save(path, format='JPEG', quality=quality, optimize=True)

# Función principal para obtener todas las cartas y procesar las imágenes
def process_lorcana_images():
    url = "https://api.lorcana-api.com/cards/all"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            cards = response.json()
            
            for card in cards:
                card_name = card.get("Name", "unknown").replace(" ", "_")
                image_url = card.get("Image")
                
                if image_url:
                    img = download_image(image_url, card_name)
                    
                    if img:
                        # Eliminar bordes blancos y agregar bordes negros
                        img = remove_white_borders_and_add_black(img)
                        
                        # Guardar la imagen optimizada
                        save_image_optimized(img, card_name)
                    else:
                        print(f"No se pudo procesar la imagen de {card_name}")
                else:
                    print(f"No se encontró la URL de la imagen para {card_name}")
        else:
            print("Error al obtener las cartas desde la API.")
    except Exception as e:
        print(f"Excepción al conectar con la API: {e}")

# Ejecutar el proceso
process_lorcana_images()
