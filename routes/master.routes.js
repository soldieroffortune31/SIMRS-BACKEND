const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createInstalasiSchema,
  createRuanganSchema,
} = require('../validators/master.validator');
const wilayahRoutes = require('./wilayah.routes');

// Instalasi
router.get('/instalasi', authMiddleware, masterController.getAllInstalasi);
router.post(
  '/instalasi',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createInstalasiSchema),
  masterController.createInstalasi
);

// Ruangan
router.get('/ruangan', authMiddleware, masterController.getAllRuangan);
router.post(
  '/ruangan',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createRuanganSchema),
  masterController.createRuangan
);

// Roles
router.get('/roles', authMiddleware, masterController.getAllRoles);
router.post('/roles', authMiddleware, requireRole(['ADMIN']), masterController.createRole);

// Master Data Wilayah (Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan, Kode Pos)
router.use(wilayahRoutes);

module.exports = router;
