const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');

const config = require('./google_sheets_config.json');

const app = express();
const port = Number(process.env.PORT || 3000);
const runtimeRoot = process.env.VERCEL ? os.tmpdir() : __dirname;
const uploadsDir = process.env.VERCEL
  ? path.join(runtimeRoot, 'argenteo-uploads')
  : path.join(__dirname, 'uploads');
const dataDir = process.env.VERCEL
  ? path.join(runtimeRoot, 'argenteo-data')
  : path.join(__dirname, 'data');
const fallbackDb = path.join(dataDir, 'submissions.json');
const localServiceAccountPath = path.join(__dirname, 'service-account.json');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (config.accepted_file_types.includes(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error('INVALID_FILE_TYPE'));
  },
});

function normalizeAmount(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  if (!cleaned) return '';
  return cleaned;
}

function sanitizeLine(line) {
  return String(line || '').replace(/\s+/g, ' ').trim();
}

function splitLines(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(sanitizeLine)
    .filter(Boolean);
}

function matchLine(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (/hotel|alojamiento|hospedaje/.test(lower)) return 'Alojamiento';
  if (/combustible|nafta|diesel|estacion/.test(lower)) return 'Combustible';
  if (/restaurante|almuerzo|cena|desayuno|comida/.test(lower)) return 'Alimentacion';
  if (/taxi|uber|cabify|transporte|pasaje|peaje/.test(lower)) return 'Transporte';
  return 'Pendiente de confirmacion';
}

function isLikelySupplierLine(line) {
  const clean = sanitizeLine(line);
  if (!clean) return false;
  if (clean.length < 4 || clean.length > 80) return false;
  if (/\d{4,}/.test(clean)) return false;
  if (!/[A-Za-zÁÉÍÓÚÑ]/.test(clean)) return false;
  if (/[:]/.test(clean)) return false;

  const lower = clean.toLowerCase();
  if (
    /responsable inscripto|consumidor final|monotribut|iva|cuit|rut|nit|direccion|domicilio|telefono|fecha|factura|comprobante|original|duplicado|codigo|cae|vto|vencimiento|subtotal|impuesto|total|forma de pago|metodo de pago|cuenta corriente/.test(
      lower
    )
  ) {
    return false;
  }

  return /[A-ZÁÉÍÓÚÑ]/.test(clean[0]);
}

function findSupplier(lines, compact) {
  const explicit =
    matchLine(compact, [
      /(?:proveedor|razon social|empresa)[:\s]*([^\n]+)/i,
    ]) || '';

  if (explicit && isLikelySupplierLine(explicit)) {
    return explicit;
  }

  const candidate = lines.slice(0, 12).find(isLikelySupplierLine);
  return candidate || 'pendiente de confirmacion';
}

function isReasonableAmount(value) {
  const normalized = normalizeAmount(value);
  if (!normalized) return false;
  const digits = normalized.replace(/[^\d]/g, '');
  if (!digits) return false;
  if (digits.length > 10) return false;
  if (/^\d{8,}$/.test(normalized)) return false;
  return true;
}

function extractAmountFromLine(line) {
  const matches = line.match(/\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|\d+(?:[.,]\d{2})/g) || [];
  const reasonable = matches.map(normalizeAmount).filter(isReasonableAmount);
  return reasonable.at(-1) || '';
}

function findAmount(lines, labelPattern) {
  const labeledLine = lines.find((line) => labelPattern.test(line.toLowerCase()));
  if (labeledLine) {
    const amount = extractAmountFromLine(labeledLine);
    if (amount) return amount;
  }
  return '';
}

