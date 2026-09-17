const authService = require('../services/auth.service');
const menuService = require('../services/menu.service');

class AuthController {
  /**
   * Menangani login kredensial (mendukung login 2-step maupun direct 1-step)
   */
  async login(req, res, next) {
    try {
      const { username, password, instalasi_id, ruangan_id } = req.body;
      const explicitContext = (instalasi_id && ruangan_id) ? { instalasi_id, ruangan_id } : null;

      const result = await authService.login(username, password, explicitContext);

      return res.status(200).json({
        success: true,
        message: result.message || 'Login berhasil.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menangani pemilihan ruangan & instalasi aktif setelah login
   */
  async selectContext(req, res, next) {
    try {
      const { instalasi_id, ruangan_id } = req.body;
      const userId = req.user.userId;

      const result = await authService.selectContext(userId, instalasi_id, ruangan_id);

      return res.status(200).json({
        success: true,
        message: 'Konteks Ruangan dan Instalasi berhasil diaktifkan.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menangani pergantian konteks ruangan saat sudah aktif login
   */
  async switchContext(req, res, next) {
    try {
      const { instalasi_id, ruangan_id } = req.body;
      const userId = req.user.userId;

      const result = await authService.switchContext(userId, instalasi_id, ruangan_id);

      return res.status(200).json({
        success: true,
        message: 'Berhasil beralih ke Ruangan baru.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil data profil dan sesi aktif pengguna saat ini
   */
  async getMe(req, res, next) {
    try {
      const result = await authService.getCurrentSession(req.user);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil struktur menu dan permission untuk sesi aktif saat ini
   */
  async getMenus(req, res, next) {
    try {
      if (!req.user.roleId || !req.user.instalasiId) {
        return res.status(400).json({
          success: false,
          message: 'Konteks sesi belum aktif. Silakan pilih ruangan terlebih dahulu.',
        });
      }

      const result = await menuService.getMenuAndPermissionsForContext(
        req.user.roleId,
        req.user.instalasiId
      );

      return res.status(200).json({
        success: true,
        data: {
          context: {
            instalasi_id: req.user.instalasiId,
            instalasi_code: req.user.instalasiCode,
            ruangan_id: req.user.ruanganId,
            ruangan_code: req.user.ruanganCode,
            role_code: req.user.roleCode,
          },
          menus: result.menuTree,
          permissions: result.permissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
