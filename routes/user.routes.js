const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const { createUserSchema, assignRuanganSchema } = require('../validators/master.validator');

// Manajemen User (Khusus Administrator)
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createUserSchema),
  userController.createUser
);

router.get('/', authMiddleware, requireRole(['ADMIN']), userController.getAllUsers);

router.get('/:id', authMiddleware, userController.getUserById);

router.post(
  '/:id/assign-ruangan',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignRuanganSchema),
  userController.assignRuangan
);

module.exports = router;
