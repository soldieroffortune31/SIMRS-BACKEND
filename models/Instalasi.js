const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instalasi = sequelize.define('Instalasi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_instalasi: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama_instalasi: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'instalasi',
  paranoid: true,
});

module.exports = Instalasi;
