const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_role: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama_role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'roles',
  paranoid: true,
});

module.exports = Role;
