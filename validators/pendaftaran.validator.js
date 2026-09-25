const Joi = require('joi');

// Validasi Pendaftaran Rawat Jalan
const pendaftaranRawatJalanSchema = Joi.object({
  tipe_pasien: Joi.string().valid('BARU', 'LAMA').required(),
  // Untuk Pasien LAMA
  pasien_id: Joi.number().integer().positive().when('tipe_pasien', {
    is: 'LAMA',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  // Untuk Pasien BARU
  pasien_baru: Joi.object({
    nik: Joi.string().length(16).pattern(/^[0-9]+$/).allow('', null).optional(),
    nama_lengkap: Joi.string().trim().min(2).max(150).required(),
    jenis_kelamin: Joi.string().valid('L', 'P').required(),
    tempat_lahir: Joi.string().trim().required(),
    tanggal_lahir: Joi.date().iso().required(),
    golongan_darah: Joi.string().valid('A', 'B', 'AB', 'O', 'TIDAK_TAHU').default('TIDAK_TAHU'),
    agama: Joi.string().trim().allow('', null).optional(),
    status_pernikahan: Joi.string().valid('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI').allow(null).optional(),
    pendidikan: Joi.string().trim().allow('', null).optional(),
    pekerjaan: Joi.string().trim().allow('', null).optional(),
    no_telepon: Joi.string().trim().allow('', null).optional(),
    email: Joi.string().email().allow('', null).optional(),
    alamat_lengkap: Joi.string().trim().required(),
    rt: Joi.string().trim().allow('', null).optional(),
    rw: Joi.string().trim().allow('', null).optional(),
    provinsi_id: Joi.number().integer().positive().allow(null).optional(),
    kabupaten_id: Joi.number().integer().positive().allow(null).optional(),
    kecamatan_id: Joi.number().integer().positive().allow(null).optional(),
    desa_id: Joi.number().integer().positive().allow(null).optional(),
    kode_pos: Joi.string().trim().allow('', null).optional(),
    nama_penanggung_jawab: Joi.string().trim().allow('', null).optional(),
    hubungan_penanggung_jawab: Joi.string().trim().allow('', null).optional(),
    telepon_penanggung_jawab: Joi.string().trim().allow('', null).optional(),
  }).when('tipe_pasien', {
    is: 'BARU',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  // Kebutuhan Kunjungan Poliklinik & Jadwal Dokter
  jadwal_dokter_id: Joi.number().integer().positive().required(),
  tanggal_kunjungan: Joi.date().iso().default(() => new Date().toISOString().split('T')[0]),
  jenis_penjamin: Joi.string().valid('UMUM', 'BPJS', 'ASURANSI_SWASTA', 'PERUSAHAAN').required(),
  no_kartu_penjamin: Joi.string().trim().allow('', null).optional(),
  keluhan_utama: Joi.string().trim().allow('', null).optional(),
  catatan: Joi.string().trim().allow('', null).optional(),
});

const updateStatusPendaftaranSchema = Joi.object({
  status_antrean: Joi.string().valid('MENUNGGU', 'DIPANGGIL', 'SEDANG_DILAYANI', 'SELESAI', 'BATAL').required(),
  catatan: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  pendaftaranRawatJalanSchema,
  updateStatusPendaftaranSchema,
};
