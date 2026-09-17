const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const masterRoutes = require('./master.routes');
const menuRoutes = require('./menu.routes');
const modulRoutes = require('./modul.routes');
const pelayananRoutes = require('./pelayanan.routes');

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
router.use('/menus', menuRoutes);
router.use('/modul', modulRoutes);
router.use('/pelayanan', pelayananRoutes);

module.exports = router;
