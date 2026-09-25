const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const masterRoutes = require('./master.routes');
const instalasiRoutes = require('./instalasi.routes');
const ruanganRoutes = require('./ruangan.routes');
const roleRoutes = require('./role.routes');
const menuRoutes = require('./menu.routes');
const modulRoutes = require('./modul.routes');
const pelayananRoutes = require('./pelayanan.routes');
const wilayahRoutes = require('./wilayah.routes');
const pasienRoutes = require('./pasien.routes');
const jadwalDokterRoutes = require('./jadwal-dokter.routes');
const pendaftaranRoutes = require('./pendaftaran.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'SIMRS Backend API',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes);
router.use('/instalasi', instalasiRoutes);
router.use('/ruangan', ruanganRoutes);
router.use('/roles', roleRoutes);
router.use('/role', roleRoutes);
router.use('/menus', menuRoutes);
router.use('/modul', modulRoutes);
router.use('/pelayanan', pelayananRoutes);
router.use('/wilayah', wilayahRoutes);
router.use('/pasien', pasienRoutes);
router.use('/jadwal-dokter', jadwalDokterRoutes);
router.use('/pendaftaran', pendaftaranRoutes);
router.use('/', pendaftaranRoutes);

module.exports = router;
