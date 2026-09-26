const {
  sequelize,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
  KodePos,
} = require('../models');

async function seedWilayah(transaction = null, closeConnection = false) {
  const localTx = !transaction;
  const t = transaction || (await sequelize.transaction());

  try {
    console.log('--- Seeding Data Master Wilayah & Kode Pos ---');

    // 1. PROVINSI
    console.log('1. Menambahkan Master Provinsi...');
    const provinsiData = [
      { provinsi_id: 1, kode_provinsi: '31', nama_provinsi: 'DKI JAKARTA', is_active: true },
      { provinsi_id: 2, kode_provinsi: '32', nama_provinsi: 'JAWA BARAT', is_active: true },
      { provinsi_id: 3, kode_provinsi: '33', nama_provinsi: 'JAWA TENGAH', is_active: true },
      { provinsi_id: 4, kode_provinsi: '34', nama_provinsi: 'DI YOGYAKARTA', is_active: true },
      { provinsi_id: 5, kode_provinsi: '35', nama_provinsi: 'JAWA TIMUR', is_active: true },
      { provinsi_id: 6, kode_provinsi: '51', nama_provinsi: 'BALI', is_active: true },
    ];
    for (const p of provinsiData) {
      await Provinsi.upsert(p, { transaction: t });
    }

    // 2. KABUPATEN / KOTA
    console.log('2. Menambahkan Master Kabupaten / Kota...');
    const kabupatenData = [
      { kabupaten_id: 1, provinsi_id: 1, kode_kabupaten: '31.71', nama_kabupaten: 'KOTA JAKARTA PUSAT', tipe: 'KOTA', is_active: true },
      { kabupaten_id: 2, provinsi_id: 1, kode_kabupaten: '31.74', nama_kabupaten: 'KOTA JAKARTA SELATAN', tipe: 'KOTA', is_active: true },
      { kabupaten_id: 3, provinsi_id: 2, kode_kabupaten: '32.01', nama_kabupaten: 'KABUPATEN BOGOR', tipe: 'KABUPATEN', is_active: true },
      { kabupaten_id: 4, provinsi_id: 2, kode_kabupaten: '32.73', nama_kabupaten: 'KOTA BANDUNG', tipe: 'KOTA', is_active: true },
      { kabupaten_id: 5, provinsi_id: 4, kode_kabupaten: '34.04', nama_kabupaten: 'KABUPATEN SLEMAN', tipe: 'KABUPATEN', is_active: true },
      { kabupaten_id: 6, provinsi_id: 4, kode_kabupaten: '34.71', nama_kabupaten: 'KOTA YOGYAKARTA', tipe: 'KOTA', is_active: true },
      { kabupaten_id: 7, provinsi_id: 5, kode_kabupaten: '35.78', nama_kabupaten: 'KOTA SURABAYA', tipe: 'KOTA', is_active: true },
    ];
    for (const k of kabupatenData) {
      await KabupatenKota.upsert(k, { transaction: t });
    }

    // 3. KECAMATAN
    console.log('3. Menambahkan Master Kecamatan...');
    const kecamatanData = [
      { kecamatan_id: 1, kabupaten_id: 1, kode_kecamatan: '31.71.01', nama_kecamatan: 'GAMBIR', is_active: true },
      { kecamatan_id: 2, kabupaten_id: 2, kode_kecamatan: '31.74.01', nama_kecamatan: 'KEBAYORAN BARU', is_active: true },
      { kecamatan_id: 3, kabupaten_id: 3, kode_kecamatan: '32.01.01', nama_kecamatan: 'CIBINONG', is_active: true },
      { kecamatan_id: 4, kabupaten_id: 4, kode_kecamatan: '32.73.01', nama_kecamatan: 'COBLONG', is_active: true },
      { kecamatan_id: 5, kabupaten_id: 5, kode_kecamatan: '34.04.07', nama_kecamatan: 'DEPOK', is_active: true },
      { kecamatan_id: 6, kabupaten_id: 5, kode_kecamatan: '34.04.05', nama_kecamatan: 'MLATI', is_active: true },
      { kecamatan_id: 7, kabupaten_id: 6, kode_kecamatan: '34.71.04', nama_kecamatan: 'DANUREJAN', is_active: true },
      { kecamatan_id: 8, kabupaten_id: 7, kode_kecamatan: '35.78.01', nama_kecamatan: 'WONOKROMO', is_active: true },
    ];
    for (const kc of kecamatanData) {
      await Kecamatan.upsert(kc, { transaction: t });
    }

    // 4. DESA / KELURAHAN
    console.log('4. Menambahkan Master Desa / Kelurahan...');
    const desaData = [
      { desa_id: 1, kecamatan_id: 1, kode_desa: '31.71.01.1001', nama_desa: 'GAMBIR', tipe: 'KELURAHAN', kode_pos: '10110', is_active: true },
      { desa_id: 2, kecamatan_id: 2, kode_desa: '31.74.01.1002', nama_desa: 'SENAYAN', tipe: 'KELURAHAN', kode_pos: '12190', is_active: true },
      { desa_id: 3, kecamatan_id: 3, kode_desa: '32.01.01.2002', nama_desa: 'PABUARAN', tipe: 'KELURAHAN', kode_pos: '16916', is_active: true },
      { desa_id: 4, kecamatan_id: 4, kode_desa: '32.73.01.1001', nama_desa: 'DAGO', tipe: 'KELURAHAN', kode_pos: '40135', is_active: true },
      { desa_id: 5, kecamatan_id: 5, kode_desa: '34.04.07.2001', nama_desa: 'CATURTUNGGAL', tipe: 'DESA', kode_pos: '55281', is_active: true },
      { desa_id: 6, kecamatan_id: 5, kode_desa: '34.04.07.2002', nama_desa: 'CONDONGCATUR', tipe: 'DESA', kode_pos: '55283', is_active: true },
      { desa_id: 7, kecamatan_id: 6, kode_desa: '34.04.05.2001', nama_desa: 'SINDUADI', tipe: 'DESA', kode_pos: '55284', is_active: true },
      { desa_id: 8, kecamatan_id: 7, kode_desa: '34.71.04.1001', nama_desa: 'BAUSASRAN', tipe: 'KELURAHAN', kode_pos: '55211', is_active: true },
      { desa_id: 9, kecamatan_id: 8, kode_desa: '35.78.01.1001', nama_desa: 'DARMO', tipe: 'KELURAHAN', kode_pos: '60241', is_active: true },
    ];
    for (const d of desaData) {
      await DesaKelurahan.upsert(d, { transaction: t });
    }

    // 5. KODE POS
    console.log('5. Menambahkan Master Kode Pos...');
    const kodePosData = [
      { kodepos_id: 1, kode_pos: '10110', provinsi_id: 1, kabupaten_id: 1, kecamatan_id: 1, desa_id: 1, keterangan: 'Kel. Gambir, Kec. Gambir, Kota Jakarta Pusat' },
      { kodepos_id: 2, kode_pos: '12190', provinsi_id: 1, kabupaten_id: 2, kecamatan_id: 2, desa_id: 2, keterangan: 'Kel. Senayan, Kec. Kebayoran Baru, Kota Jakarta Selatan' },
      { kodepos_id: 3, kode_pos: '16916', provinsi_id: 2, kabupaten_id: 3, kecamatan_id: 3, desa_id: 3, keterangan: 'Kel. Pabuaran, Kec. Cibinong, Kab. Bogor' },
      { kodepos_id: 4, kode_pos: '40135', provinsi_id: 2, kabupaten_id: 4, kecamatan_id: 4, desa_id: 4, keterangan: 'Kel. Dago, Kec. Coblong, Kota Bandung' },
      { kodepos_id: 5, kode_pos: '55281', provinsi_id: 4, kabupaten_id: 5, kecamatan_id: 5, desa_id: 5, keterangan: 'Desa Caturtunggal, Kec. Depok, Kab. Sleman' },
      { kodepos_id: 6, kode_pos: '55283', provinsi_id: 4, kabupaten_id: 5, kecamatan_id: 5, desa_id: 6, keterangan: 'Desa Condongcatur, Kec. Depok, Kab. Sleman' },
      { kodepos_id: 7, kode_pos: '55284', provinsi_id: 4, kabupaten_id: 5, kecamatan_id: 6, desa_id: 7, keterangan: 'Desa Sinduadi, Kec. Mlati, Kab. Sleman' },
      { kodepos_id: 8, kode_pos: '55211', provinsi_id: 4, kabupaten_id: 6, kecamatan_id: 7, desa_id: 8, keterangan: 'Kel. Bausasran, Kec. Danurejan, Kota Yogyakarta' },
      { kodepos_id: 9, kode_pos: '60241', provinsi_id: 5, kabupaten_id: 7, kecamatan_id: 8, desa_id: 9, keterangan: 'Kel. Darmo, Kec. Wonokromo, Kota Surabaya' },
    ];
    for (const kp of kodePosData) {
      await KodePos.upsert(kp, { transaction: t });
    }

    if (localTx) {
      await t.commit();
      // Sinkronisasi sequences
      try {
        await sequelize.query("SELECT setval('provinsi_id_seq', COALESCE((SELECT MAX(provinsi_id) FROM provinsi), 1));");
        await sequelize.query("SELECT setval('kabupaten_kota_id_seq', COALESCE((SELECT MAX(kabupaten_id) FROM kabupaten_kota), 1));");
        await sequelize.query("SELECT setval('kecamatan_id_seq', COALESCE((SELECT MAX(kecamatan_id) FROM kecamatan), 1));");
        await sequelize.query("SELECT setval('desa_kelurahan_id_seq', COALESCE((SELECT MAX(desa_id) FROM desa_kelurahan), 1));");
        await sequelize.query("SELECT setval('kodepos_id_seq', COALESCE((SELECT MAX(kodepos_id) FROM kode_pos), 1));");
      } catch (_) {}
      console.log('✓ Seeding Master Wilayah & Kode Pos selesai!');
    }
  } catch (error) {
    if (localTx) {
      await t.rollback();
    }
    console.error('✗ Gagal seeding master wilayah:', error.message);
    if (closeConnection) process.exit(1);
    throw error;
  } finally {
    if (localTx && closeConnection) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  seedWilayah(null, true);
}

module.exports = seedWilayah;
