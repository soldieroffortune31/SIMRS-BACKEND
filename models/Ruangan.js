const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruangan = sequelize.define('Ruangan', {
  ruangan_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  instalasi_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instalasi',
      key: 'instalasi_id',
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

Ruangan.associate = (models) => {
  Ruangan.belongsTo(models.Instalasi, {
    foreignKey: 'instalasi_id',
    as: 'instalasi',
  });

  Ruangan.hasMany(models.UserRuanganRole, {
    foreignKey: 'ruangan_id',
    as: 'user_assignments',
    onDelete: 'CASCADE',
  });

  Ruangan.belongsToMany(models.Modul, {
    through: models.ModulRuangan,
    foreignKey: 'ruangan_id',
    otherKey: 'modul_id',
    as: 'modules',
  });
  Ruangan.hasMany(models.ModulRuangan, {
    foreignKey: 'ruangan_id',
    as: 'modul_ruangan_items',
  });

  Ruangan.hasMany(models.UserRuanganModul, {
    foreignKey: 'ruangan_id',
    as: 'user_ruangan_modules',
  });

  Ruangan.hasMany(models.JadwalDokter, {
    foreignKey: 'ruangan_id',
    as: 'jadwal_dokter',
  });

  Ruangan.hasMany(models.Pendaftaran, {
    foreignKey: 'ruangan_id',
    as: 'pendaftaran_list',
  });
};

module.exports = Ruangan;
