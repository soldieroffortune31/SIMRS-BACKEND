const roleService = require('../services/role.service');

class RoleController {
  async getAllRoles(req, res, next) {
    try {
      const list = await roleService.getAllRoles();
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const data = await roleService.getRoleById(req.params.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const created = await roleService.createRole(req.body);
      return res.status(201).json({
        success: true,
        message: 'Role berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const updated = await roleService.updateRole(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Role berhasil diperbarui.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const result = await roleService.deleteRole(req.params.id);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignPermissionsToRole(req, res, next) {
    try {
      const { permission_ids } = req.body;
      const result = await roleService.assignPermissionsToRole(req.params.id, permission_ids);
      return res.status(200).json({
        success: true,
        message: 'Hak akses permission untuk role berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignMenusToRole(req, res, next) {
    try {
      const { menu_ids } = req.body;
      const result = await roleService.assignMenusToRole(req.params.id, menu_ids);
      return res.status(200).json({
        success: true,
        message: 'Hak akses menu untuk role berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
