const { Client } = require('pg');
const config = require('../config/app.config');
const { sequelize, User } = require('../models');
const runSeeder = require('../seeders/initial_seeder');

/**
 * Fungsi Auto-Bootstrap:
 * 1. Otomatis membuat database PostgreSQL jika belum ada.
 * 2. Otomatis membuat seluruh tabel (sync/alter) jika belum ada.
 * 3. Otomatis melakukan seeding data awal SIMRS jika data masih kosong.
 */
async function autoBootstrap(options = { isServerStart: false }) {
  // 1. Periksa dan buat basis data di PostgreSQL
  const pgClient = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres',
  });

  try {
    await pgClient.connect();
    const res = await pgClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [config.db.name]
    );

    if (res.rowCount === 0) {
      console.log(`[Auto-DB] Database '${config.db.name}' belum ada di server PostgreSQL.`);
      console.log(`[Auto-DB] Sedang membuat database '${config.db.name}' secara otomatis...`);
      await pgClient.query(`CREATE DATABASE "${config.db.name}"`);
      console.log(`✓ [Auto-DB] Database '${config.db.name}' berhasil dibuat!`);
    }
  } catch (error) {
    console.error(`✗ [Auto-DB] Gagal membuat database di PostgreSQL (${config.db.host}:${config.db.port}):`, error.message);
    throw error;
  } finally {
    await pgClient.end();
  }

  // 2. Hubungkan Sequelize ke database yang sudah dipastikan ada
  await sequelize.authenticate();

  // 3. Sinkronisasi seluruh tabel model secara otomatis
  await sequelize.sync({ alter: true });

  // 4. Periksa apakah tabel User sudah ada data; jika kosong, otomatis jalankan seeder
  const userCount = await User.count({ paranoid: false });
  if (userCount === 0) {
    console.log('[Auto-DB] Tabel database masih kosong. Menjalankan auto-seeder SIMRS...');
    await runSeeder(false);
    console.log('✓ [Auto-DB] Seluruh data master SIMRS berhasil digenerate otomatis!');
  } else {
    console.log(`✓ [Auto-DB] Database & tabel siap digunakan (Ditemukan ${userCount} data pengguna aktif/arsip).`);
  }
}

if (require.main === module) {
  autoBootstrap()
    .then(async () => {
      console.log('\n✓ Setup database dan data awal SIMRS selesai!');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('\n✗ Setup gagal:', err.message);
      try { await sequelize.close(); } catch (_) {}
      process.exit(1);
    });
}

module.exports = autoBootstrap;
