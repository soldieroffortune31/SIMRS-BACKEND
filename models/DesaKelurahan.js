const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DesaKelurahan = sequelize.define('DesaKelurahan', {
  desa_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kecamatan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'kecamatan',
      key: 'kecamatan_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  kode_desa: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  nama_desa: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  tipe: {
    type: DataTypes.STRING(30), // 'DESA' atau 'KELURAHAN'
    allowNull: false,
    defaultValue: 'DESA',
  },
  kode_pos: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'desa_kelurahan',
  paranoid: true,
});

DesaKelurahan.associate = (models) => {
  DesaKelurahan.belongsTo(models.Kecamatan, {
    foreignKey: 'kecamatan_id',
    as: 'kecamatan',
  });

  DesaKelurahan.hasMany(models.KodePos, {
    foreignKey: 'desa_id',
    as: 'list_kode_pos',
  });
};

module.exports = DesaKelurahan;
