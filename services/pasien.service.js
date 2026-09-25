const { Op } = require('sequelize');
const {
  sequelize,
  Pasien,
  Pendaftaran,
  User,
  Ruangan,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
} = require('../models');

class PasienService {
  /**
   * Menghasilkan Nomor Rekam Medis (No RM) berurutan
   */
  async generateNoRM(transaction = null) {
    const lastPatient = await Pasien.findOne({
      order: [['created_at', 'DESC']],
      paranoid: false,
      transaction,
    });

    let nextNumber = 1;
    if (lastPatient && lastPatient.no_rm) {
      const numeric = parseInt(lastPatient.no_rm.replace(/\D/g, ''), 10);
      if (!isNaN(numeric)) {
        nextNumber = numeric + 1;
      }
    }
    return `RM-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Mengambil daftar seluruh pasien dengan filter & paginasi
   */
  async getAllPasien(query = {}) {
    const { search, jenis_kelamin, is_active, page = 1, limit = 20 } = query;
    const where = {};

    if (jenis_kelamin) {
      where.jenis_kelamin = jenis_kelamin;
    }

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

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    return Pasien.findAndCountAll({
      where,
      include: [
        { model: Provinsi, as: 'provinsi', attributes: ['id', 'nama_provinsi'] },
        { model: KabupatenKota, as: 'kabupaten', attributes: ['id', 'nama_kabupaten'] },
        { model: Kecamatan, as: 'kecamatan', attributes: ['id', 'nama_kecamatan'] },
        { model: DesaKelurahan, as: 'desa', attributes: ['id', 'nama_desa', 'kode_pos'] },
      ],
      order: [['created_at', 'DESC']],
      limit: take,
      offset: skip,
    });
  }

  /**
   * Detail pasien berdasarkan ID
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
          as: 'kunjungan_rawat_jalan',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error('Data pasien tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return pasien;
  }

  /**
   * Cari pasien berdasarkan No RM
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
          as: 'kunjungan_rawat_jalan',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error(`Data pasien dengan No. RM '${no_rm}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return pasien;
  }

  /**
   * Cari pasien berdasarkan NIK
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
          as: 'kunjungan_rawat_jalan',
          limit: 10,
          order: [['tanggal_kunjungan', 'DESC']],
          include: [
            { model: Ruangan, as: 'ruangan', attributes: ['id', 'nama_ruangan'] },
            { model: User, as: 'dokter', attributes: ['id', 'nama_lengkap'] },
          ],
        },
      ],
    });

    if (!pasien) {
      const error = new Error(`Data pasien dengan NIK '${nik}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return pasien;
  }

  /**
   * Registrasi / Buat Pasien Baru
   */
  async createPasien(data, transaction = null) {
    const sanitized = { ...data };
    for (const key of Object.keys(sanitized)) {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = null;
      }
    }
    data = sanitized;

    if (data.nik) {
      const existing = await Pasien.findOne({
        where: { nik: data.nik },
        paranoid: false,
        transaction,
      });
      if (existing) {
        const error = new Error(`Pasien dengan NIK ${data.nik} sudah terdaftar dengan No. RM: ${existing.no_rm}.`);
        error.statusCode = 409;
        throw error;
      }
    }

    const no_rm = await this.generateNoRM(transaction);
    const payload = {
      ...data,
      no_rm,
    };

    return Pasien.create(payload, { transaction });
  }

  /**
   * Perbarui Data Pasien
   */
  async updatePasien(id, data) {
    const pasien = await this.getPasienById(id);

    if (data.nik && data.nik !== pasien.nik) {
      const existing = await Pasien.findOne({
        where: { nik: data.nik, id: { [Op.ne]: id } },
      });
      if (existing) {
        const error = new Error(`NIK ${data.nik} sudah terdaftar pada pasien lain.`);
        error.statusCode = 409;
        throw error;
      }
    }

    return pasien.update(data);
  }

  /**
   * Hapus / Nonaktifkan Data Pasien (Soft Delete)
   */
  async deletePasien(id) {
    const pasien = await this.getPasienById(id);
    await pasien.destroy();
    return { id, message: 'Data pasien berhasil dihapus.' };
  }
}

module.exports = new PasienService();
