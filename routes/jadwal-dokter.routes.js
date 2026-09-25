const express = require('express');
const router = express.Router();
const jadwalDokterController = require('../controllers/jadwal-dokter.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createJadwalDokterSchema,
  updateJadwalDokterSchema,
} = require('../validators/jadwal-dokter.validator');

// Master Jadwal Dokter Endpoints
router.get('/', authMiddleware, jadwalDokterController.getAllJadwalDokter);
router.get('/:id', authMiddleware, jadwalDokterController.getJadwalDokterById);

router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createJadwalDokterSchema),
  jadwalDokterController.createJadwalDokter
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateJadwalDokterSchema),
  jadwalDokterController.updateJadwalDokter
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  jadwalDokterController.deleteJadwalDokter
);

module.exports = router;
