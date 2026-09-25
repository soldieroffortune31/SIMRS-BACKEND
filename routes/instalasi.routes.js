const express = require('express');
const router = express.Router();
const instalasiController = require('../controllers/instalasi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createInstalasiSchema,
  updateInstalasiSchema,
} = require('../validators/instalasi.validator');

router.get('/', authMiddleware, instalasiController.getAllInstalasi);
router.get('/:id', authMiddleware, instalasiController.getInstalasiById);

router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createInstalasiSchema),
  instalasiController.createInstalasi
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateInstalasiSchema),
  instalasiController.updateInstalasi
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  instalasiController.deleteInstalasi
);

module.exports = router;
