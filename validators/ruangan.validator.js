const Joi = require('joi');

const createRuanganSchema = Joi.object({
  instalasi_id: Joi.number().integer().positive().required(),
  kode_ruangan: Joi.string().trim().uppercase().required(),
  nama_ruangan: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const updateRuanganSchema = Joi.object({
  instalasi_id: Joi.number().integer().positive().optional(),
  kode_ruangan: Joi.string().trim().uppercase().optional(),
  nama_ruangan: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = {
  createRuanganSchema,
  updateRuanganSchema,
};
