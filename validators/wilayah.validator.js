const Joi = require('joi');

// PROVINSI
const createProvinsiSchema = Joi.object({
  kode_provinsi: Joi.string().trim().required(),
  nama_provinsi: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const updateProvinsiSchema = Joi.object({
  kode_provinsi: Joi.string().trim().optional(),
  nama_provinsi: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

// KABUPATEN / KOTA
const createKabupatenSchema = Joi.object({
  provinsi_id: Joi.number().integer().positive().required(),
  kode_kabupaten: Joi.string().trim().required(),
  nama_kabupaten: Joi.string().trim().required(),
  tipe: Joi.string().valid('KABUPATEN', 'KOTA').default('KABUPATEN'),
  is_active: Joi.boolean().default(true),
});

const updateKabupatenSchema = Joi.object({
  provinsi_id: Joi.number().integer().positive().optional(),
  kode_kabupaten: Joi.string().trim().optional(),
  nama_kabupaten: Joi.string().trim().optional(),
  tipe: Joi.string().valid('KABUPATEN', 'KOTA').optional(),
  is_active: Joi.boolean().optional(),
});

// KECAMATAN
const createKecamatanSchema = Joi.object({
  kabupaten_id: Joi.number().integer().positive().required(),
  kode_kecamatan: Joi.string().trim().required(),
  nama_kecamatan: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const updateKecamatanSchema = Joi.object({
  kabupaten_id: Joi.number().integer().positive().optional(),
  kode_kecamatan: Joi.string().trim().optional(),
  nama_kecamatan: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

// DESA / KELURAHAN
const createDesaSchema = Joi.object({
  kecamatan_id: Joi.number().integer().positive().required(),
  kode_desa: Joi.string().trim().required(),
  nama_desa: Joi.string().trim().required(),
  tipe: Joi.string().valid('DESA', 'KELURAHAN').default('DESA'),
  kode_pos: Joi.string().trim().max(10).allow('', null).optional(),
  is_active: Joi.boolean().default(true),
});

const updateDesaSchema = Joi.object({
  kecamatan_id: Joi.number().integer().positive().optional(),
  kode_desa: Joi.string().trim().optional(),
  nama_desa: Joi.string().trim().optional(),
  tipe: Joi.string().valid('DESA', 'KELURAHAN').optional(),
  kode_pos: Joi.string().trim().max(10).allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

// KODE POS
const createKodePosSchema = Joi.object({
  kode_pos: Joi.string().trim().required(),
  provinsi_id: Joi.number().integer().positive().allow(null).optional(),
  kabupaten_id: Joi.number().integer().positive().allow(null).optional(),
  kecamatan_id: Joi.number().integer().positive().allow(null).optional(),
  desa_id: Joi.number().integer().positive().allow(null).optional(),
  keterangan: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().default(true),
});

const updateKodePosSchema = Joi.object({
  kode_pos: Joi.string().trim().optional(),
  provinsi_id: Joi.number().integer().positive().allow(null).optional(),
  kabupaten_id: Joi.number().integer().positive().allow(null).optional(),
  kecamatan_id: Joi.number().integer().positive().allow(null).optional(),
  desa_id: Joi.number().integer().positive().allow(null).optional(),
  keterangan: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = {
  createProvinsiSchema,
  updateProvinsiSchema,
  createKabupatenSchema,
  updateKabupatenSchema,
  createKecamatanSchema,
  updateKecamatanSchema,
  createDesaSchema,
  updateDesaSchema,
  createKodePosSchema,
  updateKodePosSchema,
};
