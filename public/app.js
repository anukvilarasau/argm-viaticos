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

async function parseRawText(rawText) {
  const response = await fetch('/api/parse-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawText }),
  });

  return response.json();
}

async function processImageInBrowser(file) {
  if (!window.Tesseract) {
    throw new Error('Tesseract no esta disponible en el navegador');
  }

  const result = await window.Tesseract.recognize(file, 'spa+eng', {
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

  try {
    let payload;

    if (isImageFile(file)) {
      payload = await processImageInBrowser(file);
    } else if (isPdfFile(file)) {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/process-expense', {
        method: 'POST',
        body: formData,
      });
      payload = await response.json();
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
    setStatus('Ocurrio un error al procesar el archivo.', 'error');
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
