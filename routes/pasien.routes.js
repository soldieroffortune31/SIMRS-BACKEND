const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasien.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  createPasienSchema,
  updatePasienSchema,
} = require('../validators/pasien.validator');

// Master Pasien Endpoints
router.get('/', authMiddleware, pasienController.getAllPasien);
router.get('/no-rm/:no_rm', authMiddleware, pasienController.getPasienByNoRM);
router.get('/nik/:nik', authMiddleware, pasienController.getPasienByNIK);
router.get('/:id', authMiddleware, pasienController.getPasienById);

router.post(
  '/',
  authMiddleware,
  validate(createPasienSchema),
  pasienController.createPasien
);

router.put(
  '/:id',
  authMiddleware,
  validate(updatePasienSchema),
  pasienController.updatePasien
);

router.delete('/:id', authMiddleware, pasienController.deletePasien);

module.exports = router;
