import * as pdfjsLib from 'pdfjs-dist'; // Librería para trabajar con documentos PDF
import axios from 'axios'; // Para hacer peticiones HTTP

// Configuración del trabajador (worker) de PDF.js para procesar los PDFs en segundo plano
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

let currentText = ''; // Variable global para almacenar el texto extraído del PDF

// Función para anonimizar el texto (subrayar en rojo usando marcadores únicos en el backend)
async function anonymizeTextWithPython(text) {
  try {
    const response = await axios.post('http://localhost:5000/anonymize', {
      text: text
    });

    if (response.status === 200 && response.data && response.data.anonymizedText) {
      return response.data.anonymizedText;
    } else {
      throw new Error('Respuesta inesperada del servidor Flask.');
    }
  } catch (error) {
    console.error('Error al intentar anonimizar el texto:', error);
    throw new Error('Error al intentar anonimizar el texto.');
  }
}

// Evento para abrir un PDF
document.getElementById('open-pdf').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

// Evento al seleccionar un PDF
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
          didOpen: () => { Swal.showLoading(); }
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
        document.getElementById('extracted-text').textContent = text;
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

// Evento para anonimizar el texto
document.getElementById('anonymize-text').addEventListener('click', async () => {
  const textArea = document.getElementById('extracted-text');
  const text = textArea.textContent.trim();

  if (!text) {
    alert("Por favor, ingresa un texto antes de anonimizar.");
    return;
  }

  try {
    Swal.fire({
      title: 'Anonimizando texto...',
      text: 'Por favor, espera mientras procesamos el texto.',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const anonymizedText = await anonymizeTextWithPython(text);
    // Reemplazar los marcadores únicos «anon» y «/anon» por un <span> con la clase "anonymized"
    const highlightedText = anonymizedText.replace(/«anon»(.*?)«\/anon»/g, '<span class="anonymized">$1</span>');
    textArea.innerHTML = highlightedText;

    Swal.close();
    Swal.fire({
      title: 'Texto Anonimizado',
      text: 'El texto ha sido anonimizado exitosamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.close();
    alert(`No se pudo anonimizar el texto: ${error.message}`);
  }
});

// Evento para buscar texto (simula Ctrl+F) en el contenedor extracted-text
document.getElementById('search-text').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input');
  // Alterna la visibilidad del input de búsqueda
  if (searchInput.style.display === 'none' || searchInput.style.display === '') {
    searchInput.style.display = 'block';
    searchInput.focus();
  } else {
    searchInput.style.display = 'none';
  }
});

// Evento para la búsqueda en tiempo real (resalta las coincidencias en el texto extraído)
document.getElementById('search-input').addEventListener('input', function (e) {
  const searchTerm = e.target.value;
  const container = document.getElementById('extracted-text');

  if (!searchTerm) {
    // Si el campo de búsqueda está vacío, se muestra el texto original o anonimizado
    container.innerHTML = container.innerText; // Reinicia el HTML sin resaltados
    return;
  }
  
  // Crear una expresión regular para buscar el término (sin distinguir mayúsculas/minúsculas)
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  
  // Resaltar coincidencias en el texto original (currentText) o en el contenido actual
  const highlighted = currentText.replace(regex, '<span class="highlight">$1</span>');
  container.innerHTML = highlighted;
});
