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
const pasienService = require('./pasien.service');

class PendaftaranService {
  // ==========================================
  // REGISTRASI / PENDAFTARAN RAWAT JALAN
  // ==========================================

  /**
   * Pendaftaran Pasien Rawat Jalan (Poliklinik)
   * Mendukung alur:
   * 1. Pasien Baru (input form pasien baru, auto-create Master Pasien & generate No RM)
   * 2. Pasien Lama (menggunakan pasien_id yang sudah ada)
   * 3. Validasi kuota dokter & duplikasi kunjungan di hari yang sama
   * 4. Pembuatan No. Antrean & No. Registrasi unik
   */
  async daftarRawatJalan(data, createdByUserId = null) {
    const t = await sequelize.transaction();

    try {
      // 1. Validasi Keberadaan & Keaktifan Jadwal Dokter
      const jadwal = await JadwalDokter.findByPk(data.jadwal_dokter_id, {
        include: [
          { model: Ruangan, as: 'ruangan' },
          { model: User, as: 'dokter' },
        ],
        transaction: t,
      });

      if (!jadwal || !jadwal.is_active) {
        const error = new Error('Jadwal dokter tidak aktif atau tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      // 2. Format & Validasi Tanggal Kunjungan
      const rawTgl = data.tanggal_kunjungan || new Date();
      const tanggalKunjungan = rawTgl instanceof Date ? rawTgl.toISOString().split('T')[0] : String(rawTgl).split('T')[0];

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
        pasienRecord = await pasienService.createPasien(
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
