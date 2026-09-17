const { RolePermission, Permission } = require('../models');

/**
 * Middleware untuk membatasi endpoint berdasarkan Role
 * @param {Array<string>} roles - Daftar kode_role yang diizinkan (misal ['ADMIN', 'DOKTER'])
 */
function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.roleCode) {
      return res.status(403).json({
        success: false,
        message: 'Hak akses tidak mencukupi (Role tidak terdefinisi pada sesi ini).',
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.roleCode) && req.user.roleCode !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Endpoint ini membutuhkan peran [${roles.join(', ')}]. Peran Anda saat ini: ${req.user.roleCode}`,
      });
    }

    next();
  };
}

/**
 * Middleware untuk membatasi endpoint berdasarkan kode permission
 * @param {string} permissionCode - Kode permission yang dibutuhkan (misal 'emr:create')
 */
function requirePermission(permissionCode) {
  return async (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Role tidak terdefinisi.',
      });
    }

    // Role ADMIN memiliki bypass seluruh permission
    if (req.user.roleCode === 'ADMIN') {
      return next();
    }

    try {
      const hasPerm = await RolePermission.findOne({
        where: { role_id: req.user.roleId },
        include: [
          {
            model: Permission,
            as: 'permission',
            where: { kode_permission: permissionCode },
          },
        ],
      });

      if (!hasPerm) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Anda tidak memiliki izin [${permissionCode}].`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  requireRole,
  requirePermission,
};
