
# PDF Viewer and Text Extractor

## Descripción
Esta aplicación permite visualizar archivos PDF, extraer su texto y realizar anonimización del contenido utilizando una API basada en Flask. Proporciona una interfaz interactiva para cargar, buscar y procesar documentos de manera eficiente.

## Características
- **Carga de PDFs**: Permite abrir archivos PDF desde el sistema local.
- **Visualización de documentos**: Muestra el contenido del PDF en un visor integrado.
- **Extracción de texto**: Extrae automáticamente el texto de los documentos cargados.
- **Búsqueda en texto**: Permite buscar términos dentro del texto extraído.
- **Anonimización**: Utiliza una API en Flask para anonimizar datos sensibles dentro del texto.
- **Mensajes interactivos**: Utiliza SweetAlert2 para mostrar alertas y mensajes informativos.

## Requisitos Previos
Antes de ejecutar la aplicación, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (para ejecutar el frontend en JavaScript)
- Un servidor Flask corriendo en `http://localhost:5000`
- Un navegador compatible (Chrome, Firefox, Edge)

### Instalación del Servidor Flask
Si aún no tienes Flask configurado, sigue estos pasos:
```sh
# Instalar Flask (si no está instalado)
pip install flask

# Crear un archivo app.py con el siguiente código:
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/anonymize', methods=['POST'])
def anonymize():
    data = request.json
    text = data.get("text", "")
    anonymized_text = text.replace("Nombre", "[ANON]" )  # Ejemplo de anonimización
    return jsonify({"anonymizedText": anonymized_text})

if __name__ == '__main__':
    app.run(debug=True)
```

Luego, ejecuta el servidor con:
```sh
python app.py
```

## Instalación del Proyecto (Frontend)
1. Clona el repositorio:
   ```sh
   git clone https://github.com/usuario/repositorio.git
   cd repositorio
   ```
2. Instala las dependencias necesarias:
   ```sh
   npm install
   ```
3. Ejecuta la aplicación en un servidor local:
   ```sh
   npm start
   ```
4. Abre el archivo `index.html` en un navegador.

## Uso de la Aplicación
1. **Abrir un PDF**: Haz clic en "Abrir PDF" y selecciona un archivo.
2. **Visualización**: El PDF se mostrará en el visor integrado.
3. **Extracción de texto**: El contenido del PDF se extraerá automáticamente y aparecerá en el área de texto.
4. **Buscar en el texto**: Haz clic en "Buscar Texto" y escribe el término a buscar.
5. **Anonimizar**: Presiona "Anonimizar" para enviar el texto a la API Flask y recibir una versión anonimizada.

## Estructura del Proyecto
```
📂 proyecto
│── 📄 index.html       # Interfaz principal
│── 📄 index.js         # Lógica de la aplicación
│── 📄 styles.css       # Estilos de la interfaz
│── 📄 README.md        # Este archivo
│── 📂 node_modules     # Dependencias de Node.js
```

## Contribuciones
Si deseas mejorar la aplicación, puedes enviar un Pull Request con tus cambios. ¡Las contribuciones son bienvenidas!

## Licencia
Este proyecto está bajo la licencia MIT.

