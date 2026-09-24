const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modul = sequelize.define('Modul', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_modul: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  nama_modul: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(50),
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
  tableName: 'modul',
  paranoid: true,
});


Modul.associate = (models) => {
  Modul.hasMany(models.Menu, {
    foreignKey: 'modul_id',
    as: 'menus',
    onDelete: 'SET NULL',
  });

  Modul.belongsToMany(models.Instalasi, {
    through: models.ModulInstalasi,
    foreignKey: 'modul_id',
    otherKey: 'instalasi_id',
    as: 'instalasi_list',
  });
  Modul.hasMany(models.ModulInstalasi, {
    foreignKey: 'modul_id',
    as: 'modul_instalasi_items',
  });

  Modul.belongsToMany(models.Ruangan, {
    through: models.ModulRuangan,
    foreignKey: 'modul_id',
    otherKey: 'ruangan_id',
    as: 'ruangan_list',
  });
  Modul.hasMany(models.ModulRuangan, {
    foreignKey: 'modul_id',
    as: 'modul_ruangan_items',
  });

  Modul.hasMany(models.UserRuanganModul, {
    foreignKey: 'modul_id',
    as: 'user_ruangan_modules',
  });
};

module.exports = Modul;
