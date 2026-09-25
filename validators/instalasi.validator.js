const Joi = require('joi');

const createInstalasiSchema = Joi.object({
  kode_instalasi: Joi.string().trim().uppercase().required(),
  nama_instalasi: Joi.string().trim().required(),
  is_active: Joi.boolean().default(true),
});

const updateInstalasiSchema = Joi.object({
  kode_instalasi: Joi.string().trim().uppercase().optional(),
  nama_instalasi: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = {
  createInstalasiSchema,
  updateInstalasiSchema,
};
