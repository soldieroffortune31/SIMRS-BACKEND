const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kecamatan = sequelize.define('Kecamatan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kabupaten_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'kabupaten_kota',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  kode_kecamatan: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama_kecamatan: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'kecamatan',
  paranoid: true,
});


Kecamatan.associate = (models) => {
  Kecamatan.belongsTo(models.KabupatenKota, {
    foreignKey: 'kabupaten_id',
    as: 'kabupaten',
  });

  Kecamatan.hasMany(models.DesaKelurahan, {
    foreignKey: 'kecamatan_id',
    as: 'desa_kelurahan',
    onDelete: 'CASCADE',
  });

  Kecamatan.hasMany(models.KodePos, {
    foreignKey: 'kecamatan_id',
    as: 'list_kode_pos',
  });
};

module.exports = Kecamatan;
