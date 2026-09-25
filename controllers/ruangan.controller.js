const ruanganService = require('../services/ruangan.service');

class RuanganController {
  async getAllRuangan(req, res, next) {
    try {
      const instalasiId = req.query.instalasi_id ? parseInt(req.query.instalasi_id, 10) : null;
      const list = await ruanganService.getAllRuangan(instalasiId);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRuanganById(req, res, next) {
    try {
      const data = await ruanganService.getRuanganById(req.params.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRuangan(req, res, next) {
    try {
      const created = await ruanganService.createRuangan(req.body);
      return res.status(201).json({
        success: true,
        message: 'Ruangan berhasil dibuat.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRuangan(req, res, next) {
    try {
      const updated = await ruanganService.updateRuangan(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Ruangan berhasil diperbarui.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRuangan(req, res, next) {
    try {
      const result = await ruanganService.deleteRuangan(req.params.id);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RuanganController();
