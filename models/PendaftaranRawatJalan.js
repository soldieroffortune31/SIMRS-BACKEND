const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PendaftaranRawatJalan = sequelize.define('PendaftaranRawatJalan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  no_registrasi: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  no_antrean: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  angka_antrean: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pasien_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pasien',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  tipe_pasien: {
    type: DataTypes.ENUM('BARU', 'LAMA'),
    allowNull: false,
  },
  jadwal_dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jadwal_dokter',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
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
  tanggal_kunjungan: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  jenis_penjamin: {
    type: DataTypes.ENUM('UMUM', 'BPJS', 'ASURANSI_SWASTA', 'PERUSAHAAN'),
    allowNull: false,
    defaultValue: 'UMUM',
  },
  no_kartu_penjamin: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  keluhan_utama: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status_antrean: {
    type: DataTypes.ENUM('MENUNGGU', 'DIPANGGIL', 'SEDANG_DILAYANI', 'SELESAI', 'BATAL'),
    defaultValue: 'MENUNGGU',
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'pendaftaran_rawat_jalan',
  paranoid: true,
  indexes: [
    {
      fields: ['tanggal_kunjungan', 'ruangan_id', 'dokter_id'],
    },
    {
      fields: ['no_registrasi'],
    },
  ],
});

PendaftaranRawatJalan.associate = (models) => {
  PendaftaranRawatJalan.belongsTo(models.Pasien, {
    foreignKey: 'pasien_id',
    as: 'pasien',
  });
  PendaftaranRawatJalan.belongsTo(models.JadwalDokter, {
    foreignKey: 'jadwal_dokter_id',
    as: 'jadwal_dokter',
  });
  PendaftaranRawatJalan.belongsTo(models.User, {
    foreignKey: 'dokter_id',
    as: 'dokter',
  });
  PendaftaranRawatJalan.belongsTo(models.Ruangan, {
    foreignKey: 'ruangan_id',
    as: 'ruangan',
  });
  PendaftaranRawatJalan.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'petugas_admisi',
  });
};

module.exports = PendaftaranRawatJalan;
