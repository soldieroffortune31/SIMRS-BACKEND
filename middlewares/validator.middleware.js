/**
 * Middleware wrapper untuk validasi skema Joi
 * @param {Object} schema - Joi schema
 * @param {'body'|'query'|'params'} property - Bagian request yang divalidasi (default: 'body')
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validasi input gagal.',
        errors: details,
      });
    }

    req[property] = value;
    next();
  };
}

module.exports = validate;
