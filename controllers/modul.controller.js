const modulService = require('../services/modul.service');

class ModulController {
  async getAllModul(req, res, next) {
    try {
      const includeMenus = req.query.include_menus === 'true';
      const modules = await modulService.getAllModul(includeMenus);
      return res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  }

  async createModul(req, res, next) {
    try {
      const created = await modulService.createModul(req.body);
      return res.status(201).json({
        success: true,
        message: 'Modul baru berhasil ditambahkan.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Mengatur modul untuk Instalasi
   */
  async assignToInstalasi(req, res, next) {
    try {
      const { instalasi_id, modul_ids } = req.body;
      const result = await modulService.assignModulToInstalasi(instalasi_id, modul_ids);
      return res.status(200).json({
        success: true,
        message: 'Pengaturan modul instalasi berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Mengatur modul untuk Ruangan
   */
  async assignToRuangan(req, res, next) {
    try {
      const { ruangan_id, modul_ids } = req.body;
      const result = await modulService.assignModulToRuangan(ruangan_id, modul_ids);
      return res.status(200).json({
        success: true,
        message: 'Pengaturan modul ruangan berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Mengatur modul untuk Akun Pengguna spesifik di Ruangan tertentu
   */
  async assignToUserRuangan(req, res, next) {
    try {
      const { user_id, ruangan_id, modul_ids } = req.body;
      const result = await modulService.assignModulToUserRuangan(user_id, ruangan_id, modul_ids);
      return res.status(200).json({
        success: true,
        message: 'Hak akses modul pengguna pada ruangan berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil daftar modul yang berhak diakses pada sesi user saat ini
   */
  async getMyModules(req, res, next) {
    try {
      const { userId, ruanganId, instalasiId, roleCode } = req.user;
      const modules = await modulService.getUserAccessibleModules(
        userId,
        ruanganId,
        instalasiId,
        roleCode
      );
      return res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModulController();
