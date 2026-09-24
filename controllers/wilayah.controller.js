const wilayahService = require('../services/wilayah.service');

class WilayahController {
  // ==========================================
  // PROVINSI
  // ==========================================
  async getAllProvinsi(req, res, next) {
    try {
      const data = await wilayahService.getAllProvinsi(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProvinsiById(req, res, next) {
    try {
      const data = await wilayahService.getProvinsiById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createProvinsi(req, res, next) {
    try {
      const data = await wilayahService.createProvinsi(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Provinsi berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProvinsi(req, res, next) {
    try {
      const data = await wilayahService.updateProvinsi(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Provinsi berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProvinsi(req, res, next) {
    try {
      const result = await wilayahService.deleteProvinsi(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // KABUPATEN / KOTA
  // ==========================================
  async getAllKabupaten(req, res, next) {
    try {
      const data = await wilayahService.getAllKabupaten(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getKabupatenById(req, res, next) {
    try {
      const data = await wilayahService.getKabupatenById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createKabupaten(req, res, next) {
    try {
      const data = await wilayahService.createKabupaten(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Kabupaten/Kota berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateKabupaten(req, res, next) {
    try {
      const data = await wilayahService.updateKabupaten(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Kabupaten/Kota berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteKabupaten(req, res, next) {
    try {
      const result = await wilayahService.deleteKabupaten(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // KECAMATAN
  // ==========================================
  async getAllKecamatan(req, res, next) {
    try {
      const data = await wilayahService.getAllKecamatan(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getKecamatanById(req, res, next) {
    try {
      const data = await wilayahService.getKecamatanById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createKecamatan(req, res, next) {
    try {
      const data = await wilayahService.createKecamatan(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Kecamatan berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateKecamatan(req, res, next) {
    try {
      const data = await wilayahService.updateKecamatan(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Kecamatan berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteKecamatan(req, res, next) {
    try {
      const result = await wilayahService.deleteKecamatan(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // DESA / KELURAHAN
  // ==========================================
  async getAllDesa(req, res, next) {
    try {
      const data = await wilayahService.getAllDesa(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDesaById(req, res, next) {
    try {
      const data = await wilayahService.getDesaById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createDesa(req, res, next) {
    try {
      const data = await wilayahService.createDesa(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Desa/Kelurahan berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDesa(req, res, next) {
    try {
      const data = await wilayahService.updateDesa(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Desa/Kelurahan berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDesa(req, res, next) {
    try {
      const result = await wilayahService.deleteDesa(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // KODE POS
  // ==========================================
  async getAllKodePos(req, res, next) {
    try {
      const data = await wilayahService.getAllKodePos(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getKodePosByCode(req, res, next) {
    try {
      const data = await wilayahService.getKodePosByCode(req.params.kodePos);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getKodePosById(req, res, next) {
    try {
      const data = await wilayahService.getKodePosById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createKodePos(req, res, next) {
    try {
      const data = await wilayahService.createKodePos(req.body);
      return res.status(201).json({
        success: true,
        message: 'Data Kode Pos berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateKodePos(req, res, next) {
    try {
      const data = await wilayahService.updateKodePos(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Data Kode Pos berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteKodePos(req, res, next) {
    try {
      const result = await wilayahService.deleteKodePos(req.params.id);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WilayahController();
