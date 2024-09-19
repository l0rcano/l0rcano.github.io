import json

# Función para convertir el valor del campo "Name" a minúsculas
def convert_name_to_lowercase(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "Name" and isinstance(value, str):
                data[key] = value.lower()
            elif isinstance(value, dict):
                convert_name_to_lowercase(value)
            elif isinstance(value, list):
                for item in value:
                    convert_name_to_lowercase(item)
    elif isinstance(data, list):
        for item in data:
            convert_name_to_lowercase(item)

def process_json_file(input_file, output_file):
    # Leer el archivo JSON
    with open(input_file, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Convertir el valor de "Name" a minúsculas
    convert_name_to_lowercase(data)
    
    # Guardar el archivo JSON modificado
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

# Nombres de los archivos de entrada y salida
input_file = 'api.json'
output_file = 'api_modified.json'

# Procesar el archivo JSON
process_json_file(input_file, output_file)
