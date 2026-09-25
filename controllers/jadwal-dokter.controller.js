const jadwalDokterService = require('../services/jadwal-dokter.service');

class JadwalDokterController {
  async getAllJadwalDokter(req, res, next) {
    try {
      const data = await jadwalDokterService.getAllJadwalDokter(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getJadwalDokterById(req, res, next) {
    try {
      const data = await jadwalDokterService.getJadwalDokterById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createJadwalDokter(req, res, next) {
    try {
      const data = await jadwalDokterService.createJadwalDokter(req.body);
      return res.status(201).json({
        success: true,
        message: 'Jadwal dokter berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJadwalDokter(req, res, next) {
    try {
      const data = await jadwalDokterService.updateJadwalDokter(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Jadwal dokter berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJadwalDokter(req, res, next) {
    try {
      const result = await jadwalDokterService.deleteJadwalDokter(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JadwalDokterController();
