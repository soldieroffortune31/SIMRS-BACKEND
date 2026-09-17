const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/permission.middleware');

router.get('/', authMiddleware, menuController.getAllMenus);
router.post('/assign-role', authMiddleware, requireRole(['ADMIN']), menuController.assignMenusToRole);

module.exports = router;
