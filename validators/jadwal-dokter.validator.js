const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Validasi Tambah Jadwal Dokter
const createJadwalDokterSchema = Joi.object({
  dokter_id: Joi.number().integer().positive().required(),
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

// Validasi Update Jadwal Dokter
const updateJadwalDokterSchema = Joi.object({
  dokter_id: Joi.number().integer().positive().optional(),
  ruangan_id: Joi.number().integer().positive().optional(),
  hari: Joi.string().valid('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU').optional(),
  jam_mulai: Joi.string().pattern(timeRegex).optional(),
  jam_selesai: Joi.string().pattern(timeRegex).optional(),
  kuota_pasien: Joi.number().integer().positive().optional(),
  keterangan: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = {
  createJadwalDokterSchema,
  updateJadwalDokterSchema,
};
