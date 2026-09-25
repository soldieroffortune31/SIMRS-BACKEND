const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

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
