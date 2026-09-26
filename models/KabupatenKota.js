const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KabupatenKota = sequelize.define('KabupatenKota', {
  kabupaten_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  provinsi_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'provinsi',
      key: 'provinsi_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  kode_kabupaten: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama_kabupaten: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  tipe: {
    type: DataTypes.STRING(30), // 'KABUPATEN' atau 'KOTA'
    allowNull: false,
    defaultValue: 'KABUPATEN',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'kabupaten_kota',
  paranoid: true,
});

KabupatenKota.associate = (models) => {
  KabupatenKota.belongsTo(models.Provinsi, {
    foreignKey: 'provinsi_id',
    as: 'provinsi',
  });

  KabupatenKota.hasMany(models.Kecamatan, {
    foreignKey: 'kabupaten_id',
    as: 'kecamatan',
    onDelete: 'CASCADE',
  });

  KabupatenKota.hasMany(models.KodePos, {
    foreignKey: 'kabupaten_id',
    as: 'list_kode_pos',
  });
};

module.exports = KabupatenKota;
