const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayah.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createProvinsiSchema,
  updateProvinsiSchema,
  createKabupatenSchema,
  updateKabupatenSchema,
  createKecamatanSchema,
  updateKecamatanSchema,
  createDesaSchema,
  updateDesaSchema,
  createKodePosSchema,
  updateKodePosSchema,
} = require('../validators/wilayah.validator');

// ==========================================
// 1. PROVINSI (/provinsi)
// ==========================================
router.get('/provinsi', authMiddleware, wilayahController.getAllProvinsi);
router.get('/provinsi/:id', authMiddleware, wilayahController.getProvinsiById);
router.post(
  '/provinsi',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createProvinsiSchema),
  wilayahController.createProvinsi
);
router.put(
  '/provinsi/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateProvinsiSchema),
  wilayahController.updateProvinsi
);
router.delete(
  '/provinsi/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  wilayahController.deleteProvinsi
);

// ==========================================
// 2. KABUPATEN / KOTA (/kabupaten)
// ==========================================
router.get('/kabupaten', authMiddleware, wilayahController.getAllKabupaten);
router.get('/kabupaten/:id', authMiddleware, wilayahController.getKabupatenById);
router.post(
  '/kabupaten',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createKabupatenSchema),
  wilayahController.createKabupaten
);
router.put(
  '/kabupaten/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateKabupatenSchema),
  wilayahController.updateKabupaten
);
router.delete(
  '/kabupaten/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  wilayahController.deleteKabupaten
);

// ==========================================
// 3. KECAMATAN (/kecamatan)
// ==========================================
router.get('/kecamatan', authMiddleware, wilayahController.getAllKecamatan);
router.get('/kecamatan/:id', authMiddleware, wilayahController.getKecamatanById);
router.post(
  '/kecamatan',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createKecamatanSchema),
  wilayahController.createKecamatan
);
router.put(
  '/kecamatan/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateKecamatanSchema),
  wilayahController.updateKecamatan
);
router.delete(
  '/kecamatan/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  wilayahController.deleteKecamatan
);

// ==========================================
// 4. DESA / KELURAHAN (/desa)
// ==========================================
router.get('/desa', authMiddleware, wilayahController.getAllDesa);
router.get('/desa/:id', authMiddleware, wilayahController.getDesaById);
router.post(
  '/desa',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createDesaSchema),
  wilayahController.createDesa
);
router.put(
  '/desa/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateDesaSchema),
  wilayahController.updateDesa
);
router.delete(
  '/desa/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  wilayahController.deleteDesa
);

// ==========================================
// 5. KODE POS (/kodepos)
// ==========================================
router.get('/kodepos', authMiddleware, wilayahController.getAllKodePos);
router.get('/kodepos/search/:kodePos', authMiddleware, wilayahController.getKodePosByCode);
router.get('/kodepos/:id', authMiddleware, wilayahController.getKodePosById);
router.post(
  '/kodepos',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createKodePosSchema),
  wilayahController.createKodePos
);
router.put(
  '/kodepos/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateKodePosSchema),
  wilayahController.updateKodePos
);
router.delete(
  '/kodepos/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  wilayahController.deleteKodePos
);

module.exports = router;
