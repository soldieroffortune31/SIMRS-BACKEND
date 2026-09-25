const express = require('express');
const router = express.Router();

const instalasiRoutes = require('./instalasi.routes');
const ruanganRoutes = require('./ruangan.routes');
const roleRoutes = require('./role.routes');
const wilayahRoutes = require('./wilayah.routes');

// Master Sub-Modules
router.use('/instalasi', instalasiRoutes);
router.use('/ruangan', ruanganRoutes);
router.use('/roles', roleRoutes);
router.use('/role', roleRoutes);

// Master Data Wilayah (Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan, Kode Pos)
router.use(wilayahRoutes);

module.exports = router;
