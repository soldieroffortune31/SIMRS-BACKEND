const { JadwalDokter, User, Ruangan } = require('../models');

class JadwalDokterService {
  /**
   * Mengambil daftar seluruh jadwal dokter dengan filter ruangan, dokter, hari, dan keaktifan
   */
  async getAllJadwalDokter(query = {}) {
    const { ruangan_id, dokter_id, hari, is_active } = query;
    const where = {};

    if (ruangan_id) where.ruangan_id = parseInt(ruangan_id, 10);
    if (dokter_id) where.dokter_id = dokter_id;
    if (hari) where.hari = hari.toUpperCase();
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    return JadwalDokter.findAll({
      where,
      include: [
        {
          model: User,
          as: 'dokter',
          attributes: ['user_id', 'username', 'nama_lengkap', 'nip_nik'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          attributes: ['ruangan_id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
        },
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC'],
      ],
    });
  }

  /**
   * Mengambil detail jadwal dokter berdasarkan ID
   */
  async getJadwalDokterById(id) {
    const jadwal = await JadwalDokter.findByPk(id, {
      include: [
        { model: User, as: 'dokter', attributes: ['user_id', 'username', 'nama_lengkap', 'nip_nik'] },
        { model: Ruangan, as: 'ruangan', attributes: ['ruangan_id', 'kode_ruangan', 'nama_ruangan'] },
      ],
    });

    if (!jadwal) {
      const error = new Error('Jadwal dokter tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return jadwal;
  }

  /**
   * Menambahkan jadwal dokter baru
   */
  async createJadwalDokter(data) {
    const dokter = await User.findByPk(data.dokter_id);
    if (!dokter) {
      const error = new Error('Akun Dokter tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const ruangan = await Ruangan.findByPk(data.ruangan_id);
    if (!ruangan) {
      const error = new Error('Ruangan / Poliklinik tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return JadwalDokter.create(data);
  }

  /**
   * Memperbarui jadwal dokter
   */
  async updateJadwalDokter(id, data) {
    const jadwal = await this.getJadwalDokterById(id);

    if (data.dokter_id && data.dokter_id !== jadwal.dokter_id) {
      const dokter = await User.findByPk(data.dokter_id);
      if (!dokter) {
        const error = new Error('Akun Dokter tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }

    if (data.ruangan_id && data.ruangan_id !== jadwal.ruangan_id) {
      const ruangan = await Ruangan.findByPk(data.ruangan_id);
      if (!ruangan) {
        const error = new Error('Ruangan / Poliklinik tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    }

    return jadwal.update(data);
  }

  /**
   * Menghapus jadwal dokter
   */
  async deleteJadwalDokter(id) {
    const jadwal = await this.getJadwalDokterById(id);
    await jadwal.destroy();
    return { jadwaldokter_id: id, jadwal_dokter_id: id, id, message: 'Jadwal dokter berhasil dihapus.' };
  }
}

module.exports = new JadwalDokterService();
