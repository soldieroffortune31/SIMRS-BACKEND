const { Role, Permission, Menu } = require('../models');

class RoleService {
  async getAllRoles() {
    return Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
        {
          model: Menu,
          as: 'menus',
          through: { attributes: [] },
        },
      ],
      order: [['role_id', 'ASC']],
    });
  }

  async getRoleById(id) {
    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
        {
          model: Menu,
          as: 'menus',
          through: { attributes: [] },
        },
      ],
    });
    if (!role) {
      const error = new Error('Role tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return role;
  }

  async createRole(data) {
    const existing = await Role.findOne({
      where: { kode_role: data.kode_role },
    });
    if (existing) {
      const error = new Error(`Kode Role '${data.kode_role}' sudah digunakan.`);
      error.statusCode = 409;
      throw error;
    }
    return Role.create(data);
  }

  async updateRole(id, data) {
    const role = await this.getRoleById(id);
    if (data.kode_role && data.kode_role !== role.kode_role) {
      const existing = await Role.findOne({
        where: { kode_role: data.kode_role },
      });
      if (existing) {
        const error = new Error(`Kode Role '${data.kode_role}' sudah digunakan.`);
        error.statusCode = 409;
        throw error;
      }
    }
    return role.update(data);
  }

  async deleteRole(id) {
    const role = await this.getRoleById(id);
    await role.destroy();
    return { role_id: id, id, message: 'Role berhasil dihapus.' };
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    const role = await this.getRoleById(roleId);
    await role.setPermissions(permissionIds);
    return role.getPermissions();
  }

  async assignMenusToRole(roleId, menuIds) {
    const role = await this.getRoleById(roleId);
    await role.setMenus(menuIds);
    return role.getMenus();
  }
}

module.exports = new RoleService();
