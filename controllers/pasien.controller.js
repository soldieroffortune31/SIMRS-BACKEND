const pasienService = require('../services/pasien.service');

class PasienController {
  async getAllPasien(req, res, next) {
    try {
      const data = await pasienService.getAllPasien(req.query);
      return res.status(200).json({
        success: true,
        data: data.rows || data,
        count: data.count,
        rows: data.rows || data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPasienById(req, res, next) {
    try {
      const data = await pasienService.getPasienById(req.params.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPasienByNoRM(req, res, next) {
    try {
      const data = await pasienService.getPasienByNoRM(req.params.no_rm);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPasienByNIK(req, res, next) {
    try {
      const data = await pasienService.getPasienByNIK(req.params.nik);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPasien(req, res, next) {
    try {
      const data = await pasienService.createPasien(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Pasien baru berhasil didaftarkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePasien(req, res, next) {
    try {
      const data = await pasienService.updatePasien(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Pasien berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePasien(req, res, next) {
    try {
      const result = await pasienService.deletePasien(req.params.id);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PasienController();
