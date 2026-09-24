const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleMenu = sequelize.define('RoleMenu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'role_menus',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'menu_id'],
      name: 'unique_role_menu',
    },
  ],
});


RoleMenu.associate = (models) => {
  RoleMenu.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  RoleMenu.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
};

module.exports = RoleMenu;
