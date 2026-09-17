const express = require('express');
const router = express.Router();
const pelayananController = require('../controllers/pelayanan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireContext, requireInstalasi } = require('../middlewares/context.middleware');
const { requireRole, requirePermission } = require('../middlewares/permission.middleware');

// 1. Pelayanan Rawat Jalan (Khusus Instalasi Rawat Jalan IRJ & Role Dokter/Perawat)
router.get(
  '/rawat-jalan/antrean',
  authMiddleware,
  requireContext,
  requireInstalasi(['IRJ']),
  requireRole(['DOKTER', 'PERAWAT', 'ADMIN']),
  pelayananController.getAntreanPoli
);

// 2. Pelayanan Rawat Inap (Khusus Instalasi Rawat Inap IRNA)
router.get(
  '/rawat-inap/sensus',
  authMiddleware,
  requireContext,
  requireInstalasi(['IRNA']),
  requireRole(['DOKTER', 'PERAWAT', 'ADMIN']),
  pelayananController.getSensusRawatInap
);

// 3. Pelayanan Farmasi (Khusus Instalasi Farmasi)
router.get(
  '/farmasi/resep',
  authMiddleware,
  requireContext,
  requireInstalasi(['FARMASI']),
  requireRole(['APOTEKER', 'ADMIN']),
  pelayananController.getAntreanResep
);

// 4. Pelayanan Kasir & Keuangan (Khusus Instalasi Kasir)
router.get(
  '/kasir/tagihan',
  authMiddleware,
  requireContext,
  requireInstalasi(['KASIR']),
  requireRole(['KASIR', 'ADMIN']),
  pelayananController.getTagihanKasir
);

module.exports = router;
