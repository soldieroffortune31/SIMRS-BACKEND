const masterService = require('../services/master.service');

class MasterController {
  // Instalasi
  async getAllInstalasi(req, res, next) {
    try {
      const includeRuangan = req.query.include_ruangan === 'true';
      const list = await masterService.getAllInstalasi(includeRuangan);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInstalasi(req, res, next) {
    try {
      const created = await masterService.createInstalasi(req.body);
      return res.status(201).json({
        success: true,
        message: 'Instalasi berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  // Ruangan
  async getAllRuangan(req, res, next) {
    try {
      const instalasiId = req.query.instalasi_id ? parseInt(req.query.instalasi_id, 10) : null;
      const list = await masterService.getAllRuangan(instalasiId);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRuangan(req, res, next) {
    try {
      const created = await masterService.createRuangan(req.body);
      return res.status(201).json({
        success: true,
        message: 'Ruangan berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  // Roles
  async getAllRoles(req, res, next) {
    try {
      const list = await masterService.getAllRoles();
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const created = await masterService.createRole(req.body);
      return res.status(201).json({
        success: true,
        message: 'Role berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MasterController();