function findInvoice(lines, compact) {
  const explicit =
    matchLine(compact, [
      /(?:numero de factura|nro\.?\s*de factura|factura nro|factura n|nro\.?\s*factura|comprobante)[:\s#-]*([a-z0-9-]{3,})/i,
      /\b([a-z]{1,2}\s?\d{3,5}-\d{6,8})\b/i,
    ]) || '';

  if (explicit && !/generad[oa]/i.test(explicit)) {
    return explicit;
  }

  const invoiceLine = lines.find((line) => /factura|comprobante/.test(line.toLowerCase()));
  if (!invoiceLine) return 'pendiente de confirmacion';

  const lineMatch = invoiceLine.match(/\b([A-Z]{0,2}\s?\d{3,5}-\d{6,8}|\d{3,5}-\d{6,8}|[A-Z0-9-]{5,})\b/);
  if (lineMatch && !/generad[oa]/i.test(lineMatch[1])) {
    return lineMatch[1];
  }

  return 'pendiente de confirmacion';
}

function findDescription(lines, compact) {
  const explicit =
    matchLine(compact, [
      /(?:descripcion|concepto|detalle)[:\s]*([^\n]+)/i,
    ]) || '';

  if (explicit && !/^(direccion|domicilio)[:]?$/i.test(explicit)) {
    return explicit;
  }

  const detailLine = lines.find(
    (line) =>
      !/direccion|domicilio|responsable inscripto|consumidor final|cuit|rut|nit|subtotal|impuesto|total|factura|comprobante|fecha|cuenta corriente|tarjeta|efectivo/.test(
        line.toLowerCase()
      ) &&
      !isLikelySupplierLine(line) &&
      !/\d{4,}/.test(line)
  );

  return detailLine || 'pendiente de confirmacion';
}

function parseExpenseData(text) {
  const compact = text.replace(/\r/g, '');
  const lines = splitLines(text);
  const date =
    matchLine(compact, [
      /(?:fecha|fecha de emision|emitido el)[:\s]*([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i,
      /\b([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})\b/,
    ]) || 'pendiente de confirmacion';

  const invoice = findInvoice(lines, compact);
  const supplier = findSupplier(lines, compact);

  const taxId =
    matchLine(compact, [
      /(?:cuit|rut|nit|id fiscal)[:\s]*([\d-]{8,20})/i,
      /\b(\d{2}-\d{8}-\d|\d{11}|\d{8,12}-[\dkK])\b/,
    ]) || 'pendiente de confirmacion';

  const subtotal = findAmount(lines, /subtotal|neto gravado|importe neto/) || 'pendiente de confirmacion';
  const taxes = findAmount(lines, /\biva\b|impuestos|impuesto/) || 'pendiente de confirmacion';
  const total = findAmount(lines, /importe total|\btotal\b/) || 'pendiente de confirmacion';

  const payment =
    matchLine(compact, [
      /(?:metodo de pago|forma de pago|pago)[:\s]*([^\n]+)/i,
      /\b(cuenta corriente|tarjeta|efectivo|transferencia|debito|credito)\b/i,
    ]) || 'pendiente de confirmacion';

  const description = findDescription(lines, compact);

  return {
    fecha: date,
    factura: invoice,
    proveedor: supplier,
    idFiscal: taxId,
    descripcion: description || 'pendiente de confirmacion',
    subtotal,
    impuestos: taxes,
    total,
    pago: payment,
    categoria: detectCategory(compact),
  };
}

async function extractTextFromPdf(filePath) {
  const { PDFParse } = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
}

async function extractTextFromImage(filePath) {
  const { createWorker } = require('tesseract.js');
  const worker = await createWorker('eng+spa');
  try {
    const result = await worker.recognize(filePath);
    return result.data.text || '';
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    return extractTextFromPdf(filePath);
  }
  return extractTextFromImage(filePath);
}

function getSheetsClient() {
  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  let privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '';
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';

  if (serviceAccountJson && (!clientEmail || !privateKey)) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      clientEmail = parsed.client_email || '';
      privateKey = parsed.private_key || '';
    } catch (_error) {
      // Ignore invalid JSON here and fall through to other credential sources.
    }
  }

  if ((!clientEmail || !privateKey) && fs.existsSync(localServiceAccountPath)) {
    const raw = JSON.parse(fs.readFileSync(localServiceAccountPath, 'utf8'));
    clientEmail = raw.client_email || '';
    privateKey = raw.private_key || '';
  }

  if (!clientEmail || !privateKey) {
    return null;
  }

  const credentials = {
    client_email: clientEmail,
    private_key: privateKey,
  };

  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    clientEmail,
    sheets: google.sheets({ version: 'v4', auth }),
  };
}

