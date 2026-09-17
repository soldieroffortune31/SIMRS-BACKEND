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
const Modul = require('./Modul');
const ModulInstalasi = require('./ModulInstalasi');
const ModulRuangan = require('./ModulRuangan');
const UserRuanganModul = require('./UserRuanganModul');

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

// 4. Relasi Menu dan Modul
Modul.hasMany(Menu, {
  foreignKey: 'modul_id',
  as: 'menus',
  onDelete: 'SET NULL',
});
Menu.belongsTo(Modul, {
  foreignKey: 'modul_id',
  as: 'modul',
});

// 5. Relasi Modul dan Instalasi (Many-to-Many via ModulInstalasi)
Modul.belongsToMany(Instalasi, {
  through: ModulInstalasi,
  foreignKey: 'modul_id',
  otherKey: 'instalasi_id',
  as: 'instalasi_list',
});
Instalasi.belongsToMany(Modul, {
  through: ModulInstalasi,
  foreignKey: 'instalasi_id',
  otherKey: 'modul_id',
  as: 'modules',
});
ModulInstalasi.belongsTo(Modul, { foreignKey: 'modul_id', as: 'modul' });
ModulInstalasi.belongsTo(Instalasi, { foreignKey: 'instalasi_id', as: 'instalasi' });
Modul.hasMany(ModulInstalasi, { foreignKey: 'modul_id', as: 'modul_instalasi_items' });
Instalasi.hasMany(ModulInstalasi, { foreignKey: 'instalasi_id', as: 'modul_instalasi_items' });

// 6. Relasi Modul dan Ruangan (Many-to-Many via ModulRuangan)
Modul.belongsToMany(Ruangan, {
  through: ModulRuangan,
  foreignKey: 'modul_id',
  otherKey: 'ruangan_id',
  as: 'ruangan_list',
});
Ruangan.belongsToMany(Modul, {
  through: ModulRuangan,
  foreignKey: 'ruangan_id',
  otherKey: 'modul_id',
  as: 'modules',
});
ModulRuangan.belongsTo(Modul, { foreignKey: 'modul_id', as: 'modul' });
ModulRuangan.belongsTo(Ruangan, { foreignKey: 'ruangan_id', as: 'ruangan' });
Modul.hasMany(ModulRuangan, { foreignKey: 'modul_id', as: 'modul_ruangan_items' });
Ruangan.hasMany(ModulRuangan, { foreignKey: 'ruangan_id', as: 'modul_ruangan_items' });

// 7. Relasi User - Ruangan - Modul (Hak Akses Akun Pengguna per Ruangan)
User.hasMany(UserRuanganModul, {
  foreignKey: 'user_id',
  as: 'user_ruangan_modules',
  onDelete: 'CASCADE',
});
UserRuanganModul.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserRuanganModul.belongsTo(Ruangan, { foreignKey: 'ruangan_id', as: 'ruangan' });
UserRuanganModul.belongsTo(Modul, { foreignKey: 'modul_id', as: 'modul' });
Ruangan.hasMany(UserRuanganModul, { foreignKey: 'ruangan_id', as: 'user_ruangan_modules' });
Modul.hasMany(UserRuanganModul, { foreignKey: 'modul_id', as: 'user_ruangan_modules' });

// 8. Relasi Menu dan Instalasi (Many-to-Many via MenuInstalasi)
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

// 9. Relasi Menu dan Role (Many-to-Many via RoleMenu)
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

// 10. Relasi Menu dan Permission
Menu.hasMany(Permission, {
  foreignKey: 'menu_id',
  as: 'permissions',
  onDelete: 'CASCADE',
});
Permission.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu',
});

// 11. Relasi Role dan Permission (Many-to-Many via RolePermission)
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
  Modul,
  ModulInstalasi,
  ModulRuangan,
  UserRuanganModul,
};
