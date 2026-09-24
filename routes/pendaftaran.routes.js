const express = require('express');
const router = express.Router();
const pendaftaranController = require('../controllers/pendaftaran.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createPasienSchema,
  updatePasienSchema,
  createJadwalDokterSchema,
  updateJadwalDokterSchema,
  pendaftaranRawatJalanSchema,
  updateStatusPendaftaranSchema,
} = require('../validators/pendaftaran.validator');

// ==========================================
// 1. MASTER PASIEN (/pasien)
// ==========================================
router.get('/pasien', authMiddleware, pendaftaranController.getAllPasien);
router.get('/pasien/:id', authMiddleware, pendaftaranController.getPasienById);
router.post(
  '/pasien',
  authMiddleware,
  validate(createPasienSchema),
  pendaftaranController.createPasien
);
router.put(
  '/pasien/:id',
  authMiddleware,
  validate(updatePasienSchema),
  pendaftaranController.updatePasien
);

// ==========================================
// 2. JADWAL DOKTER (/jadwal-dokter)
// ==========================================
router.get('/jadwal-dokter', authMiddleware, pendaftaranController.getAllJadwalDokter);
router.get('/jadwal-dokter/:id', authMiddleware, pendaftaranController.getJadwalDokterById);
router.post(
  '/jadwal-dokter',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createJadwalDokterSchema),
  pendaftaranController.createJadwalDokter
);
router.put(
  '/jadwal-dokter/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateJadwalDokterSchema),
  pendaftaranController.updateJadwalDokter
);
router.delete(
  '/jadwal-dokter/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  pendaftaranController.deleteJadwalDokter
);

// ==========================================
// 3. REGISTRASI / PENDAFTARAN RAWAT JALAN (/pendaftaran/rawat-jalan)
// ==========================================
router.post(
  '/pendaftaran/rawat-jalan',
  authMiddleware,
  validate(pendaftaranRawatJalanSchema),
  pendaftaranController.daftarRawatJalan
);
router.get(
  '/pendaftaran/rawat-jalan',
  authMiddleware,
  pendaftaranController.getAllPendaftaran
);
router.get(
  '/pendaftaran/rawat-jalan/:id',
  authMiddleware,
  pendaftaranController.getPendaftaranById
);
router.patch(
  '/pendaftaran/rawat-jalan/:id/status',
  authMiddleware,
  validate(updateStatusPendaftaranSchema),
  pendaftaranController.updateStatusPendaftaran
);

module.exports = router;