function buildRow(payload) {
  return [
    payload.fecha || '',
    payload.factura || '',
    payload.proveedor || '',
    payload.idFiscal || '',
    payload.descripcion || '',
    payload.subtotal || '',
    payload.impuestos || '',
    payload.total || '',
    payload.pago || '',
    payload.categoria || '',
    payload.motivo || '',
    payload.zona || '',
  ];
}

async function appendToFallback(payload) {
  const existing = fs.existsSync(fallbackDb)
    ? JSON.parse(fs.readFileSync(fallbackDb, 'utf8'))
    : [];
  existing.push({
    savedAt: new Date().toISOString(),
    ...payload,
  });
  fs.writeFileSync(fallbackDb, JSON.stringify(existing, null, 2));
}

app.get('/api/health', (_req, res) => {
  const sheetsConfigured = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) ||
      fs.existsSync(localServiceAccountPath)
  );

  res.json({
    ok: true,
    app: 'Asistente de Viaticos de Argenteo Mining',
    sheetName: config.sheet_name,
    spreadsheetId: config.spreadsheet_id,
    sheetsConfigured,
  });
});

app.post('/api/parse-text', (req, res) => {
  const rawText = String(req.body?.rawText || '');

  if (!rawText.trim()) {
    res.status(400).json({
      ok: false,
      message: config.retry_message,
    });
    return;
  }

  res.json({
    ok: true,
    rawText,
    extracted: parseExpenseData(rawText),
    followUpQuestions: config.required_follow_up_questions,
  });
});

app.post('/api/process-expense', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      ok: false,
      message: 'No he podido procesar este archivo, podrias intentar enviarlo de nuevo o adjuntar una foto mas clara?',
    });
    return;
  }

  try {
    const rawText = await extractTextFromFile(req.file.path, req.file.mimetype);
    if (!rawText.trim()) {
      res.status(422).json({
        ok: false,
        message: config.retry_message,
      });
      return;
    }

    res.json({
      ok: true,
      fileName: req.file.originalname,
      rawText,
      extracted: parseExpenseData(rawText),
      followUpQuestions: config.required_follow_up_questions,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: config.retry_message,
      detail: error.message,
    });
  } finally {
    fs.rm(req.file.path, { force: true }, () => {});
  }
});

app.post('/api/save-expense', async (req, res) => {
  const payload = req.body || {};
  const sheetName = config.sheet_name;

  if (sheetName !== 'Control de Viáticos - Argenteo Mining SA') {
    res.status(500).json({
      ok: false,
      message: 'Error de parametros: Sheet_Name debe ser exactamente "Control de Viáticos - Argenteo Mining SA".',
    });
    return;
  }

  if (!payload.motivo || !payload.zona) {
    res.status(400).json({
      ok: false,
      message: 'Faltan datos obligatorios: motivo y zona.',
    });
    return;
  }

  if (!['ZN', 'ZCE', 'ZCO', 'ZS'].includes(payload.zona)) {
    res.status(400).json({
      ok: false,
      message: 'La zona debe ser una de estas opciones: ZN, ZCE, ZCO, ZS.',
    });
    return;
  }

  const row = buildRow(payload);
  const sheetsClient = getSheetsClient();

  try {
    if (sheetsClient) {
      await sheetsClient.sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheet_id,
        range: `${config.sheet_name}!A:L`,
        valueInputOption: config.value_input_option,
        requestBody: {
          values: [row],
        },
      });
      res.json({
        ok: true,
        destination: 'google-sheets',
        sheetName: config.sheet_name,
      });
      return;
    }

    await appendToFallback(payload);
    res.json({
      ok: true,
      destination: 'local-fallback',
      warning:
        'No hay credenciales de Google Sheets configuradas. La rendicion se guardo localmente en data/submissions.json para pruebas.',
    });
  } catch (error) {
    const forbidden = error?.code === 403 || error?.status === 403;
    res.status(500).json({
      ok: false,
      message: forbidden
        ? `La cuenta de servicio ${sheetsClient?.clientEmail || 'configurada'} no tiene acceso a la planilla. Comparte el Google Sheet con ese correo y vuelve a intentar.`
        : 'No se pudo registrar la rendicion.',
      detail: error.message,
    });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Asistente de Viaticos disponible en http://localhost:${port}`);
  });
}

module.exports = app;
