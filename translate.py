import json
from googletrans import Translator

# Inicializa el traductor
translator = Translator()

# Lee el archivo apiEN.json
with open('apiEN.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Función para traducir texto al francés
def traducir_texto(texto):
    if texto:
        traduccion = translator.translate(texto, src='en', dest='fr')
        return traduccion.text
    return texto

# Traduce los campos "Name", "Flavor_Text" y "Body_Text"
for carta in data:
    if 'Name' in carta:
        carta['Name'] = traducir_texto(carta['Name'])
    if 'Flavor_Text' in carta:
        carta['Flavor_Text'] = traducir_texto(carta.get('Flavor_Text', ''))
    if 'Body_Text' in carta:
        carta['Body_Text'] = traducir_texto(carta.get('Body_Text', ''))

# Guarda el archivo traducido como apiFR.json
with open('apiFR.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("Traducción completada y guardada en 'apiFR.json'.")
