const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRuanganModul = sequelize.define('UserRuanganModul', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  ruangan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ruangan',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'user_ruangan_modul',
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'ruangan_id', 'modul_id'],
      name: 'unique_user_ruangan_modul',
    },
  ],
});

UserRuanganModul.associate = (models) => {
  UserRuanganModul.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  UserRuanganModul.belongsTo(models.Ruangan, { foreignKey: 'ruangan_id', as: 'ruangan' });
  UserRuanganModul.belongsTo(models.Modul, { foreignKey: 'modul_id', as: 'modul' });
};

module.exports = UserRuanganModul;
