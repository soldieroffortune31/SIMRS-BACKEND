const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruangan = sequelize.define('Ruangan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  instalasi_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instalasi',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  kode_ruangan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nama_ruangan: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'ruangan',
  paranoid: true,
});

module.exports = Ruangan;
