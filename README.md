# PDF Anonymizer

Esta aplicación permite extraer texto de archivos PDF, buscar en el texto extraído y anonimizarlo utilizando un modelo de procesamiento de lenguaje natural.

## Autores
Desarrollado por **Samuel Espejo Naranjo** y **Diego Acosta De Goñi**.

## Características
- Carga y visualización de archivos PDF.
- Extracción de texto desde los documentos.
- Búsqueda de palabras dentro del texto extraído.
- Anonimización de nombres, organizaciones, lugares y números de teléfono utilizando un modelo de Hugging Face.

## Requisitos Previos
Antes de ejecutar la aplicación, asegúrate de tener instalados los siguientes requisitos:

- [Node.js](https://nodejs.org/) y npm
- [Python](https://www.python.org/) y pip
- Flask y sus dependencias
- Hugging Face Transformers
- pdf.js para la extracción de texto

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tuusuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. Instala las dependencias de Python:
   ```sh
   pip install -r requirements.txt
   ```

3. Instala las dependencias de Node.js:
   ```sh
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto y agrega tu clave de API de Hugging Face:
   ```sh
   HUGGING_FACE_API_KEY=tu_api_key
   ```

## Uso

### Iniciar el Servidor Flask
Ejecuta el servidor Flask para manejar la anonimización de texto:
```sh
python src/backend.py
```

### Iniciar la Aplicación Web
Ejecuta la aplicación frontend:
```sh
npm start
```

Luego, abre `http://localhost:3000` en tu navegador.

## Estructura del Proyecto
```
📂 V-Local-EditorPDF
│-- 📂 .cache (Archivos de caché de compilación)
│-- 📂 dist (Archivos compilados y listos para producción)
│-- 📂 node_modules (Dependencias de Node.js)
│-- 📂 PDF_Prueba (Carpeta para archivos PDF de prueba)
│-- 📂 src (Código fuente del proyecto)
│   │-- backend.py (Servidor Flask para la anonimización)
│   │-- index.html (Interfaz de usuario)
│   │-- index.js (Lógica de la aplicación)
│   │-- styles.css (Estilos de la interfaz)
│-- .env (Archivo de configuración con claves de API)
│-- .gitignore (Archivos ignorados en Git)
│-- package-lock.json (Gestión de versiones de dependencias)
│-- package.json (Configuración del proyecto Node.js)
│-- README.md (Este archivo)
```

## Contribuciones
Si deseas mejorar la aplicación, ¡las contribuciones son bienvenidas! Por favor, haz un fork del repositorio y envía un pull request.

## Licencia
Este proyecto está bajo la licencia MIT.

