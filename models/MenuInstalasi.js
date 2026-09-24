const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuInstalasi = sequelize.define('MenuInstalasi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
}, {
  tableName: 'menu_instalasi',
  indexes: [
    {
      unique: true,
      fields: ['menu_id', 'instalasi_id'],
      name: 'unique_menu_instalasi',
    },
  ],
});


MenuInstalasi.associate = (models) => {
  MenuInstalasi.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
  MenuInstalasi.belongsTo(models.Instalasi, { foreignKey: 'instalasi_id', as: 'instalasi' });
};

module.exports = MenuInstalasi;
