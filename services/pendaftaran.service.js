const { Op } = require('sequelize');
const {
  sequelize,
  Pasien,
  JadwalDokter,
  PendaftaranRawatJalan,
  User,
  Ruangan,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
} = require('../models');

class PendaftaranService {
  // ==========================================
  // 1. MASTER PASIEN
  // ==========================================

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

  async getAllPasien(query = {}) {
    const { search, jenis_kelamin, page = 1, limit = 20 } = query;
    const where = {};

    if (jenis_kelamin) {
      where.jenis_kelamin = jenis_kelamin;
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

  async getPasienById(id) {
    const pasien = await Pasien.findByPk(id, {
      include: [
        { model: Provinsi, as: 'provinsi' },
        { model: KabupatenKota, as: 'kabupaten' },
        { model: Kecamatan, as: 'kecamatan' },
        { model: DesaKelurahan, as: 'desa' },
        {
          model: PendaftaranRawatJalan,
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

  async createPasien(data, transaction = null) {
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

  // ==========================================
  // 2. JADWAL DOKTER
  // ==========================================

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
          attributes: ['id', 'username', 'nama_lengkap', 'nip_nik'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          attributes: ['id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
        },
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC'],
      ],
    });
  }

  async getJadwalDokterById(id) {
    const jadwal = await JadwalDokter.findByPk(id, {
      include: [
        { model: User, as: 'dokter', attributes: ['id', 'username', 'nama_lengkap', 'nip_nik'] },
        { model: Ruangan, as: 'ruangan', attributes: ['id', 'kode_ruangan', 'nama_ruangan'] },
      ],
    });

    if (!jadwal) {
      const error = new Error('Jadwal dokter tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return jadwal;
  }

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

  async updateJadwalDokter(id, data) {
    const jadwal = await this.getJadwalDokterById(id);
    return jadwal.update(data);
  }

  async deleteJadwalDokter(id) {
    const jadwal = await this.getJadwalDokterById(id);
    await jadwal.destroy();
    return { id, message: 'Jadwal dokter berhasil dihapus.' };
  }

  // ==========================================
  // 3. PENDAFTARAN RAWAT JALAN
  // ==========================================

  /**
   * Pendaftaran Pasien Rawat Jalan (Mendukung Pasien Baru dan Lama)
   */
  async daftarRawatJalan(data, createdByUserId = null) {
    const t = await sequelize.transaction();

    try {
      // 1. Validasi Jadwal Dokter Aktif
      const jadwal = await JadwalDokter.findByPk(data.jadwal_dokter_id, {
        include: [
          { model: User, as: 'dokter' },
          { model: Ruangan, as: 'ruangan' },
        ],
        transaction: t,
      });

      if (!jadwal || !jadwal.is_active) {
        const error = new Error('Jadwal dokter yang dipilih tidak aktif atau tidak ditemukan.');
        error.statusCode = 400;
        throw error;
      }

      // 2. Tanggal Kunjungan
      const tanggalKunjungan = data.tanggal_kunjungan || new Date().toISOString().split('T')[0];

      // 3. Pengecekan Kuota Pasien pada Jadwal Tersebut
      const totalTerdaftar = await PendaftaranRawatJalan.count({
        where: {
          jadwal_dokter_id: jadwal.id,
          tanggal_kunjungan: tanggalKunjungan,
          status_antrean: { [Op.ne]: 'BATAL' },
        },
        transaction: t,
      });

      if (totalTerdaftar >= jadwal.kuota_pasien) {
        const error = new Error(
          `Kuota pendaftaran dokter ${jadwal.dokter.nama_lengkap} di ${jadwal.ruangan.nama_ruangan} untuk tanggal ${tanggalKunjungan} telah habis (Maks: ${jadwal.kuota_pasien} pasien).`
        );
        error.statusCode = 422;
        throw error;
      }

      // 4. Proses Entitas Pasien (BARU atau LAMA)
      let pasienId = data.pasien_id;
      let pasienRecord = null;

      if (data.tipe_pasien === 'BARU') {
        if (!data.pasien_baru) {
          const error = new Error('Data identitas pasien baru wajib disertakan.');
          error.statusCode = 400;
          throw error;
        }
        pasienRecord = await this.createPasien(
          {
            ...data.pasien_baru,
            jenis_penjamin_default: data.jenis_penjamin,
            no_kartu_penjamin_default: data.no_kartu_penjamin,
          },
          t
        );
        pasienId = pasienRecord.id;
      } else {
        // Pasien Lama
        pasienRecord = await Pasien.findByPk(pasienId, { transaction: t });
        if (!pasienRecord) {
          const error = new Error(`Pasien dengan ID ${pasienId} tidak ditemukan.`);
          error.statusCode = 404;
          throw error;
        }
      }

      // 5. Cek apakah pasien sudah mendaftar di poli & tanggal yang sama
      const duplicateCheck = await PendaftaranRawatJalan.findOne({
        where: {
          pasien_id: pasienId,
          ruangan_id: jadwal.ruangan_id,
          tanggal_kunjungan: tanggalKunjungan,
          status_antrean: { [Op.ne]: 'BATAL' },
        },
        transaction: t,
      });

      if (duplicateCheck) {
        const error = new Error(
          `Pasien sudah terdaftar di ${jadwal.ruangan.nama_ruangan} pada tanggal ${tanggalKunjungan} dengan No. Registrasi: ${duplicateCheck.no_registrasi}.`
        );
        error.statusCode = 409;
        throw error;
      }

      // 6. Generate Nomor Antrean & Nomor Registrasi Hari Tersebut
      const countRuanganToday = await PendaftaranRawatJalan.count({
        where: {
          ruangan_id: jadwal.ruangan_id,
          tanggal_kunjungan: tanggalKunjungan,
        },
        transaction: t,
      });

      const angkaAntrean = countRuanganToday + 1;
      const noAntrean = `A-${String(angkaAntrean).padStart(3, '0')}`;

      // Format No Registrasi: RJ-YYYYMMDD-XXXX
      const dateCompact = tanggalKunjungan.replace(/-/g, '');
      const countAllToday = await PendaftaranRawatJalan.count({
        where: { tanggal_kunjungan: tanggalKunjungan },
        transaction: t,
      });
      const noRegistrasi = `RJ-${dateCompact}-${String(countAllToday + 1).padStart(4, '0')}`;

      // 7. Simpan Data Pendaftaran Rawat Jalan
      const pendaftaran = await PendaftaranRawatJalan.create(
        {
          no_registrasi: noRegistrasi,
          no_antrean: noAntrean,
          angka_antrean: angkaAntrean,
          pasien_id: pasienId,
          tipe_pasien: data.tipe_pasien,
          jadwal_dokter_id: jadwal.id,
          dokter_id: jadwal.dokter_id,
          ruangan_id: jadwal.ruangan_id,
          tanggal_kunjungan: tanggalKunjungan,
          jenis_penjamin: data.jenis_penjamin,
          no_kartu_penjamin: data.no_kartu_penjamin || null,
          keluhan_utama: data.keluhan_utama || null,
          catatan: data.catatan || null,
          status_antrean: 'MENUNGGU',
          created_by: createdByUserId,
        },
        { transaction: t }
      );

      await t.commit();

      // Return data pendaftaran lengkap
      return this.getPendaftaranById(pendaftaran.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllPendaftaran(query = {}) {
    const {
      tanggal_kunjungan,
      ruangan_id,
      dokter_id,
      status_antrean,
      jenis_penjamin,
      search,
      page = 1,
      limit = 30,
    } = query;

    const where = {};

    if (tanggal_kunjungan) {
      where.tanggal_kunjungan = tanggal_kunjungan;
    } else {
      where.tanggal_kunjungan = new Date().toISOString().split('T')[0]; // Default hari ini
    }

    if (ruangan_id) where.ruangan_id = parseInt(ruangan_id, 10);
    if (dokter_id) where.dokter_id = dokter_id;
    if (status_antrean) where.status_antrean = status_antrean;
    if (jenis_penjamin) where.jenis_penjamin = jenis_penjamin;

    const include = [
      {
        model: Pasien,
        as: 'pasien',
        attributes: ['id', 'no_rm', 'nama_lengkap', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'no_telepon'],
      },
      {
        model: User,
        as: 'dokter',
        attributes: ['id', 'nama_lengkap', 'nip_nik'],
      },
      {
        model: Ruangan,
        as: 'ruangan',
        attributes: ['id', 'kode_ruangan', 'nama_ruangan'],
      },
      {
        model: JadwalDokter,
        as: 'jadwal_dokter',
        attributes: ['id', 'hari', 'jam_mulai', 'jam_selesai'],
      },
    ];

    if (search) {
      where[Op.or] = [
        { no_registrasi: { [Op.iLike]: `%${search}%` } },
        { no_antrean: { [Op.iLike]: `%${search}%` } },
        { '$pasien.nama_lengkap$': { [Op.iLike]: `%${search}%` } },
        { '$pasien.no_rm$': { [Op.iLike]: `%${search}%` } },
        { '$pasien.nik$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    return PendaftaranRawatJalan.findAndCountAll({
      where,
      include,
      order: [
        ['tanggal_kunjungan', 'ASC'],
        ['angka_antrean', 'ASC'],
      ],
      limit: take,
      offset: skip,
    });
  }

  async getPendaftaranById(id) {
    const pendaftaran = await PendaftaranRawatJalan.findByPk(id, {
      include: [
        {
          model: Pasien,
          as: 'pasien',
          include: [
            { model: Provinsi, as: 'provinsi' },
            { model: KabupatenKota, as: 'kabupaten' },
            { model: Kecamatan, as: 'kecamatan' },
            { model: DesaKelurahan, as: 'desa' },
          ],
        },
        { model: User, as: 'dokter', attributes: ['id', 'nama_lengkap', 'nip_nik'] },
        { model: Ruangan, as: 'ruangan', attributes: ['id', 'kode_ruangan', 'nama_ruangan'] },
        { model: JadwalDokter, as: 'jadwal_dokter' },
        { model: User, as: 'petugas_admisi', attributes: ['id', 'nama_lengkap', 'username'] },
      ],
    });

    if (!pendaftaran) {
      const error = new Error('Data pendaftaran rawat jalan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return pendaftaran;
  }

  async updateStatusPendaftaran(id, status_antrean, catatan = null) {
    const pendaftaran = await this.getPendaftaranById(id);
    const updatePayload = { status_antrean };
    if (catatan) {
      updatePayload.catatan = catatan;
    }
    return pendaftaran.update(updatePayload);
  }
}

module.exports = new PendaftaranService();
