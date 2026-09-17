const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak ditemukan. Harap sertakan Authorization Bearer Token.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Format token tidak valid. Gunakan format: Bearer <token>',
    });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi token telah kedaluwarsa. Silakan login kembali.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak valid atau telah dimanipulasi.',
    });
  }
}

module.exports = authMiddleware;
