const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalDokter = sequelize.define('JadwalDokter', {
  jadwaldokter_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  ruangan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ruangan',
      key: 'ruangan_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  hari: {
    type: DataTypes.ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'),
    allowNull: false,
  },
  jam_mulai: {
    type: DataTypes.STRING(8),
    allowNull: false,
  },
  jam_selesai: {
    type: DataTypes.STRING(8),
    allowNull: false,
  },
  kuota_pasien: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    allowNull: false,
  },
  keterangan: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'jadwal_dokter',
  paranoid: true,
});

JadwalDokter.associate = (models) => {
  JadwalDokter.belongsTo(models.User, {
    foreignKey: 'dokter_id',
    as: 'dokter',
  });
  JadwalDokter.belongsTo(models.Ruangan, {
    foreignKey: 'ruangan_id',
    as: 'ruangan',
  });
  JadwalDokter.hasMany(models.Pendaftaran, {
    foreignKey: 'jadwaldokter_id',
    as: 'pendaftaran_list',
  });
};

module.exports = JadwalDokter;
