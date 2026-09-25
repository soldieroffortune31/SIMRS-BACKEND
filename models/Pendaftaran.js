const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pendaftaran = sequelize.define('Pendaftaran', {
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
  jenis_pelayanan: {
    type: DataTypes.ENUM('RAWAT_JALAN', 'IGD', 'RAWAT_INAP'),
    allowNull: false,
    defaultValue: 'RAWAT_JALAN',
  },
  tanggal_kunjungan: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  waktu_masuk: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  waktu_keluar: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ruangan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ruangan',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  jadwal_dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'jadwal_dokter',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  no_antrean: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  angka_antrean: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status_antrean: {
    type: DataTypes.ENUM('MENUNGGU', 'DIPANGGIL', 'SEDANG_DILAYANI', 'SELESAI', 'BATAL'),
    defaultValue: 'MENUNGGU',
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
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Bidang spesifik alih rawat / IGD / Rawat Inap
  triage_level: {
    type: DataTypes.ENUM('MERAH', 'KUNING', 'HIJAU', 'HITAM'),
    allowNull: true,
  },
  cara_masuk: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pendaftaran_asal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pendaftaran',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  kelas_rawat: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  kamar_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bed_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'pendaftaran',
  paranoid: true,
  indexes: [
    {
      name: 'idx_pendaftaran_layanan_kunjungan',
      fields: ['tanggal_kunjungan', 'jenis_pelayanan', 'ruangan_id', 'dokter_id'],
    },
    {
      name: 'idx_pendaftaran_pasien_id',
      fields: ['pasien_id'],
    },
  ],
});

Pendaftaran.associate = (models) => {
  Pendaftaran.belongsTo(models.Pasien, {
    foreignKey: 'pasien_id',
    as: 'pasien',
  });
  Pendaftaran.belongsTo(models.JadwalDokter, {
    foreignKey: 'jadwal_dokter_id',
    as: 'jadwal_dokter',
  });
  Pendaftaran.belongsTo(models.User, {
    foreignKey: 'dokter_id',
    as: 'dokter',
  });
  Pendaftaran.belongsTo(models.Ruangan, {
    foreignKey: 'ruangan_id',
    as: 'ruangan',
  });
  Pendaftaran.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'petugas_admisi',
  });
  Pendaftaran.belongsTo(models.Pendaftaran, {
    foreignKey: 'pendaftaran_asal_id',
    as: 'pendaftaran_asal',
  });
  Pendaftaran.hasMany(models.Pendaftaran, {
    foreignKey: 'pendaftaran_asal_id',
    as: 'pendaftaran_lanjutan',
  });
};

module.exports = Pendaftaran;
