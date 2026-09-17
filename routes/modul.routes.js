const express = require('express');
const router = express.Router();
const modulController = require('../controllers/modul.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireContext } = require('../middlewares/context.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createModulSchema,
  assignModulInstalasiSchema,
  assignModulRuanganSchema,
  assignModulUserSchema,
} = require('../validators/master.validator');

// 1. Ambil seluruh modul SIMRS
router.get('/', authMiddleware, modulController.getAllModul);

// 2. Tambah Modul Baru (Khusus Admin)
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createModulSchema),
  modulController.createModul
);

// 3. Admin: Mengatur modul untuk Instalasi
router.post(
  '/assign-instalasi',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignModulInstalasiSchema),
  modulController.assignToInstalasi
);

// 4. Admin: Mengatur modul untuk Ruangan
router.post(
  '/assign-ruangan',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignModulRuanganSchema),
  modulController.assignToRuangan
);

// 5. Admin: Mengatur modul untuk Akun Pengguna spesifik di Ruangan tertentu
router.post(
  '/assign-user-ruangan',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignModulUserSchema),
  modulController.assignToUserRuangan
);

// 6. Ambil daftar modul yang dapat diakses oleh user pada ruangan aktif saat ini
router.get('/my-modules', authMiddleware, requireContext, modulController.getMyModules);

module.exports = router;
