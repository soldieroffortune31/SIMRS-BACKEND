const sequelize = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Instalasi = require('./Instalasi');
const Ruangan = require('./Ruangan');
const UserRuanganRole = require('./UserRuanganRole');
const Menu = require('./Menu');
const MenuInstalasi = require('./MenuInstalasi');
const Permission = require('./Permission');
const RoleMenu = require('./RoleMenu');
const RolePermission = require('./RolePermission');

// 1. Relasi Instalasi dan Ruangan
Instalasi.hasMany(Ruangan, {
  foreignKey: 'instalasi_id',
  as: 'ruangan',
  onDelete: 'CASCADE',
});
Ruangan.belongsTo(Instalasi, {
  foreignKey: 'instalasi_id',
  as: 'instalasi',
});

// 2. Relasi User - Ruangan - Role (Penugasan)
User.hasMany(UserRuanganRole, {
  foreignKey: 'user_id',
  as: 'assignments',
  onDelete: 'CASCADE',
});
UserRuanganRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Ruangan.hasMany(UserRuanganRole, {
  foreignKey: 'ruangan_id',
  as: 'user_assignments',
  onDelete: 'CASCADE',
});
UserRuanganRole.belongsTo(Ruangan, {
  foreignKey: 'ruangan_id',
  as: 'ruangan',
});

Role.hasMany(UserRuanganRole, {
  foreignKey: 'role_id',
  as: 'user_assignments',
  onDelete: 'CASCADE',
});
UserRuanganRole.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

// 3. Relasi Hierarkis Menu (Self-referencing Parent - Children)
Menu.belongsTo(Menu, {
  foreignKey: 'parent_id',
  as: 'parent',
});
Menu.hasMany(Menu, {
  foreignKey: 'parent_id',
  as: 'children',
});

// 4. Relasi Menu dan Instalasi (Many-to-Many via MenuInstalasi)
Menu.belongsToMany(Instalasi, {
  through: MenuInstalasi,
  foreignKey: 'menu_id',
  otherKey: 'instalasi_id',
  as: 'instalasi_list',
});
Instalasi.belongsToMany(Menu, {
  through: MenuInstalasi,
  foreignKey: 'instalasi_id',
  otherKey: 'menu_id',
  as: 'menus',
});
MenuInstalasi.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });
MenuInstalasi.belongsTo(Instalasi, { foreignKey: 'instalasi_id', as: 'instalasi' });
Menu.hasMany(MenuInstalasi, { foreignKey: 'menu_id', as: 'menu_instalasi_items' });
Instalasi.hasMany(MenuInstalasi, { foreignKey: 'instalasi_id', as: 'menu_instalasi_items' });

// 5. Relasi Menu dan Role (Many-to-Many via RoleMenu)
Role.belongsToMany(Menu, {
  through: RoleMenu,
  foreignKey: 'role_id',
  otherKey: 'menu_id',
  as: 'menus',
});
Menu.belongsToMany(Role, {
  through: RoleMenu,
  foreignKey: 'menu_id',
  otherKey: 'role_id',
  as: 'roles',
});
RoleMenu.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
RoleMenu.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });
Role.hasMany(RoleMenu, { foreignKey: 'role_id', as: 'role_menus' });
Menu.hasMany(RoleMenu, { foreignKey: 'menu_id', as: 'role_menus' });

// 6. Relasi Menu dan Permission
Menu.hasMany(Permission, {
  foreignKey: 'menu_id',
  as: 'permissions',
  onDelete: 'CASCADE',
});
Permission.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu',
});

// 7. Relasi Role dan Permission (Many-to-Many via RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});
RolePermission.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' });
Role.hasMany(RolePermission, { foreignKey: 'role_id', as: 'role_permissions' });
Permission.hasMany(RolePermission, { foreignKey: 'permission_id', as: 'role_permissions' });

module.exports = {
  sequelize,
  User,
  Role,
  Instalasi,
  Ruangan,
  UserRuanganRole,
  Menu,
  MenuInstalasi,
  Permission,
  RoleMenu,
  RolePermission,
};
