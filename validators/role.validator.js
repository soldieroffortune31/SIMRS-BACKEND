const Joi = require('joi');

const createRoleSchema = Joi.object({
  kode_role: Joi.string().trim().uppercase().required(),
  nama_role: Joi.string().trim().required(),
  keterangan: Joi.string().allow('', null).optional(),
});

const updateRoleSchema = Joi.object({
  kode_role: Joi.string().trim().uppercase().optional(),
  nama_role: Joi.string().trim().optional(),
  keterangan: Joi.string().allow('', null).optional(),
});

const assignRolePermissionsSchema = Joi.object({
  permission_ids: Joi.array().items(Joi.number().integer().positive()).required(),
});

const assignRoleMenusSchema = Joi.object({
  menu_ids: Joi.array().items(Joi.number().integer().positive()).required(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
  assignRoleMenusSchema,
};
