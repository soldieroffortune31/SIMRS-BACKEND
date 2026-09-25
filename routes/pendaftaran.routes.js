const express = require('express');
const router = express.Router();
const pendaftaranController = require('../controllers/pendaftaran.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  pendaftaranRawatJalanSchema,
  updateStatusPendaftaranSchema,
} = require('../validators/pendaftaran.validator');

// ==========================================
// REGISTRASI / PENDAFTARAN RAWAT JALAN
// ==========================================
router.post(
  ['/rawat-jalan', '/pendaftaran/rawat-jalan'],
  authMiddleware,
  validate(pendaftaranRawatJalanSchema),
  pendaftaranController.daftarRawatJalan
);
router.get(
  ['/rawat-jalan', '/pendaftaran/rawat-jalan'],
  authMiddleware,
  pendaftaranController.getAllPendaftaran
);
router.get(
  ['/rawat-jalan/:id', '/pendaftaran/rawat-jalan/:id'],
  authMiddleware,
  pendaftaranController.getPendaftaranById
);
router.patch(
  ['/rawat-jalan/:id/status', '/pendaftaran/rawat-jalan/:id/status'],
  authMiddleware,
  validate(updateStatusPendaftaranSchema),
  pendaftaranController.updateStatusPendaftaran
);

// ==========================================
// ENDPOINT PENDAFTARAN UMUM (SEMUA LAYANAN)
// ==========================================
router.get(
  '/',
  authMiddleware,
  pendaftaranController.getAllPendaftaran
);
router.get(
  '/:id',
  authMiddleware,
  pendaftaranController.getPendaftaranById
);
router.patch(
  '/:id/status',
  authMiddleware,
  validate(updateStatusPendaftaranSchema),
  pendaftaranController.updateStatusPendaftaran
);

module.exports = router;
