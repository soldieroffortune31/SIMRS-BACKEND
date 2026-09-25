const { Instalasi, Ruangan } = require('../models');

class InstalasiService {
  async getAllInstalasi(includeRuangan = false) {
    const options = {
      order: [['id', 'ASC']],
    };
    if (includeRuangan) {
      options.include = [
        {
          model: Ruangan,
          as: 'ruangan',
          where: { is_active: true },
          required: false,
        },
      ];
    }
    return Instalasi.findAll(options);
  }

  async getInstalasiById(id) {
    const instalasi = await Instalasi.findByPk(id, {
      include: [
        {
          model: Ruangan,
          as: 'ruangan',
        },
      ],
    });
    if (!instalasi) {
      const error = new Error('Instalasi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return instalasi;
  }

  async createInstalasi(data) {
    const existing = await Instalasi.findOne({
      where: { kode_instalasi: data.kode_instalasi },
    });
    if (existing) {
      const error = new Error(`Kode Instalasi '${data.kode_instalasi}' sudah digunakan.`);
      error.statusCode = 409;
      throw error;
    }
    return Instalasi.create(data);
  }

  async updateInstalasi(id, data) {
    const instalasi = await this.getInstalasiById(id);
    if (data.kode_instalasi && data.kode_instalasi !== instalasi.kode_instalasi) {
      const existing = await Instalasi.findOne({
        where: { kode_instalasi: data.kode_instalasi },
      });
      if (existing) {
        const error = new Error(`Kode Instalasi '${data.kode_instalasi}' sudah digunakan.`);
        error.statusCode = 409;
        throw error;
      }
    }
    return instalasi.update(data);
  }

  async deleteInstalasi(id) {
    const instalasi = await this.getInstalasiById(id);
    await instalasi.destroy();
    return { id, message: 'Instalasi berhasil dihapus.' };
  }
}

module.exports = new InstalasiService();
