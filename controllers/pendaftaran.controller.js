const pendaftaranService = require('../services/pendaftaran.service');

class PendaftaranController {
  // ==========================================
  // PENDAFTARAN RAWAT JALAN
  // ==========================================
  async daftarRawatJalan(req, res, next) {
    try {
      const createdByUserId = req.user ? req.user.id : null;
      const data = await pendaftaranService.daftarRawatJalan(req.body, createdByUserId);
      return res.status(201).json({
        success: true,
        message: `Pendaftaran rawat jalan berhasil dibuat. No Antrean: ${data.no_antrean}, No Registrasi: ${data.no_registrasi}`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPendaftaran(req, res, next) {
    try {
      const data = await pendaftaranService.getAllPendaftaran(req.query);
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

  async getPendaftaranById(req, res, next) {
    try {
      const data = await pendaftaranService.getPendaftaranById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateStatusPendaftaran(req, res, next) {
    try {
      const { status_antrean, catatan } = req.body;
      const data = await pendaftaranService.updateStatusPendaftaran(req.params.id, status_antrean, catatan);
      return res.status(200).json({
        success: true,
        message: `Status pendaftaran berhasil diperbarui menjadi ${status_antrean}.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PendaftaranController();
