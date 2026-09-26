#!/usr/bin/env node

/**
 * Script CLI untuk men-generate model baru sesuai standar SIMRS:
 * Primary key otomatis dinamai: <namatabel>_id (tanpa spasi/underscore antar kata, misal: jadwaldokter_id, rolepermission_id)
 * 
 * Penggunaan:
 *   node scripts/create-model.js <ModelName> [tableName]
 * Contoh:
 *   node scripts/create-model.js TindakanMedis
 *   node scripts/create-model.js TindakanMedis tindakan_medis
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Penggunaan: node scripts/create-model.js <ModelName> [tableName]');
  console.log('Contoh: node scripts/create-model.js TindakanMedis tindakan_medis');
  process.exit(1);
}

const modelName = args[0];

// Konversi CamelCase ke snake_case untuk nama tabel default
function camelToSnakeCase(str) {
  return str
    .replace(/[A-Z]/g, (letter, index) => (index === 0 ? letter.toLowerCase() : '_' + letter.toLowerCase()));
}

const tableName = args[1] || camelToSnakeCase(modelName);
// Primary key sesuai standar SIMRS: <namatabel>_id (contoh: jadwaldokter_id, rolepermission_id)
const pkName = `${modelName.toLowerCase()}_id`;

const targetFile = path.join(__dirname, '..', 'models', `${modelName}.js`);

if (fs.existsSync(targetFile)) {
  console.error(`✗ Model '${modelName}' sudah ada di: ${targetFile}`);
  process.exit(1);
}

const template = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ${modelName} = sequelize.define('${modelName}', {
  ${pkName}: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Tambahkan kolom atribut model di bawah ini:
  kode_${tableName}: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  nama_${tableName}: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: '${tableName}',
  paranoid: true,
});

${modelName}.associate = (models) => {
  // Hubungkan asosiasi foreignKey di sini jika ada:
  // Contoh:
  // ${modelName}.belongsTo(models.User, {
  //   foreignKey: 'user_id',
  //   as: 'user',
  // });
};

module.exports = ${modelName};
`;

fs.writeFileSync(targetFile, template, 'utf8');
console.log(`✓ Model '${modelName}' berhasil dibuat: models/${modelName}.js`);
console.log(`  - Table Name: ${tableName}`);
console.log(`  - Primary Key: ${pkName}`);
