import os

# Directorio que contiene las imágenes
directory = 'resources/img/en/'

# Archivo de salida
output_file = 'lista.txt'

# Abrir el archivo en modo de escritura
with open(output_file, 'w') as file:
    # Recorrer todos los archivos en el directorio
    for filename in os.listdir(directory):
        # Verificar si 'enchanted' está en el nombre del archivo
        if 'enchanted' in filename:
            # Escribir el nombre del archivo en el archivo de salida
            file.write(filename + '\n')

print(f"Lista de archivos con 'enchanted' guardada en {output_file}.")
