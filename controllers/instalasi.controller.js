const instalasiService = require('../services/instalasi.service');

class InstalasiController {
  async getAllInstalasi(req, res, next) {
    try {
      const includeRuangan = req.query.include_ruangan === 'true';
      const list = await instalasiService.getAllInstalasi(includeRuangan);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInstalasiById(req, res, next) {
    try {
      const data = await instalasiService.getInstalasiById(req.params.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInstalasi(req, res, next) {
    try {
      const created = await instalasiService.createInstalasi(req.body);
      return res.status(201).json({
        success: true,
        message: 'Instalasi berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInstalasi(req, res, next) {
    try {
      const updated = await instalasiService.updateInstalasi(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Instalasi berhasil diperbarui.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstalasi(req, res, next) {
    try {
      const result = await instalasiService.deleteInstalasi(req.params.id);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstalasiController();
