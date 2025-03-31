import re
from huggingface_hub import login
from transformers import AutoTokenizer, AutoModelForTokenClassification
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers.pipelines import TokenClassificationPipeline
from dotenv import load_dotenv
import os

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Obtener el token de Hugging Face desde las variables de entorno
hf_token = os.getenv('HUGGING_FACE_API_KEY')

# Verificar si el token se ha cargado correctamente
if not hf_token:
    raise ValueError("Hugging Face API key is missing. Please check your .env file.")

# Autenticación con Hugging Face
login(token=hf_token)

# Configurar Flask
app = Flask(__name__)
CORS(app)

# Cargar el modelo de anonimización
model_checkpoint = "BSC-LT/roberta_model_for_anonimization"
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
model = AutoModelForTokenClassification.from_pretrained(model_checkpoint)
pipe = TokenClassificationPipeline(model=model, tokenizer=tokenizer, aggregation_strategy="simple")

# Expresión regular para detectar números de teléfono
PHONE_REGEX = r"\+?\d{1,3}[-.\s]?\d{2,3}[-.\s]?\d{2,3}[-.\s]?\d{3,4}"

def anonymize_text(text):
    """Envuelve en marcadores únicos («anon» ... «/anon») nombres, organizaciones, lugares y teléfonos detectados."""
    
    # 1. Detectar entidades con el modelo
    entities = pipe(text)
    print(f"Entidades detectadas: {entities}")  # Debugging

    # 2. Crear lista de reemplazos con el formato «anon»...«/anon»
    replacements = []
    
    for entity in entities:
        start, end = entity['start'], entity['end']
        original_text = text[start:end]
        replacements.append((start, end, f"«anon»{original_text}«/anon»"))  # Usar marcadores únicos

    # 3. Detectar teléfonos con regex
    for match in re.finditer(PHONE_REGEX, text):
        start, end = match.start(), match.end()
        phone_number = text[start:end]
        replacements.append((start, end, f"«anon»{phone_number}«/anon»"))  # Usar marcadores únicos

    # 4. Ordenar reemplazos de atrás hacia adelante
    replacements.sort(reverse=True, key=lambda x: x[0])

    # 5. Aplicar reemplazos en el texto
    for start, end, label in replacements:
        text = text[:start] + label + text[end:]

    return text

# Ruta para anonimizar texto
@app.route('/anonymize', methods=['POST'])
def anonymize():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({"error": "Texto no proporcionado"}), 400

        anonymized_text = anonymize_text(text)
        return jsonify({"anonymizedText": anonymized_text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Correr en local
