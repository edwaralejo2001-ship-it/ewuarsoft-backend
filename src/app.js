const express = require('express');
const path = require('path');
const apiRoutes = require('./routes');
const { AppError } = require('./services/errors');

const app = express();
app.disable('x-powered-by');

// Permite solicitudes cross-origin (CORS) y responde a preflight OPTIONS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Servir archivos estáticos del Front-End desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ success: true, message: 'EwuarSoft API disponible.' }));
app.use('/api', (req, res, next) => {
  if (req.method !== 'POST') return next(new AppError('Este servicio acepta únicamente el método POST.', 405));
  if (!req.is('application/json')) {
    return res.status(415).json({ success: false, error: 'Envía el body con Content-Type: application/json.' });
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, error: 'El body debe ser un objeto JSON.' });
  }
  return next();
});
app.use('/api', apiRoutes);

// Para rutas SPA no-API, enviar index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'), (err) => {
    if (err) next(new AppError('Ruta no encontrada.', 404));
  });
});

app.use((req, res, next) => next(new AppError('Ruta no encontrada.', 404)));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, error: 'El body debe contener JSON válido.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'El body supera el límite permitido de 1 MB.' });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, error: 'Ya existe un registro con ese valor único (por ejemplo, el SKU).' });
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, error: 'La categoría o el proveedor indicado no existe.' });
  }
  if (error.code === 'ER_BAD_NULL_ERROR' || error.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({ success: false, error: 'Faltan datos obligatorios o alguno supera la longitud permitida.' });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, error: error.message });
  }

  console.error('Error inesperado en la API:', error);
  return res.status(500).json({ success: false, error: 'Error interno del servidor. Revisa la configuración y los registros.' });
});

module.exports = app;
