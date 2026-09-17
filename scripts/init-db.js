const { Client } = require('pg');
const config = require('../config/app.config');

async function initDatabase() {
  console.log('--- Inisialisasi Database SIMRS ---');
  console.log(`Menghubungkan ke PostgreSQL di ${config.db.host}:${config.db.port} dengan user: ${config.db.user}`);

  // 1. Hubungkan ke database default 'postgres' untuk memeriksa dan membuat 'simrs_db'
  const pgClient = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres',
  });

  try {
    await pgClient.connect();
    console.log('✓ Terhubung ke server PostgreSQL.');

    const res = await pgClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.db.name]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${config.db.name}' belum ada. Sedang membuat...`);
      await pgClient.query(`CREATE DATABASE "${config.db.name}"`);
      console.log(`✓ Database '${config.db.name}' berhasil dibuat!`);
    } else {
      console.log(`✓ Database '${config.db.name}' sudah ada.`);
    }
  } catch (error) {
    console.error('✗ Gagal inisialisasi basis data PostgreSQL:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }

  // 2. Uji koneksi Sequelize
  const sequelize = require('../config/database');
  try {
    await sequelize.authenticate();
    console.log(`✓ Sequelize berhasil terhubung ke basis data '${config.db.name}'.`);
    await sequelize.close();
  } catch (error) {
    console.error('✗ Gagal menghubungkan Sequelize ke database:', error.message);
    process.exit(1);
  }

  console.log('--- Inisialisasi Database Selesai Sukses ---\n');
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
