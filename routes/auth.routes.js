const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireContext } = require('../middlewares/context.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  loginSchema,
  selectContextSchema,
  switchContextSchema,
} = require('../validators/auth.validator');

// 1. Endpoint Login (Bisa 2-step maupun direct 1-step login)
router.post('/login', validate(loginSchema), authController.login);

// 2. Endpoint Pemilihan Konteks (Instalasi & Ruangan)
router.post(
  '/select-context',
  authMiddleware,
  validate(selectContextSchema),
  authController.selectContext
);

// 3. Endpoint Pergantian Konteks (Switch Ruangan tanpa login ulang)
router.post(
  '/switch-context',
  authMiddleware,
  validate(switchContextSchema),
  authController.switchContext
);

// 4. Endpoint Profil & Status Sesi Aktif
router.get('/me', authMiddleware, authController.getMe);

// 5. Endpoint Refresh / Ambil Menu Sesuai Konteks Aktif
router.get('/menus', authMiddleware, requireContext, authController.getMenus);

module.exports = router;
