const { Op } = require('sequelize');
const {
  Modul,
  ModulInstalasi,
  ModulRuangan,
  UserRuanganModul,
  Instalasi,
  Ruangan,
  User,
  Menu,
} = require('../models');

class ModulService {
  /**
   * Mengambil semua modul SIMRS
   */
  async getAllModul(includeMenus = false) {
    const options = {
      where: { is_active: true },
      order: [['order_index', 'ASC']],
    };

    if (includeMenus) {
      options.include = [
        {
          model: Menu,
          as: 'menus',
          where: { is_active: true },
          required: false,
        },
      ];
    }

    return Modul.findAll(options);
  }

  /**
   * Menambahkan modul baru
   */
  async createModul(data) {
    return Modul.create(data);
  }

  /**
   * Admin: Mengatur modul yang aktif pada suatu Instalasi
   */
  async assignModulToInstalasi(instalasiId, modulIds = []) {
    const instalasi = await Instalasi.findByPk(instalasiId);
    if (!instalasi) {
      const error = new Error('Instalasi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    // Hapus relasi lama lalu masukkan yang baru
    await ModulInstalasi.destroy({
      where: { instalasi_id: instalasiId },
      force: true,
    });

    if (modulIds.length > 0) {
      const rows = modulIds.map(modulId => ({
        instalasi_id: instalasiId,
        modul_id: modulId,
        is_active: true,
      }));
      await ModulInstalasi.bulkCreate(rows);
    }

    return this.getModulByInstalasi(instalasiId);
  }

  /**
   * Ambil modul yang terpasang di Instalasi
   */
  async getModulByInstalasi(instalasiId) {
    return Modul.findAll({
      include: [
        {
          model: Instalasi,
          as: 'instalasi_list',
          where: { instalasi_id: instalasiId },
          through: { attributes: ['is_active'], where: { is_active: true } },
        },
      ],
      order: [['order_index', 'ASC']],
    });
  }

  /**
   * Admin: Mengatur modul yang aktif pada suatu Ruangan
   */
  async assignModulToRuangan(ruanganId, modulIds = []) {
    const ruangan = await Ruangan.findByPk(ruanganId);
    if (!ruangan) {
      const error = new Error('Ruangan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    await ModulRuangan.destroy({
      where: { ruangan_id: ruanganId },
      force: true,
    });

    if (modulIds.length > 0) {
      const rows = modulIds.map(modulId => ({
        ruangan_id: ruanganId,
        modul_id: modulId,
        is_active: true,
      }));
      await ModulRuangan.bulkCreate(rows);
    }

    return this.getModulByRuangan(ruanganId);
  }

  /**
   * Ambil modul yang terpasang di Ruangan
   */
  async getModulByRuangan(ruanganId) {
    return Modul.findAll({
      include: [
        {
          model: Ruangan,
          as: 'ruangan_list',
          where: { ruangan_id: ruanganId },
          through: { attributes: ['is_active'], where: { is_active: true } },
        },
      ],
      order: [['order_index', 'ASC']],
    });
  }

  /**
   * Admin: Memberikan hak akses modul secara spesifik kepada Akun User di Ruangan tertentu
   */
  async assignModulToUserRuangan(userId, ruanganId, modulIds = []) {
    const [user, ruangan] = await Promise.all([
      User.findByPk(userId),
      Ruangan.findByPk(ruanganId),
    ]);

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    if (!ruangan) {
      const error = new Error('Ruangan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    await UserRuanganModul.destroy({
      where: { user_id: userId, ruangan_id: ruanganId },
      force: true,
    });

    if (modulIds.length > 0) {
      const rows = modulIds.map(modulId => ({
        user_id: userId,
        ruangan_id: ruanganId,
        modul_id: modulId,
        is_active: true,
      }));
      await UserRuanganModul.bulkCreate(rows);
    }

    return this.getUserAccessibleModules(userId, ruanganId, ruangan.instalasi_id);
  }

  /**
   * Mengkalkulasi daftar modul yang berhak diakses oleh User pada Ruangan & Instalasi aktif
   */
  async getUserAccessibleModules(userId, ruanganId, instalasiId, roleCode = null) {
    // 1. Role ADMIN mendapat akses semua modul
    if (roleCode === 'ADMIN') {
      return Modul.findAll({
        where: { is_active: true },
        order: [['order_index', 'ASC']],
      });
    }

    // 2. Cek apakah ada hak akses modul eksplisit untuk akun pengguna di ruangan ini
    const userModules = await UserRuanganModul.findAll({
      where: {
        user_id: userId,
        ruangan_id: ruanganId,
        is_active: true,
      },
      include: [
        {
          model: Modul,
          as: 'modul',
          where: { is_active: true },
        },
      ],
      order: [[{ model: Modul, as: 'modul' }, 'order_index', 'ASC']],
    });

    if (userModules.length > 0) {
      return userModules.map(um => um.modul);
    }

    // 3. Fallback: Ambil modul yang dipetakan pada Ruangan
    const roomModules = await ModulRuangan.findAll({
      where: {
        ruangan_id: ruanganId,
        is_active: true,
      },
      include: [
        {
          model: Modul,
          as: 'modul',
          where: { is_active: true },
        },
      ],
      order: [[{ model: Modul, as: 'modul' }, 'order_index', 'ASC']],
    });

    if (roomModules.length > 0) {
      return roomModules.map(rm => rm.modul);
    }

    // 4. Fallback: Ambil modul yang dipetakan pada Instalasi
    const instModules = await ModulInstalasi.findAll({
      where: {
        instalasi_id: instalasiId,
        is_active: true,
      },
      include: [
        {
          model: Modul,
          as: 'modul',
          where: { is_active: true },
        },
      ],
      order: [[{ model: Modul, as: 'modul' }, 'order_index', 'ASC']],
    });

    if (instModules.length > 0) {
      return instModules.map(im => im.modul);
    }

    // 5. Jika belum ada pemetaan modul sama sekali, kembalikan array kosong
    return [];
  }
}

module.exports = new ModulService();
