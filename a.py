import os
import re

# Ruta al directorio que contiene las imágenes
directory = 'resources/img/en'

# Función para reemplazar palabras específicas en un nombre de archivo
def replace_words(filename):
    # Definir patrones de palabras y sus reemplazos
    replacements = {
        r'\bthe\b': 'The',
        r'\bto\b': 'To',
        r'\bof\b': 'Of',
        r'\binto\b': 'Into',
        r'\bin\b': 'In',
        r'\ba\b': 'A'
    }
    
    # Reemplazar las palabras en el nombre del archivo
    for pattern, replacement in replacements.items():
        filename = re.sub(pattern, replacement, filename, flags=re.IGNORECASE)
    
    return filename

# Recorre todos los archivos en el directorio
for filename in os.listdir(directory):
    # Cambia guiones bajos por espacios para el reemplazo
    formatted_filename = filename.replace('_', ' ')
    
    # Reemplaza las palabras en el nombre del archivo
    new_filename = replace_words(formatted_filename)
    
    # Cambia espacios por guiones bajos para el nuevo nombre de archivo
    new_filename = new_filename.replace(' ', '_')
    
    # Solo renombrar si el nombre ha cambiado
    if filename != new_filename:
        # Ruta completa al archivo actual y al nuevo archivo
        old_path = os.path.join(directory, filename)
        new_path = os.path.join(directory, new_filename)
        
        # Renombra el archivo
        os.rename(old_path, new_path)
        
        print(f'Renombrado: {filename} -> {new_filename}')
