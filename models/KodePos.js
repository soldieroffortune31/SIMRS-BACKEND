const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KodePos = sequelize.define('KodePos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_pos: {
    type: DataTypes.STRING(10),
    allowNull: false,
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
  keterangan: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'kode_pos',
  paranoid: true,
  indexes: [
    {
      fields: ['kode_pos'],
    },
  ],
});


KodePos.associate = (models) => {
  KodePos.belongsTo(models.Provinsi, { foreignKey: 'provinsi_id', as: 'provinsi' });
  KodePos.belongsTo(models.KabupatenKota, { foreignKey: 'kabupaten_id', as: 'kabupaten' });
  KodePos.belongsTo(models.Kecamatan, { foreignKey: 'kecamatan_id', as: 'kecamatan' });
  KodePos.belongsTo(models.DesaKelurahan, { foreignKey: 'desa_id', as: 'desa' });
};

module.exports = KodePos;
