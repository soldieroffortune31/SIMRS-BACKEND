const express = require('express');
const router = express.Router();
const ruanganController = require('../controllers/ruangan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createRuanganSchema,
  updateRuanganSchema,
} = require('../validators/ruangan.validator');

router.get('/', authMiddleware, ruanganController.getAllRuangan);
router.get('/:id', authMiddleware, ruanganController.getRuanganById);

router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createRuanganSchema),
  ruanganController.createRuangan
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateRuanganSchema),
  ruanganController.updateRuangan
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  ruanganController.deleteRuangan
);

module.exports = router;
