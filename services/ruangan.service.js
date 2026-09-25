const { Ruangan, Instalasi } = require('../models');

class RuanganService {
  async getAllRuangan(instalasiId = null) {
    const where = {};
    if (instalasiId) {
      where.instalasi_id = instalasiId;
    }
    return Ruangan.findAll({
      where,
      include: [
        {
          model: Instalasi,
          as: 'instalasi',
          attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
        },
      ],
      order: [['id', 'ASC']],
    });
  }

  async getRuanganById(id) {
    const ruangan = await Ruangan.findByPk(id, {
      include: [
        {
          model: Instalasi,
          as: 'instalasi',
          attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
        },
      ],
    });
    if (!ruangan) {
      const error = new Error('Ruangan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return ruangan;
  }

  async createRuangan(data) {
    const instalasi = await Instalasi.findByPk(data.instalasi_id);
    if (!instalasi) {
      const error = new Error('Instalasi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await Ruangan.findOne({
      where: { kode_ruangan: data.kode_ruangan },
    });
    if (existing) {
      const error = new Error(`Kode Ruangan '${data.kode_ruangan}' sudah digunakan.`);
      error.statusCode = 409;
      throw error;
    }

    return Ruangan.create(data);
  }

  async updateRuangan(id, data) {
    const ruangan = await this.getRuanganById(id);

    if (data.instalasi_id && data.instalasi_id !== ruangan.instalasi_id) {
      const instalasi = await Instalasi.findByPk(data.instalasi_id);
      if (!instalasi) {
        const error = new Error('Instalasi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }

    if (data.kode_ruangan && data.kode_ruangan !== ruangan.kode_ruangan) {
      const existing = await Ruangan.findOne({
        where: { kode_ruangan: data.kode_ruangan },
      });
      if (existing) {
        const error = new Error(`Kode Ruangan '${data.kode_ruangan}' sudah digunakan.`);
        error.statusCode = 409;
        throw error;
      }
    }

    return ruangan.update(data);
  }

  async deleteRuangan(id) {
    const ruangan = await this.getRuanganById(id);
    await ruangan.destroy();
    return { id, message: 'Ruangan berhasil dihapus.' };
  }
}

module.exports = new RuanganService();
