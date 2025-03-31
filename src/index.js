// Importar las librerías
import { exec } from 'child_process'; //Python
import * as pdfjsLib from 'pdfjs-dist'; // Librería para trabajar con documentos PDF
import axios from 'axios'; // Para hacer peticiones HTTP

// Configuración del trabajador (worker) de PDF.js para procesar los PDFs en segundo plano
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Variable global para almacenar el texto extraído del PDF
let currentText = '';

// Función para anonimizar texto utilizando la API Flask de Google Colab
async function anonymizeTextWithPython(text) {
  try {
    // Hacemos la petición POST a la URL LOCAL que redirige a tu aplicación Flask
    const response = await axios.post('http://localhost:5000/anonymize', {
      text: text
    });

    // Verificamos si la respuesta fue exitosa
    if (response.status === 200) {
      // La respuesta de Flask contiene el texto anonimizado
      if (response.data && response.data.anonymizedText) {
        return response.data.anonymizedText;  
      } else {
        throw new Error('Respuesta inesperada del servidor Flask.');
      }
    } else {
      console.error('Error en la respuesta de Flask: Status', response.status);
      throw new Error('Error al recibir la respuesta de Flask');
    }
  } catch (error) {
    console.error('Error en la petición a Flask:', error);

    // Diferenciar entre un error de red y un error interno
    if (error.response) {
      // Errores provenientes de la respuesta (ej. código de estado 4xx o 5xx)
      console.error('Error de respuesta de Flask:', error.response.data);
      throw new Error(`Error de respuesta: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Errores cuando no se recibe respuesta
      console.error('No se recibió respuesta de Flask:', error.request);
      throw new Error('No se recibió respuesta del servidor Flask');
    } else {
      // Errores inesperados en la solicitud
      console.error('Error inesperado:', error.message);
      throw new Error('Error inesperado al hacer la solicitud');
    }
  }
}

// Evento que se activa al hacer clic en el botón para abrir un archivo PDF
document.getElementById('open-pdf').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

// Evento que se activa al hacer clic en el botón de búsqueda
document.getElementById('search-text').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input');
  searchInput.style.display = searchInput.style.display === 'none' ? 'block' : 'none';
  if (searchInput.style.display === 'block') {
    searchInput.focus();
  }
});

// Evento que se activa al escribir en el campo de búsqueda
document.getElementById('search-input').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const textArea = document.getElementById('extracted-text');
  const text = textArea.value;

  if (!searchTerm) {
    textArea.value = currentText;
    return;
  }

  const regex = new RegExp(searchTerm, 'gi');
  const highlightedText = text.replace(regex, (match) => `[${match}]`);
  textArea.value = highlightedText;
});

document.getElementById('anonymize-text').addEventListener('click', async () => {
  const textArea = document.getElementById('extracted-text');
  const text = textArea.value.trim();

  if (!text) {
      alert("Por favor, ingresa un texto antes de anonimizar.");
      return;
  }

  try {
      // Mostrar mensaje de carga
      Swal.fire({
          title: 'Anonimizando texto...',
          text: 'Por favor, espera mientras procesamos el texto.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });

      // Hacer la petición a Flask
      const response = await fetch('http://localhost:5000/anonymize', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: text })  // Enviar el texto extraído
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error desconocido: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();  // La respuesta contiene el texto anonimizado
      textArea.value = data.anonymizedText; // Actualiza el texto anonimizado

      // Cierra el mensaje de carga y muestra éxito
      Swal.close();
      Swal.fire({
          title: 'Texto Anonimizado',
          text: 'El texto ha sido anonimizado exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
      });

  } catch (error) {
      // Cierra el mensaje de carga
      Swal.close();

      // Muestra un alert con el error específico
      alert(`No se pudo anonimizar el texto: ${error.message}`);
  }
});

// Evento que se activa cuando el usuario selecciona un archivo PDF
document.getElementById('file-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const pdfData = new Uint8Array(this.result);
      const pdfUrl = URL.createObjectURL(
        new Blob([pdfData], { type: 'application/pdf' })
      );
      document.getElementById('pdf-iframe').src = pdfUrl;

      try {
        Swal.fire({
          title: 'Extrayendo texto del PDF...',
          text: 'Por favor, espera.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          textContent.items.forEach((item) => {
            text += item.str + ' ';
          });
        }

        currentText = text;
        document.getElementById('extracted-text').value = text;
        Swal.close();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: `No se puede extraer el texto del PDF: ${error.message}`,
          icon: 'error'
        });
        console.error('Error extrayendo texto del PDF:', error);
      }
    };
    fileReader.readAsArrayBuffer(file);
  } else {
    Swal.fire({
      title: 'Error',
      text: 'Por favor, selecciona un archivo PDF válido.',
      icon: 'error'
    });
  }
});

// Función para mostrar un mensaje en la interfaz
function showMessage(message, type) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.className = type;
}