const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
  assignRoleMenusSchema,
} = require('../validators/role.validator');

router.get('/', authMiddleware, roleController.getAllRoles);
router.get('/:id', authMiddleware, roleController.getRoleById);

router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(createRoleSchema),
  roleController.createRole
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(updateRoleSchema),
  roleController.updateRole
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  roleController.deleteRole
);

router.post(
  '/:id/permissions',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignRolePermissionsSchema),
  roleController.assignPermissionsToRole
);

router.post(
  '/:id/menus',
  authMiddleware,
  requireRole(['ADMIN']),
  validate(assignRoleMenusSchema),
  roleController.assignMenusToRole
);

module.exports = router;
