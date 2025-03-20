import json
from googletrans import Translator

# Inicializa el traductor
translator = Translator()

# Lee el archivo newSet.json
with open('newSet.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Función para traducir texto al francés
def traducir_texto(texto):
    if texto:
        try:
            traduccion = translator.translate(texto, src='en', dest='fr')
            return traduccion.text
        except Exception as e:
            print(f"Error al traducir '{texto}': {e}")
            return texto  # Devuelve el texto original en caso de error
    return texto

# Traduce los campos "Name", "Flavor_Text" y "Body_Text"
for i, carta in enumerate(data):
    if 'Name' in carta:
        carta['Name'] = traducir_texto(carta['Name'])
        print(f"Línea {i + 1}: 'Name' traducido a '{carta['Name']}'")
    if 'Flavor_Text' in carta:
        carta['Flavor_Text'] = traducir_texto(carta.get('Flavor_Text', ''))
        print(f"Línea {i + 1}: 'Flavor_Text' traducido a '{carta['Flavor_Text']}'")
    if 'Body_Text' in carta:
        carta['Body_Text'] = traducir_texto(carta.get('Body_Text', ''))
        print(f"Línea {i + 1}: 'Body_Text' traducido a '{carta['Body_Text']}'")

# Guarda el archivo traducido como newSetFR.json
with open('newSetFR.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("Traducción completada y guardada en 'newSetFR.json'.")
