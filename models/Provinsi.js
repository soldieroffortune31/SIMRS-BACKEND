const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Provinsi = sequelize.define('Provinsi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_provinsi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nama_provinsi: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'provinsi',
  paranoid: true,
});


Provinsi.associate = (models) => {
  Provinsi.hasMany(models.KabupatenKota, {
    foreignKey: 'provinsi_id',
    as: 'kabupaten_kota',
    onDelete: 'CASCADE',
  });

  Provinsi.hasMany(models.KodePos, {
    foreignKey: 'provinsi_id',
    as: 'list_kode_pos',
  });
};

module.exports = Provinsi;
