const express = require('express');
const path = require('path');
const app = express();

const errorHandler = require('./middleware/errorHandler');

// ── Middleware: parseo de cuerpo ───────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Middleware: servir el frontend estático ────────────
app.use(express.static(path.join(__dirname, '../../frontend')));

// ── Middleware: logger de peticiones ───────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Middleware: CORS ───────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Rutas de la API ────────────────────────────────────
app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/stats', require('./routes/stats'));

// ── Info de la API (JSON) ──────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    mensaje: 'API SalesFlow - IF2003 Programación Web',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      clientes: '/api/clientes',
      ventas: '/api/ventas',
      stats: '/api/stats'
    }
  });
});

// ── 404 solo para rutas de API (el resto lo sirve estático) ──
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', ruta: req.originalUrl });
});

// ── Manejo centralizado de errores ─────────────────────
app.use(errorHandler);

module.exports = app;
