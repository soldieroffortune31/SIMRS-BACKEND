const menuService = require('../services/menu.service');
const masterService = require('../services/master.service');

class MenuController {
  async getAllMenus(req, res, next) {
    try {
      const asTree = req.query.tree === 'true';
      const menus = await menuService.getAllMenus(asTree);
      return res.status(200).json({
        success: true,
        data: menus,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignMenusToRole(req, res, next) {
    try {
      const { role_id, menu_ids } = req.body;
      const result = await masterService.assignMenusToRole(role_id, menu_ids);
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

module.exports = new MenuController();
