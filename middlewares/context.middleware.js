/**
 * Middleware untuk memastikan request memiliki konteks Instalasi & Ruangan yang aktif
 */
function requireContext(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Otentikasi diperlukan.',
    });
  }

  // Token berkonteks penuh memuat instalasiId dan ruanganId
  if (!req.user.instalasiId || !req.user.ruanganId) {
    return res.status(403).json({
      success: false,
      message: 'Konteks Instalasi dan Ruangan belum dipilih. Silakan pilih ruangan kerja terlebih dahulu melalui endpoint /api/auth/select-context.',
    });
  }

  next();
}

/**
 * Middleware untuk membatasi akses fitur hanya pada kode instalasi tertentu
 * Contoh: requireInstalasi(['IRJ', 'IGD'])
 */
function requireInstalasi(allowedInstalasiCodes = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.instalasiCode) {
      return res.status(403).json({
        success: false,
        message: 'Konteks Instalasi tidak ditemukan.',
      });
    }

    if (
      allowedInstalasiCodes.length > 0 &&
      !allowedInstalasiCodes.includes(req.user.instalasiCode) &&
      req.user.roleCode !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: `Fitur ini hanya dapat diakses melalui Instalasi: ${allowedInstalasiCodes.join(', ')}. Konteks Anda saat ini: ${req.user.instalasiCode}`,
      });
    }

    next();
  };
}

module.exports = {
  requireContext,
  requireInstalasi,
};
