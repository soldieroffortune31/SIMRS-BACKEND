const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Validasi Master Pasien
const createPasienSchema = Joi.object({
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
  jenis_penjamin_default: Joi.string().valid('UMUM', 'BPJS', 'ASURANSI_SWASTA', 'PERUSAHAAN').default('UMUM'),
  no_kartu_penjamin_default: Joi.string().trim().allow('', null).optional(),
  is_active: Joi.boolean().default(true),
});

const updatePasienSchema = Joi.object({
  nik: Joi.string().length(16).pattern(/^[0-9]+$/).allow('', null).optional(),
  nama_lengkap: Joi.string().trim().min(2).max(150).optional(),
  jenis_kelamin: Joi.string().valid('L', 'P').optional(),
  tempat_lahir: Joi.string().trim().optional(),
  tanggal_lahir: Joi.date().iso().optional(),
  golongan_darah: Joi.string().valid('A', 'B', 'AB', 'O', 'TIDAK_TAHU').optional(),
  agama: Joi.string().trim().allow('', null).optional(),
  status_pernikahan: Joi.string().valid('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI').allow(null).optional(),
  pendidikan: Joi.string().trim().allow('', null).optional(),
  pekerjaan: Joi.string().trim().allow('', null).optional(),
  no_telepon: Joi.string().trim().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  alamat_lengkap: Joi.string().trim().optional(),
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
  jenis_penjamin_default: Joi.string().valid('UMUM', 'BPJS', 'ASURANSI_SWASTA', 'PERUSAHAAN').optional(),
  no_kartu_penjamin_default: Joi.string().trim().allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

// Validasi Jadwal Dokter
const createJadwalDokterSchema = Joi.object({
  dokter_id: Joi.string().uuid().required(),
  ruangan_id: Joi.number().integer().positive().required(),
  hari: Joi.string().valid('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU').required(),
  jam_mulai: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'Format jam_mulai harus HH:mm (contoh: 08:00)',
  }),
  jam_selesai: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'Format jam_selesai harus HH:mm (contoh: 12:00)',
  }),
  kuota_pasien: Joi.number().integer().positive().default(30),
  keterangan: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().default(true),
});

const updateJadwalDokterSchema = Joi.object({
  dokter_id: Joi.string().uuid().optional(),
  ruangan_id: Joi.number().integer().positive().optional(),
  hari: Joi.string().valid('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU').optional(),
  jam_mulai: Joi.string().pattern(timeRegex).optional(),
  jam_selesai: Joi.string().pattern(timeRegex).optional(),
  kuota_pasien: Joi.number().integer().positive().optional(),
  keterangan: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

// Validasi Pendaftaran Rawat Jalan
const pendaftaranRawatJalanSchema = Joi.object({
  tipe_pasien: Joi.string().valid('BARU', 'LAMA').required(),
  // Untuk Pasien LAMA
  pasien_id: Joi.string().uuid().when('tipe_pasien', {
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
  createPasienSchema,
  updatePasienSchema,
  createJadwalDokterSchema,
  updateJadwalDokterSchema,
  pendaftaranRawatJalanSchema,
  updateStatusPendaftaranSchema,
};
