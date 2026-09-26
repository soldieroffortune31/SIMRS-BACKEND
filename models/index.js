const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

/**
 * STANDAR KONVENSI MODEL & TABEL SIMRS:
 * Seluruh model dan tabel menggunakan penamaan Primary Key seragam berbasis:
 *   <namatabel>_id tanpa pemisah underscore antar kata untuk nama multi-kata
 *   (contoh: jadwaldokter_id, rolepermission_id, menuinstalasi_id, kodepos_id, instalasi_id, user_id)
 * Hindari penamaan primary key generik 'id'.
 * Untuk membuat model baru sesuai standar, gunakan script generator:
 *   npm run create-model <ModelName> [tableName]
 */

const db = {};

// 1. Muat seluruh file model secara otomatis dari direktori ini
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    const modelName = model.name || file.replace('.js', '');
    db[modelName] = model;
  });

// 2. Jalankan metode associate di masing-masing file model
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// 3. Backward compatibility alias: PendaftaranRawatJalan -> Pendaftaran
if (db.Pendaftaran && !db.PendaftaranRawatJalan) {
  db.PendaftaranRawatJalan = db.Pendaftaran;
}

db.sequelize = sequelize;

module.exports = db;
