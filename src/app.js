const path = require('path');
const express = require('express');
const patientsRouter = require('./routes/patients');

function createApp() {
  const app = express();
  app.use(express.json());

  // Static web UI at /
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Feature 0 — health
  app.get('/health', (_req, res) => res.status(200).type('text/plain').send('OK'));

  app.use('/patients', patientsRouter);

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'NotFound', message: `${req.method} ${req.path} not found` });
  });

  // Centralised error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'InternalServerError', message: err.message });
  });

  return app;
}

module.exports = { createApp };
