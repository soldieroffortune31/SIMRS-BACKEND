const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menus',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  kode_permission: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
  },
  nama_permission: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: true, // e.g. 'read', 'create', 'update', 'delete', 'approve'
  },
}, {
  tableName: 'permissions',
});

module.exports = Permission;
