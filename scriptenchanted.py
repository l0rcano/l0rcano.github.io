import json
import os

def load_json(filename):
    with open(filename, 'r') as file:
        return json.load(file)

def save_json(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

def clean_filename(filename):
    return filename.replace(' ', '_').replace('-', '_').replace('/', '_').replace('\\', '_').replace(':', '_').replace('?', '_').replace('"', '_').replace('<', '_').replace('>', '_').replace('|', '_')

def process_cards(list_filename, api_filename, output_filename):
    # Cargar los datos de la API y de la lista de cartas
    api_data = load_json(api_filename)
    with open(list_filename, 'r') as file:
        list_cards = file.read().strip().split('\n')

    # Crear un diccionario para acceder fácilmente a la información de la API por nombre
    api_dict = {clean_filename(card['Name']).lower(): card for card in api_data}

    output_data = []
    
    for card_filename in list_cards:
        # Extraer el nombre base del archivo (sin la palabra "enchanted" ni la extensión)
        card_name = card_filename.replace('_enchanted.jpg', '').replace('_', ' ').replace('-', ' ')
        # Convertir el nombre a minúsculas y limpiar el nombre para coincidir con el formato en la API
        card_key = clean_filename(card_name).lower()
        
        if card_key in api_dict:
            # Obtener la información de la carta
            card_info = api_dict[card_key]
            # Añadir "Enchanted" al nombre de la carta
            card_info['Name'] += ' Enchanted'
            # Actualizar la ruta de la imagen
            card_info['Image'] = f'resources/img/en/{clean_filename(card_info["Name"])}.jpg'
            output_data.append(card_info)
        else:
            print(f'No se encontró información para: {card_name}')
    
    # Guardar los datos procesados en el archivo de salida
    save_json(output_data, output_filename)

# Rutas a los archivos
list_filename = 'lista.txt'
api_filename = 'api.json'
output_filename = 'output.json'

# Procesar las cartas
process_cards(list_filename, api_filename, output_filename)
