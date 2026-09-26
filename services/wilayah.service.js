const { Op } = require('sequelize');
const {
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
  KodePos,
} = require('../models');

class WilayahService {
  // ==========================================
  // 1. PROVINSI
  // ==========================================
  async getAllProvinsi(query = {}) {
    const { search, is_active, include_kabupaten, page, limit } = query;
    const where = {};

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { kode_provinsi: { [Op.iLike]: `%${search}%` } },
        { nama_provinsi: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      order: [['kode_provinsi', 'ASC']],
    };

    if (include_kabupaten === 'true' || include_kabupaten === true) {
      options.include = [
        {
          model: KabupatenKota,
          as: 'kabupaten_kota',
          where: { is_active: true },
          required: false,
        },
      ];
    }

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return Provinsi.findAndCountAll(options);
    }

    return Provinsi.findAll(options);
  }

  async getProvinsiById(id) {
    const provinsi = await Provinsi.findByPk(id, {
      include: [
        {
          model: KabupatenKota,
          as: 'kabupaten_kota',
        },
      ],
    });
    if (!provinsi) {
      const error = new Error('Data Provinsi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return provinsi;
  }

  async createProvinsi(data) {
    return Provinsi.create(data);
  }

  async updateProvinsi(id, data) {
    const provinsi = await this.getProvinsiById(id);
    return provinsi.update(data);
  }

  async deleteProvinsi(id) {
    const provinsi = await this.getProvinsiById(id);
    await provinsi.destroy();
    return { provinsi_id: id, id, message: 'Provinsi berhasil dihapus.' };
  }

  // ==========================================
  // 2. KABUPATEN / KOTA
  // ==========================================
  async getAllKabupaten(query = {}) {
    const { provinsi_id, tipe, search, is_active, page, limit } = query;
    const where = {};

    if (provinsi_id) {
      where.provinsi_id = parseInt(provinsi_id, 10);
    }

    if (tipe) {
      where.tipe = tipe.toUpperCase();
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { kode_kabupaten: { [Op.iLike]: `%${search}%` } },
        { nama_kabupaten: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        {
          model: Provinsi,
          as: 'provinsi',
          attributes: ['provinsi_id', 'kode_provinsi', 'nama_provinsi'],
        },
      ],
      order: [['kode_kabupaten', 'ASC']],
    };

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return KabupatenKota.findAndCountAll(options);
    }

    return KabupatenKota.findAll(options);
  }

  async getKabupatenById(id) {
    const kab = await KabupatenKota.findByPk(id, {
      include: [
        {
          model: Provinsi,
          as: 'provinsi',
        },
        {
          model: Kecamatan,
          as: 'kecamatan',
        },
      ],
    });
    if (!kab) {
      const error = new Error('Data Kabupaten/Kota tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return kab;
  }

  async createKabupaten(data) {
    const provinsi = await Provinsi.findByPk(data.provinsi_id);
    if (!provinsi) {
      const error = new Error('Provinsi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return KabupatenKota.create(data);
  }

  async updateKabupaten(id, data) {
    const kab = await this.getKabupatenById(id);
    if (data.provinsi_id) {
      const provinsi = await Provinsi.findByPk(data.provinsi_id);
      if (!provinsi) {
        const error = new Error('Provinsi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }
    return kab.update(data);
  }

  async deleteKabupaten(id) {
    const kab = await this.getKabupatenById(id);
    await kab.destroy();
    return { kabupaten_id: id, id, message: 'Kabupaten/Kota berhasil dihapus.' };
  }

  // ==========================================
  // 3. KECAMATAN
  // ==========================================
  async getAllKecamatan(query = {}) {
    const { kabupaten_id, search, is_active, page, limit } = query;
    const where = {};

    if (kabupaten_id) {
      where.kabupaten_id = parseInt(kabupaten_id, 10);
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { kode_kecamatan: { [Op.iLike]: `%${search}%` } },
        { nama_kecamatan: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        {
          model: KabupatenKota,
          as: 'kabupaten',
          attributes: ['kabupaten_id', 'kode_kabupaten', 'nama_kabupaten', 'tipe'],
        },
      ],
      order: [['kode_kecamatan', 'ASC']],
    };

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return Kecamatan.findAndCountAll(options);
    }

    return Kecamatan.findAll(options);
  }

  async getKecamatanById(id) {
    const kec = await Kecamatan.findByPk(id, {
      include: [
        {
          model: KabupatenKota,
          as: 'kabupaten',
        },
        {
          model: DesaKelurahan,
          as: 'desa_kelurahan',
        },
      ],
    });
    if (!kec) {
      const error = new Error('Data Kecamatan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return kec;
  }

  async createKecamatan(data) {
    const kabupaten = await KabupatenKota.findByPk(data.kabupaten_id);
    if (!kabupaten) {
      const error = new Error('Kabupaten/Kota tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return Kecamatan.create(data);
  }

  async updateKecamatan(id, data) {
    const kec = await this.getKecamatanById(id);
    if (data.kabupaten_id) {
      const kabupaten = await KabupatenKota.findByPk(data.kabupaten_id);
      if (!kabupaten) {
        const error = new Error('Kabupaten/Kota tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }
    return kec.update(data);
  }

  async deleteKecamatan(id) {
    const kec = await this.getKecamatanById(id);
    await kec.destroy();
    return { kecamatan_id: id, id, message: 'Kecamatan berhasil dihapus.' };
  }

  // ==========================================
  // 4. DESA / KELURAHAN
  // ==========================================
  async getAllDesa(query = {}) {
    const { kecamatan_id, tipe, search, is_active, page, limit } = query;
    const where = {};

    if (kecamatan_id) {
      where.kecamatan_id = parseInt(kecamatan_id, 10);
    }

    if (tipe) {
      where.tipe = tipe.toUpperCase();
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { kode_desa: { [Op.iLike]: `%${search}%` } },
        { nama_desa: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        {
          model: Kecamatan,
          as: 'kecamatan',
          attributes: ['kecamatan_id', 'kode_kecamatan', 'nama_kecamatan'],
          include: [
            {
              model: KabupatenKota,
              as: 'kabupaten',
              attributes: ['kabupaten_id', 'kode_kabupaten', 'nama_kabupaten', 'tipe'],
            },
          ],
        },
      ],
      order: [['kode_desa', 'ASC']],
    };

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return DesaKelurahan.findAndCountAll(options);
    }

    return DesaKelurahan.findAll(options);
  }

  async getDesaById(id) {
    const desa = await DesaKelurahan.findByPk(id, {
      include: [
        {
          model: Kecamatan,
          as: 'kecamatan',
          include: [
            {
              model: KabupatenKota,
              as: 'kabupaten',
            },
          ],
        },
      ],
    });
    if (!desa) {
      const error = new Error('Data Desa/Kelurahan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return desa;
  }

  async createDesa(data) {
    const kecamatan = await Kecamatan.findByPk(data.kecamatan_id);
    if (!kecamatan) {
      const error = new Error('Kecamatan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return DesaKelurahan.create(data);
  }

  async updateDesa(id, data) {
    const desa = await this.getDesaById(id);
    if (data.kecamatan_id) {
      const kecamatan = await Kecamatan.findByPk(data.kecamatan_id);
      if (!kecamatan) {
        const error = new Error('Kecamatan tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }
    return desa.update(data);
  }

  async deleteDesa(id) {
    const desa = await this.getDesaById(id);
    await desa.destroy();
    return { desa_id: id, id, message: 'Desa/Kelurahan berhasil dihapus.' };
  }

  // ==========================================
  // 5. KODE POS (SEARCH & LOOKUP)
  // ==========================================
  async getAllKodePos(query = {}) {
    const { kode_pos, desa_id, kecamatan_id, kabupaten_id, provinsi_id, search, page, limit } = query;
    const where = {};

    if (kode_pos) where.kode_pos = kode_pos;
    if (desa_id) where.desa_id = parseInt(desa_id, 10);
    if (kecamatan_id) where.kecamatan_id = parseInt(kecamatan_id, 10);
    if (kabupaten_id) where.kabupaten_id = parseInt(kabupaten_id, 10);
    if (provinsi_id) where.provinsi_id = parseInt(provinsi_id, 10);

    if (search) {
      where[Op.or] = [
        { kode_pos: { [Op.iLike]: `%${search}%` } },
        { keterangan: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        { model: Provinsi, as: 'provinsi', attributes: ['provinsi_id', 'kode_provinsi', 'nama_provinsi'] },
        { model: KabupatenKota, as: 'kabupaten', attributes: ['kabupaten_id', 'kode_kabupaten', 'nama_kabupaten', 'tipe'] },
        { model: Kecamatan, as: 'kecamatan', attributes: ['kecamatan_id', 'kode_kecamatan', 'nama_kecamatan'] },
        { model: DesaKelurahan, as: 'desa', attributes: ['desa_id', 'kode_desa', 'nama_desa', 'tipe', 'kode_pos'] },
      ],
      order: [['kode_pos', 'ASC']],
    };

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return KodePos.findAndCountAll(options);
    }

    return KodePos.findAll(options);
  }

  async getKodePosByCode(kodePos) {
    return this.searchKodePos(kodePos);
  }

  async searchKodePos(kode) {
    const results = await KodePos.findAll({
      where: {
        kode_pos: { [Op.like]: `${kode}%` },
        is_active: true,
      },
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
      ],
      limit: 20,
    });
    return results;
  }

  async getKodePosById(id) {
    const kodepos = await KodePos.findByPk(id, {
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
      ],
    });
    if (!kodepos) {
      const error = new Error('Data Kode Pos tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return kodepos;
  }

  async createKodePos(data) {
    return KodePos.create(data);
  }

  async updateKodePos(id, data) {
    const kodepos = await this.getKodePosById(id);
    return kodepos.update(data);
  }

  async deleteKodePos(id) {
    const kodepos = await this.getKodePosById(id);
    await kodepos.destroy();
    return { kodepos_id: id, kode_pos_id: id, id, message: 'Kode Pos berhasil dihapus.' };
  }
}

module.exports = new WilayahService();
