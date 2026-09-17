const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menus',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  kode_menu: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nama_menu: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  path: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'menus',
  paranoid: true,
});

module.exports = Menu;
