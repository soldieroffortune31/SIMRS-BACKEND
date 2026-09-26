const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  role_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  kode_role: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama_role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'roles',
  paranoid: true,
});

Role.associate = (models) => {
  Role.hasMany(models.UserRuanganRole, {
    foreignKey: 'role_id',
    as: 'user_assignments',
    onDelete: 'CASCADE',
  });

  Role.belongsToMany(models.Menu, {
    through: models.RoleMenu,
    foreignKey: 'role_id',
    otherKey: 'menu_id',
    as: 'menus',
  });
  Role.hasMany(models.RoleMenu, {
    foreignKey: 'role_id',
    as: 'role_menus',
  });

  Role.belongsToMany(models.Permission, {
    through: models.RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });
  Role.hasMany(models.RolePermission, {
    foreignKey: 'role_id',
    as: 'role_permissions',
  });
};

module.exports = Role;
