const Joi = require('joi');
const { createInstalasiSchema, updateInstalasiSchema } = require('./instalasi.validator');
const { createRuanganSchema, updateRuanganSchema } = require('./ruangan.validator');
const {
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
  assignRoleMenusSchema,
} = require('./role.validator');

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

const createModulSchema = Joi.object({
  kode_modul: Joi.string().trim().uppercase().required(),
  nama_modul: Joi.string().trim().required(),
  deskripsi: Joi.string().allow('', null).optional(),
  icon: Joi.string().allow('', null).optional(),
  order_index: Joi.number().integer().default(0),
  is_active: Joi.boolean().default(true),
});

const assignModulInstalasiSchema = Joi.object({
  instalasi_id: Joi.number().integer().positive().required(),
  modul_ids: Joi.array().items(Joi.number().integer().positive()).required(),
});

const assignModulRuanganSchema = Joi.object({
  ruangan_id: Joi.number().integer().positive().required(),
  modul_ids: Joi.array().items(Joi.number().integer().positive()).required(),
});

const assignModulUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  ruangan_id: Joi.number().integer().positive().required(),
  modul_ids: Joi.array().items(Joi.number().integer().positive()).required(),
});

module.exports = {
  createInstalasiSchema,
  updateInstalasiSchema,
  createRuanganSchema,
  updateRuanganSchema,
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
  assignRoleMenusSchema,
  createUserSchema,
  assignRuanganSchema,
  createModulSchema,
  assignModulInstalasiSchema,
  assignModulRuanganSchema,
  assignModulUserSchema,
};
