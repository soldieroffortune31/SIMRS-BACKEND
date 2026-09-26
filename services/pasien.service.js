const { Op } = require('sequelize');
const {
  Pasien,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
  Pendaftaran,
  Ruangan,
  User,
} = require('../models');

class PasienService {
  /**
   * Helper untuk membuat No RM otomatis berurutan (RM-000001)
   */
  async generateNoRM(transaction = null) {
    const lastPasien = await Pasien.findOne({
      order: [['pasien_id', 'DESC']],
      attributes: ['pasien_id', 'no_rm'],
      paranoid: false,
      transaction,
    });

    let nextNumber = 1;
    if (lastPasien && lastPasien.no_rm) {
      const match = lastPasien.no_rm.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `RM-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Mengambil daftar master pasien dengan pencarian fleksibel & pagination
   */
  async getAllPasien(query = {}) {
    const { search, jenis_kelamin, jenis_penjamin, is_active, page, limit } = query;
    const where = {};

    if (jenis_kelamin) where.jenis_kelamin = jenis_kelamin.toUpperCase();
    if (jenis_penjamin) where.jenis_penjamin_default = jenis_penjamin.toUpperCase();
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { no_rm: { [Op.iLike]: `%${search}%` } },
        { nik: { [Op.iLike]: `%${search}%` } },
        { nama_lengkap: { [Op.iLike]: `%${search}%` } },
        { no_telepon: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        { model: Provinsi, as: 'provinsi', attributes: ['provinsi_id', 'nama_provinsi'] },
        { model: KabupatenKota, as: 'kabupaten', attributes: ['kabupaten_id', 'nama_kabupaten'] },
        { model: Kecamatan, as: 'kecamatan', attributes: ['kecamatan_id', 'nama_kecamatan'] },
        { model: DesaKelurahan, as: 'desa', attributes: ['desa_id', 'nama_desa', 'kode_pos'] },
      ],
      order: [['pasien_id', 'DESC']],
    };

    if (limit) {
      const take = parseInt(limit, 10);
      const skip = page ? (parseInt(page, 10) - 1) * take : 0;
      options.limit = take;
      options.offset = skip;
      return Pasien.findAndCountAll(options);
    }

    return Pasien.findAll(options);
  }

  /**
   * Detail data pasien berdasarkan ID beserta riwayat kunjungan pendaftaran
   */
  async getPasienById(id) {
    const pasien = await Pasien.findByPk(id, {
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
        {
          model: Pendaftaran,
          as: 'pendaftaran',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['ruangan_id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['user_id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error('Data Pasien tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return pasien;
  }

  /**
   * Cari Pasien Berdasarkan No RM
   */
  async getPasienByNoRM(no_rm) {
    const pasien = await Pasien.findOne({
      where: { no_rm },
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
        {
          model: Pendaftaran,
          as: 'pendaftaran',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['ruangan_id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['user_id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error(`Pasien dengan No RM '${no_rm}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return pasien;
  }

  /**
   * Cari Pasien Berdasarkan NIK
   */
  async getPasienByNIK(nik) {
    const pasien = await Pasien.findOne({
      where: { nik },
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
        {
          model: Pendaftaran,
          as: 'pendaftaran',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['ruangan_id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['user_id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error(`Pasien dengan NIK '${nik}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return pasien;
  }

  async getPasienByNik(nik) {
    return this.getPasienByNIK(nik);
  }

  /**
   * Pendaftaran master pasien baru terpadu
   */
  async createPasien(data, transaction = null) {
    // Validasi NIK unik jika disertakan
    if (data.nik && data.nik.trim() !== '') {
      const existingNik = await Pasien.findOne({
        where: { nik: data.nik },
        paranoid: false,
        transaction,
      });
      if (existingNik) {
        const error = new Error(`Pasien dengan NIK '${data.nik}' sudah terdaftar dalam sistem.`);
        error.statusCode = 409;
        throw error;
      }
    }

    // Generate No RM otomatis jika tidak disediakan secara manual
    if (!data.no_rm) {
      data.no_rm = await this.generateNoRM(transaction);
    }

    return Pasien.create(data, { transaction });
  }

  /**
   * Pembaruan data demografi pasien
   */
  async updatePasien(id, data) {
    const pasien = await this.getPasienById(id);

    // Cek duplikasi NIK selain dirinya sendiri
    if (data.nik && data.nik.trim() !== '' && data.nik !== pasien.nik) {
      const existingNik = await Pasien.findOne({
        where: { nik: data.nik, pasien_id: { [Op.ne]: id } },
        paranoid: false,
      });
      if (existingNik) {
        const error = new Error(`Pasien dengan NIK '${data.nik}' sudah terdaftar dalam sistem.`);
        error.statusCode = 409;
        throw error;
      }
    }

    return pasien.update(data);
  }

  /**
   * Soft delete pasien
   */
  async deletePasien(id) {
    const pasien = await this.getPasienById(id);
    await pasien.destroy();
    return { pasien_id: id, id, message: 'Data pasien berhasil dihapus.' };
  }
}

module.exports = new PasienService();
