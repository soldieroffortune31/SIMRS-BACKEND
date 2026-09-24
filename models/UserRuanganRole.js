const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRuanganRole = sequelize.define('UserRuanganRole', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
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
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'user_ruangan_roles',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'ruangan_id', 'role_id'],
      name: 'unique_user_ruangan_role',
    },
  ],
});


UserRuanganRole.associate = (models) => {
  UserRuanganRole.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  UserRuanganRole.belongsTo(models.Ruangan, {
    foreignKey: 'ruangan_id',
    as: 'ruangan',
  });
  UserRuanganRole.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role',
  });
};

module.exports = UserRuanganRole;
