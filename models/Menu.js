const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  menu_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menus',
      key: 'menu_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  modul_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'modul',
      key: 'modul_id',
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

Menu.associate = (models) => {
  Menu.belongsTo(models.Menu, {
    foreignKey: 'parent_id',
    as: 'parent',
  });
  Menu.hasMany(models.Menu, {
    foreignKey: 'parent_id',
    as: 'children',
  });

  Menu.belongsTo(models.Modul, {
    foreignKey: 'modul_id',
    as: 'modul',
  });

  Menu.belongsToMany(models.Instalasi, {
    through: models.MenuInstalasi,
    foreignKey: 'menu_id',
    otherKey: 'instalasi_id',
    as: 'instalasi_list',
  });
  Menu.hasMany(models.MenuInstalasi, {
    foreignKey: 'menu_id',
    as: 'menu_instalasi_items',
  });

  Menu.belongsToMany(models.Role, {
    through: models.RoleMenu,
    foreignKey: 'menu_id',
    otherKey: 'role_id',
    as: 'roles',
  });
  Menu.hasMany(models.RoleMenu, {
    foreignKey: 'menu_id',
    as: 'role_menus',
  });

  Menu.hasMany(models.Permission, {
    foreignKey: 'menu_id',
    as: 'permissions',
    onDelete: 'CASCADE',
  });
};

module.exports = Menu;
