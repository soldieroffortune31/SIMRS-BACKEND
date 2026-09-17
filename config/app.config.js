const fs = require('fs');
const path = require('path');

// Muat .env jika ada menggunakan process.loadEnvFile (Node.js v20+)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    console.warn('Peringatan: Gagal memuat file .env:', err.message);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    name: process.env.DB_NAME || 'simrs_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_simrs_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    contextExpiresIn: process.env.JWT_CONTEXT_EXPIRES_IN || '8h',
  },
};
