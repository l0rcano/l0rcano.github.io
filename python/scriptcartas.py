# https://lorcanajson.org/
# script per a baixar totes les fotos de la API_URL i guardarles al SAVE_DIR

import requests
from PIL import Image, ImageOps
from io import BytesIO
import os
import re

# URL de la API
API_URL = 'https://lorcanajson.org/files/current/en/sets/setdata.6.json'
SAVE_DIR = 'cartas_lorcana_set6'

# Crear carpeta si no existe
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# Función para limpiar los nombres de archivo
def clean_filename(filename):
    # Reemplazar caracteres especiales y espacios con guiones bajos
    return re.sub(r'[\/:*?"<>| ]+', '_', filename)

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

# Función para reducir la calidad y tamaño del archivo, asegurándose de que pese menos de 150 KB
def save_image_optimized(img, card_name, max_file_size_kb=160, quality_step=9):
    card_name = clean_filename(card_name)
    path = os.path.join(SAVE_DIR, f"{card_name}.jpg")
    
    max_width = 1500
    if img.width > max_width:
        img = img.resize((max_width, int(img.height * (max_width / img.width))), Image.Resampling.LANCZOS)

    quality = 99
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
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            data = response.json()
            print(f"Datos recibidos: {type(data)}")  # Mensaje de depuración para verificar el tipo de datos
            
            # Verificar que 'cards' sea una lista
            cards = data.get("cards", [])
            if isinstance(cards, list):
                seen_names = {}
                for card in cards:
                    card_name = card.get("fullName", "unknown")
                    clean_name = clean_filename(card_name)
                    
                    # Contar cuántas veces se ha visto este nombre
                    if clean_name in seen_names:
                        seen_names[clean_name] += 1
                        if seen_names[clean_name] > 1:
                            clean_name = f"{clean_name}_enchanted"
                    else:
                        seen_names[clean_name] = 1

                    image_url = card.get("images", {}).get("full")
                    
                    if image_url:
                        img = download_image(image_url, clean_name)
                        
                        if img:
                            # Eliminar bordes blancos y agregar bordes negros
                            img = remove_white_borders_and_add_black(img)
                            
                            # Guardar la imagen optimizada
                            save_image_optimized(img, clean_name)
                        else:
                            print(f"No se pudo procesar la imagen de {clean_name}")
                    else:
                        print(f"No se encontró la URL de la imagen para {clean_name}")
            else:
                print("La clave 'cards' no es una lista. Verifica la estructura del JSON.")
        else:
            print("Error al obtener las cartas desde la API.")
    except Exception as e:
        print(f"Excepción al conectar con la API: {e}")

# Ejecutar el proceso
process_lorcana_images()
