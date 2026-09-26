const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instalasi = sequelize.define('Instalasi', {
  instalasi_id: {
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

Instalasi.associate = (models) => {
  Instalasi.hasMany(models.Ruangan, {
    foreignKey: 'instalasi_id',
    as: 'ruangan',
    onDelete: 'CASCADE',
  });

  Instalasi.belongsToMany(models.Modul, {
    through: models.ModulInstalasi,
    foreignKey: 'instalasi_id',
    otherKey: 'modul_id',
    as: 'modules',
  });
  Instalasi.hasMany(models.ModulInstalasi, {
    foreignKey: 'instalasi_id',
    as: 'modul_instalasi_items',
  });

  Instalasi.belongsToMany(models.Menu, {
    through: models.MenuInstalasi,
    foreignKey: 'instalasi_id',
    otherKey: 'menu_id',
    as: 'menus',
  });
  Instalasi.hasMany(models.MenuInstalasi, {
    foreignKey: 'instalasi_id',
    as: 'menu_instalasi_items',
  });
};

module.exports = Instalasi;
