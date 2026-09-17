const {
  Instalasi,
  Ruangan,
  Role,
  Permission,
  RoleMenu,
  RolePermission,
  Menu,
} = require('../models');

class MasterService {
  // --- INSTALASI ---
  async getAllInstalasi(includeRuangan = false) {
    const options = {
      order: [['id', 'ASC']],
    };
    if (includeRuangan) {
      options.include = [
        {
          model: Ruangan,
          as: 'ruangan',
          where: { is_active: true },
          required: false,
        },
      ];
    }
    return Instalasi.findAll(options);
  }

  async createInstalasi(data) {
    return Instalasi.create(data);
  }

  // --- RUANGAN ---
  async getAllRuangan(instalasiId = null) {
    const where = {};
    if (instalasiId) {
      where.instalasi_id = instalasiId;
    }
    return Ruangan.findAll({
      where,
      include: [
        {
          model: Instalasi,
          as: 'instalasi',
          attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
        },
      ],
      order: [['id', 'ASC']],
    });
  }

  async createRuangan(data) {
    const instalasi = await Instalasi.findByPk(data.instalasi_id);
    if (!instalasi) {
      const error = new Error('Instalasi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return Ruangan.create(data);
  }

  // --- ROLES & PERMISSIONS ---
  async getAllRoles() {
    return Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
      order: [['id', 'ASC']],
    });
  }

  async createRole(data) {
    return Role.create(data);
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      const error = new Error('Role tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    await role.setPermissions(permissionIds);
    return role.getPermissions();
  }

  async assignMenusToRole(roleId, menuIds) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      const error = new Error('Role tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    await role.setMenus(menuIds);
    return role.getMenus();
  }
}

module.exports = new MasterService();
