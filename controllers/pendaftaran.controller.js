const pendaftaranService = require('../services/pendaftaran.service');

class PendaftaranController {
  // ==========================================
  // MASTER PASIEN
  // ==========================================
  async getAllPasien(req, res, next) {
    try {
      const data = await pendaftaranService.getAllPasien(req.query);
      return res.status(200).json({ success: true, data: data.rows || data, count: data.count, rows: data.rows || data });
    } catch (error) {
      next(error);
    }
  }

  async getPasienById(req, res, next) {
    try {
      const data = await pendaftaranService.getPasienById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createPasien(req, res, next) {
    try {
      const data = await pendaftaranService.createPasien(req.body);
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
      const data = await pendaftaranService.updatePasien(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Pasien berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // JADWAL DOKTER
  // ==========================================
  async getAllJadwalDokter(req, res, next) {
    try {
      const data = await pendaftaranService.getAllJadwalDokter(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getJadwalDokterById(req, res, next) {
    try {
      const data = await pendaftaranService.getJadwalDokterById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createJadwalDokter(req, res, next) {
    try {
      const data = await pendaftaranService.createJadwalDokter(req.body);
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
      const data = await pendaftaranService.updateJadwalDokter(req.params.id, req.body);
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
      const result = await pendaftaranService.deleteJadwalDokter(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

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
      return res.status(200).json({ success: true, data: data.rows || data, count: data.count, rows: data.rows || data });
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
