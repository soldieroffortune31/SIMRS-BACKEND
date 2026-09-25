const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pasien = sequelize.define('Pasien', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  no_rm: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nik: {
    type: DataTypes.STRING(16),
    allowNull: true,
    unique: true,
    set(val) {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        this.setDataValue('nik', null);
      } else {
        this.setDataValue('nik', val.trim());
      }
    },
  },
  nama_lengkap: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false,
  },
  tempat_lahir: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  tanggal_lahir: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  golongan_darah: {
    type: DataTypes.ENUM('A', 'B', 'AB', 'O', 'TIDAK_TAHU'),
    defaultValue: 'TIDAK_TAHU',
  },
  agama: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  status_pernikahan: {
    type: DataTypes.ENUM('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI'),
    allowNull: true,
  },
  pendidikan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pekerjaan: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  no_telepon: {
    type: DataTypes.STRING(25),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    set(val) {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        this.setDataValue('email', null);
      } else {
        this.setDataValue('email', val.trim().toLowerCase());
      }
    },
    validate: {
      isEmailOrNull(val) {
        if (val !== null && val !== undefined && val !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            throw new Error('Format email tidak valid.');
          }
        }
      },
    },
  },
  alamat_lengkap: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rt: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  rw: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  provinsi_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'provinsi',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  kabupaten_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'kabupaten_kota',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  kecamatan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'kecamatan',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  desa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'desa_kelurahan',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  kode_pos: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  // Identitas Penanggung Jawab / Keluarga Terdekat
  nama_penanggung_jawab: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  hubungan_penanggung_jawab: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  telepon_penanggung_jawab: {
    type: DataTypes.STRING(25),
    allowNull: true,
  },
  // Penjamin Default (Umum / Asuransi)
  jenis_penjamin_default: {
    type: DataTypes.ENUM('UMUM', 'BPJS', 'ASURANSI_SWASTA', 'PERUSAHAAN'),
    defaultValue: 'UMUM',
    allowNull: false,
  },
  no_kartu_penjamin_default: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'pasien',
  paranoid: true,
});

Pasien.associate = (models) => {
  Pasien.belongsTo(models.Provinsi, {
    foreignKey: 'provinsi_id',
    as: 'provinsi',
  });
  Pasien.belongsTo(models.KabupatenKota, {
    foreignKey: 'kabupaten_id',
    as: 'kabupaten',
  });
  Pasien.belongsTo(models.Kecamatan, {
    foreignKey: 'kecamatan_id',
    as: 'kecamatan',
  });
  Pasien.belongsTo(models.DesaKelurahan, {
    foreignKey: 'desa_id',
    as: 'desa',
  });
  Pasien.hasMany(models.PendaftaranRawatJalan, {
    foreignKey: 'pasien_id',
    as: 'kunjungan_rawat_jalan',
  });
};

module.exports = Pasien;
