const instalasiService = require('./instalasi.service');
const ruanganService = require('./ruangan.service');
const roleService = require('./role.service');

class MasterService {
  // --- INSTALASI ---
  async getAllInstalasi(includeRuangan = false) {
    return instalasiService.getAllInstalasi(includeRuangan);
  }

  async getInstalasiById(id) {
    return instalasiService.getInstalasiById(id);
  }

  async createInstalasi(data) {
    return instalasiService.createInstalasi(data);
  }

  // --- RUANGAN ---
  async getAllRuangan(instalasiId = null) {
    return ruanganService.getAllRuangan(instalasiId);
  }

  async getRuanganById(id) {
    return ruanganService.getRuanganById(id);
  }

  async createRuangan(data) {
    return ruanganService.createRuangan(data);
  }

  // --- ROLES & PERMISSIONS ---
  async getAllRoles() {
    return roleService.getAllRoles();
  }

  async getRoleById(id) {
    return roleService.getRoleById(id);
  }

  async createRole(data) {
    return roleService.createRole(data);
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    return roleService.assignPermissionsToRole(roleId, permissionIds);
  }

  async assignMenusToRole(roleId, menuIds) {
    return roleService.assignMenusToRole(roleId, menuIds);
  }
}

module.exports = new MasterService();
