const Joi = require('joi');

const createInstalasiSchema = Joi.object({
  kode_instalasi: Joi.string().trim().uppercase().required(),
  nama_instalasi: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const createRuanganSchema = Joi.object({
  instalasi_id: Joi.number().integer().positive().required(),
  kode_ruangan: Joi.string().trim().uppercase().required(),
  nama_ruangan: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  nama_lengkap: Joi.string().trim().required(),
  nip_nik: Joi.string().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  assignments: Joi.array().items(
    Joi.object({
      ruangan_id: Joi.number().integer().positive().required(),
      role_id: Joi.number().integer().positive().required(),
      is_default: Joi.boolean().default(false),
    })
  ).optional(),
});

const assignRuanganSchema = Joi.object({
  ruangan_id: Joi.number().integer().positive().required(),
  role_id: Joi.number().integer().positive().required(),
  is_default: Joi.boolean().default(false),
});

module.exports = {
  createInstalasiSchema,
  createRuanganSchema,
  createUserSchema,
  assignRuanganSchema,
};
