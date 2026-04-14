const uploadForm = document.getElementById('upload-form');
const detailsForm = document.getElementById('details-form');
const statusNode = document.getElementById('status');
const resultPanel = document.getElementById('result-panel');
const rawTextNode = document.getElementById('raw-text');
const fileInput = document.getElementById('receipt');
const selectedFileNode = document.getElementById('selected-file');
const saveResultNode = document.getElementById('save-result');
let isUploading = false;
let isSaving = false;
const loadedScripts = new Map();
const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

function setStatus(message, kind = '') {
  statusNode.textContent = message;
  statusNode.className = `status ${kind}`.trim();
}

function setSaveResult(message = '', kind = '') {
  if (!message) {
    saveResultNode.textContent = '';
    saveResultNode.className = 'save-result hidden';
    return;
  }

  saveResultNode.textContent = message;
  saveResultNode.className = `save-result ${kind}`.trim();
}

function fillForm(data) {
  Object.entries(data).forEach(([key, value]) => {
    const input = detailsForm.elements.namedItem(key);
    if (input) {
      input.value = value || '';
    }
  });
}

function isImageFile(file) {
  return file && file.type.startsWith('image/');
}

function isPdfFile(file) {
  return file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
}

function loadScriptOnce(key, src) {
  if (loadedScripts.has(key)) {
    return loadedScripts.get(key);
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.lib = key;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${key} desde CDN`));
    document.head.appendChild(script);
  });

  loadedScripts.set(key, promise);
  return promise;
}

async function ensureTesseract() {
  if (window.Tesseract) {
    return window.Tesseract;
  }

  await loadScriptOnce('tesseract', 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js');
  if (!window.Tesseract) {
    throw new Error('No se pudo inicializar el OCR en el navegador');
  }

  return window.Tesseract;
}

async function ensurePdfJs() {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (window['pdfjs-dist/build/pdf']) {
    window.pdfjsLib = window['pdfjs-dist/build/pdf'];
    return window.pdfjsLib;
  }

  await loadScriptOnce('pdfjs', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.js');
  if (!window.pdfjsLib) {
    throw new Error('No se pudo inicializar el lector PDF en el navegador');
  }

  return window.pdfjsLib;
}

async function parseRawText(rawText) {
  const response = await fetch('/api/parse-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawText }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo interpretar el texto extraido');
  }

  return payload;
}

async function processFileOnServer(file) {
  const formData = new FormData();
  formData.append('receipt', file);

  const response = await fetch('/api/process-expense', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo procesar el archivo');
  }

  return payload;
}

async function processImageInBrowser(file) {
  const Tesseract = await ensureTesseract();

  const result = await Tesseract.recognize(file, 'spa+eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        const progress = Math.round((message.progress || 0) * 100);
        setStatus(`Procesando imagen en el navegador... ${progress}%`);
      }
    },
  });

  const payload = await parseRawText(result.data?.text || '');
  return payload;
}

async function extractPdfTextInBrowser(file) {
  const pdfjsLib = await ensurePdfJs();

  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.js';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    setStatus(`Leyendo PDF en el navegador... pagina ${pageNumber} de ${pdf.numPages}`);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join('\n');
}

async function ocrPdfInBrowser(file) {
  const pdfjsLib = await ensurePdfJs();
  const Tesseract = await ensureTesseract();

  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.js';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const maxPages = Math.min(pdf.numPages, 3);
  const texts = [];

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    setStatus(`Aplicando OCR al PDF... pagina ${pageNumber} de ${maxPages}`);
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const result = await Tesseract.recognize(canvas, 'spa+eng', {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          const progress = Math.round((message.progress || 0) * 100);
          setStatus(`OCR del PDF en navegador... pagina ${pageNumber}/${maxPages} ${progress}%`);
        }
      },
    });

    texts.push(result.data?.text || '');
  }

  return texts.join('\n');
}

async function processPdfInBrowser(file) {
  let rawText = await extractPdfTextInBrowser(file);
  if (!rawText.trim()) {
    rawText = await ocrPdfInBrowser(file);
  }

  return parseRawText(rawText);
}

async function processSelectedFile(event) {
  if (event) {
    event.preventDefault();
  }
  const file = fileInput.files[0];

  if (!file) {
    setStatus('Selecciona un archivo antes de continuar.', 'error');
    return;
  }

  if (isUploading) {
    return;
  }

  isUploading = true;

  setStatus('Procesando comprobante, esto puede tardar unos segundos...');
  setSaveResult();

  try {
    let payload;

    if (isImageFile(file)) {
      try {
        payload = await processImageInBrowser(file);
      } catch (browserError) {
        if (!isLocalhost) {
          throw new Error(
            `Fallo el OCR en el navegador: ${browserError.message}. En produccion no se usara el fallback del servidor para no ocultar el error real.`
          );
        }

        setStatus('El OCR del navegador fallo. Intentando en el servidor...');
        try {
          payload = await processFileOnServer(file);
        } catch (serverError) {
          throw new Error(
            `Fallo el OCR en el navegador: ${browserError.message}. Tambien fallo el servidor: ${serverError.message}.`
          );
        }
      }
    } else if (isPdfFile(file)) {
      try {
        payload = await processPdfInBrowser(file);
      } catch (browserError) {
        if (!isLocalhost) {
          throw new Error(
            `Fallo la lectura del PDF en el navegador: ${browserError.message}. En produccion no se usara el fallback del servidor para no ocultar el error real.`
          );
        }

        setStatus('La lectura del PDF en navegador fallo. Intentando en el servidor...');
        try {
          payload = await processFileOnServer(file);
        } catch (serverError) {
          throw new Error(
            `Fallo la lectura del PDF en el navegador: ${browserError.message}. Tambien fallo el servidor: ${serverError.message}.`
          );
        }
      }
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    if (!payload.ok) {
      setStatus(payload.message || 'No se pudo procesar el comprobante.', 'error');
      resultPanel.classList.add('hidden');
      return;
    }

    fillForm(payload.extracted);
    rawTextNode.textContent = payload.rawText;
    resultPanel.classList.remove('hidden');
    setSaveResult();
    setStatus('Extraccion completada. Revisa los datos, completa motivo y zona, y registra la rendicion.', 'success');
  } catch (error) {
    const message = error.message || 'Ocurrio un error al procesar el archivo.';
    setStatus(message, 'error');
    setSaveResult(message, 'error');
    resultPanel.classList.add('hidden');
  } finally {
    isUploading = false;
  }
}

uploadForm.addEventListener('submit', processSelectedFile);

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    selectedFileNode.textContent = 'Todavia no seleccionaste ningun archivo.';
    return;
  }

  selectedFileNode.textContent = `Archivo seleccionado: ${file.name}`;
  setStatus(`Archivo listo para procesar: ${file.name}`);
  processSelectedFile();
});

detailsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isSaving) {
    return;
  }

  const formData = new FormData(detailsForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.motivo?.trim()) {
    setStatus('Falta completar el motivo del gasto.', 'error');
    setSaveResult('Completa el campo "Motivo del gasto" antes de registrar.', 'error');
    detailsForm.elements.namedItem('motivo')?.focus();
    return;
  }

  if (!payload.zona) {
    setStatus('Falta seleccionar la zona.', 'error');
    setSaveResult('Selecciona una zona valida: ZN, ZCE, ZCO o ZS.', 'error');
    detailsForm.elements.namedItem('zona')?.focus();
    return;
  }

  isSaving = true;

  setStatus('Registrando rendicion...');
  setSaveResult('Enviando datos para registrar la rendicion...');

  try {
    const response = await fetch('/api/save-expense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatus(result.message || 'No se pudo registrar la rendicion.', 'error');
      setSaveResult(result.message || 'No se pudo registrar la rendicion.', 'error');
      return;
    }

    if (result.destination === 'google-sheets') {
      setStatus('La rendicion fue registrada correctamente en Google Sheets.', 'success');
      setSaveResult('Registro completado en Google Sheets.', 'success');
      return;
    }

    setStatus(result.warning || 'La rendicion se guardo localmente para pruebas.', 'success');
    setSaveResult(result.warning || 'La rendicion se guardo localmente para pruebas.', 'success');
  } catch (error) {
    setStatus('Ocurrio un error al registrar la rendicion.', 'error');
    setSaveResult('Ocurrio un error al registrar la rendicion.', 'error');
  } finally {
    isSaving = false;
  }
});
