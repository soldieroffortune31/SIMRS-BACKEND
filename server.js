const express = require('express');
const cors = require('cors');
const config = require('./config/app.config');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Middlewares Dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger untuk memudahkan debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routing API
app.use('/api', routes);

// Route Fallback 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Inisialisasi Server & Sinkronisasi DB jika dijalankan langsung
const autoBootstrap = require('./scripts/auto-bootstrap');

// Inisialisasi Server & Auto-Bootstrap DB jika dijalankan langsung
if (require.main === module) {
  const startServer = async () => {
    try {
      console.log('--- Memeriksa Status Basis Data SIMRS ---');
      await autoBootstrap({ isServerStart: true });

      app.listen(config.port, () => {
        console.log(`\n=================================================`);
        console.log(`🏥 SIMRS Backend Server Berjalan pada Port: ${config.port}`);
        console.log(`🌍 URL API: http://localhost:${config.port}/api`);
        console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
        console.log(`=================================================\n`);
      });
    } catch (error) {
      console.error('✗ Gagal memulai server SIMRS:', error.message);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
