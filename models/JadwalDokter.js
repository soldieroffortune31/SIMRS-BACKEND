const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalDokter = sequelize.define('JadwalDokter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  ruangan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ruangan',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  hari: {
    type: DataTypes.ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'),
    allowNull: false,
  },
  jam_mulai: {
    type: DataTypes.STRING(8), // format HH:mm misal '08:00'
    allowNull: false,
  },
  jam_selesai: {
    type: DataTypes.STRING(8), // format HH:mm misal '12:00'
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
    foreignKey: 'jadwal_dokter_id',
    as: 'pendaftaran_list',
  });
};

module.exports = JadwalDokter;
