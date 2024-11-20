import os
from PIL import Image
import numpy as np

# Carpetas de entrada y salida
input_folder = r'../resources/img/EN'  # Cambia esta ruta según la ubicación de tus imágenes
output_folder = r'./imgNegre'

# Crear la carpeta de salida si no existe
os.makedirs(output_folder, exist_ok=True)

def process_image(input_path, output_path):
    # Abrir imagen
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # Separar los canales
    r, g, b, a = data[..., 0], data[..., 1], data[..., 2], data[..., 3]

    # Detectar píxeles casi negros
    mask = (r < 20) & (g < 20) & (b < 20)

    # Convertir esos píxeles a negro puro
    data[..., 0][mask] = 0  # Canal rojo
    data[..., 1][mask] = 0  # Canal verde
    data[..., 2][mask] = 0  # Canal azul

    # Reconstruir la imagen y guardarla
    processed_img = Image.fromarray(data, "RGBA")
    processed_img = processed_img.convert("RGB")  # Convertir a RGB para guardarla en JPG

    # Obtener el tamaño inicial de la imagen
    initial_size = os.path.getsize(input_path)

    # Guardar la imagen procesada
    processed_img.save(output_path, "JPEG", optimize=True)

    # Obtener el tamaño final de la imagen
    final_size = os.path.getsize(output_path)

    return initial_size, final_size

# Obtener la lista de archivos en la carpeta de entrada
image_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

# Procesar cada archivo
total_files = len(image_files)
for i, image_file in enumerate(image_files, 1):
    input_path = os.path.join(input_folder, image_file)
    output_path = os.path.join(output_folder, os.path.splitext(image_file)[0] + ".jpg")

    # Procesar la imagen
    initial_size, final_size = process_image(input_path, output_path)

    # Mostrar el progreso
    print(f"Procesando ({i}/{total_files}): {image_file}")
    print(f"  Tamaño inicial: {initial_size / 1024:.2f} KB")
    print(f"  Tamaño final: {final_size / 1024:.2f} KB")
    print(f"  Porcentaje completado: {i / total_files * 100:.2f}%\n")

print("Procesamiento completado.")
