const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ModulRuangan = sequelize.define('ModulRuangan', {
  modulruangan_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modul_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modul',
      key: 'modul_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  ruangan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ruangan',
      key: 'ruangan_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'modul_ruangan',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['modul_id', 'ruangan_id'],
      name: 'unique_modul_ruangan',
    },
  ],
});

ModulRuangan.associate = (models) => {
  ModulRuangan.belongsTo(models.Modul, { foreignKey: 'modul_id', as: 'modul' });
  ModulRuangan.belongsTo(models.Ruangan, { foreignKey: 'ruangan_id', as: 'ruangan' });
};

module.exports = ModulRuangan;
