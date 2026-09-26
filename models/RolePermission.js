const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  rolepermission_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'role_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'permission_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'role_permissions',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
      name: 'unique_role_permission',
    },
  ],
});

RolePermission.associate = (models) => {
  RolePermission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  RolePermission.belongsTo(models.Permission, { foreignKey: 'permission_id', as: 'permission' });
};

module.exports = RolePermission;
