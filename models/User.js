const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nama_lengkap: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  nip_nik: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  paranoid: true,
});


User.associate = (models) => {
  User.hasMany(models.UserRuanganRole, {
    foreignKey: 'user_id',
    as: 'assignments',
    onDelete: 'CASCADE',
  });

  User.hasMany(models.UserRuanganModul, {
    foreignKey: 'user_id',
    as: 'user_ruangan_modules',
    onDelete: 'CASCADE',
  });

  User.hasMany(models.JadwalDokter, {
    foreignKey: 'dokter_id',
    as: 'jadwal_praktek',
  });

  User.hasMany(models.PendaftaranRawatJalan, {
    foreignKey: 'dokter_id',
    as: 'pendaftaran_pasien',
  });
};

module.exports = User;
