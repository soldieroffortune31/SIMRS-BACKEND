const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Username tidak boleh kosong.',
    'any.required': 'Username wajib diisi.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Kata sandi tidak boleh kosong.',
    'any.required': 'Kata sandi wajib diisi.',
  }),
  // Parameter konteks opsional (untuk direct 1-step login)
  instalasi_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID Instalasi harus berupa angka.',
  }),
  ruangan_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID Ruangan harus berupa angka.',
  }),
});

const selectContextSchema = Joi.object({
  instalasi_id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID Instalasi harus berupa angka.',
    'any.required': 'ID Instalasi wajib dipilih.',
  }),
  ruangan_id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID Ruangan harus berupa angka.',
    'any.required': 'ID Ruangan wajib dipilih.',
  }),
});

const switchContextSchema = selectContextSchema;

module.exports = {
  loginSchema,
  selectContextSchema,
  switchContextSchema,
};
