const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ModulInstalasi = sequelize.define('ModulInstalasi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modul_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modul',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  instalasi_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instalasi',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'modul_instalasi',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['modul_id', 'instalasi_id'],
      name: 'unique_modul_instalasi',
    },
  ],
});


ModulInstalasi.associate = (models) => {
  ModulInstalasi.belongsTo(models.Modul, { foreignKey: 'modul_id', as: 'modul' });
  ModulInstalasi.belongsTo(models.Instalasi, { foreignKey: 'instalasi_id', as: 'instalasi' });
};

module.exports = ModulInstalasi;
