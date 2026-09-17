const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Role,
  Instalasi,
  Ruangan,
  UserRuanganRole,
  Menu,
  MenuInstalasi,
  Permission,
  RoleMenu,
  RolePermission,
} = require('../models');

async function runSeeder() {
  console.log('--- Memulai Seeding Data Master SIMRS ---');
  const t = await sequelize.transaction();

  try {
    // 1. SEED ROLES
    console.log('1. Menambahkan data Roles...');
    const rolesData = [
      { id: 1, kode_role: 'ADMIN', nama_role: 'Administrator SIMRS', keterangan: 'Akses penuh administrasi master data dan sistem' },
      { id: 2, kode_role: 'DOKTER', nama_role: 'Dokter Pemeriksa', keterangan: 'Pemeriksaan klinis EMR, order resep, tindakan medis' },
      { id: 3, kode_role: 'PERAWAT', nama_role: 'Perawat / Bidan', keterangan: 'Asuhan keperawatan, monitoring TTV, antrean poliklinik' },
      { id: 4, kode_role: 'APOTEKER', nama_role: 'Apoteker / Farmasis', keterangan: 'Telaah resep, dispensing, stok obat' },
      { id: 5, kode_role: 'KASIR', nama_role: 'Petugas Kasir & Billing', keterangan: 'Pembayaran tagihan pasien, laporan penerimaan' },
    ];

    for (const r of rolesData) {
      await Role.upsert(r, { transaction: t });
    }

    // 2. SEED INSTALASI
    console.log('2. Menambahkan data Instalasi...');
    const instalasiData = [
      { id: 1, kode_instalasi: 'IRJ', nama_instalasi: 'Instalasi Rawat Jalan' },
      { id: 2, kode_instalasi: 'IRNA', nama_instalasi: 'Instalasi Rawat Inap' },
      { id: 3, kode_instalasi: 'IGD', nama_instalasi: 'Instalasi Gawat Darurat' },
      { id: 4, kode_instalasi: 'FARMASI', nama_instalasi: 'Instalasi Farmasi' },
      { id: 5, kode_instalasi: 'KASIR', nama_instalasi: 'Instalasi Kasir & Keuangan' },
      { id: 6, kode_instalasi: 'LAB', nama_instalasi: 'Instalasi Laboratorium' },
      { id: 7, kode_instalasi: 'RAD', nama_instalasi: 'Instalasi Radiologi' },
    ];

    for (const inst of instalasiData) {
      await Instalasi.upsert(inst, { transaction: t });
    }

    // 3. SEED RUANGAN
    console.log('3. Menambahkan data Ruangan...');
    const ruanganData = [
      // Rawat Jalan
      { id: 101, instalasi_id: 1, kode_ruangan: 'POLI_DALAM', nama_ruangan: 'Poli Penyakit Dalam' },
      { id: 102, instalasi_id: 1, kode_ruangan: 'POLI_ANAK', nama_ruangan: 'Poli Spesialis Anak' },
      { id: 103, instalasi_id: 1, kode_ruangan: 'POLI_MATA', nama_ruangan: 'Poli Spesialis Mata' },
      // Rawat Inap
      { id: 201, instalasi_id: 2, kode_ruangan: 'BANGSAL_MAWAR', nama_ruangan: 'Bangsal Mawar (VIP)' },
      { id: 202, instalasi_id: 2, kode_ruangan: 'BANGSAL_MELATI', nama_ruangan: 'Bangsal Melati (Kelas 1)' },
      // IGD
      { id: 301, instalasi_id: 3, kode_ruangan: 'IGD_TRIAGE', nama_ruangan: 'Ruang Triage IGD' },
      // Farmasi
      { id: 401, instalasi_id: 4, kode_ruangan: 'DEPO_FARMASI_RJ', nama_ruangan: 'Depo Farmasi Rawat Jalan' },
      { id: 402, instalasi_id: 4, kode_ruangan: 'GUDANG_FARMASI', nama_ruangan: 'Gudang Farmasi Sentral' },
      // Kasir
      { id: 501, instalasi_id: 5, kode_ruangan: 'LOKET_KASIR_1', nama_ruangan: 'Loket Kasir Sentral 1' },
    ];

    for (const r of ruanganData) {
      await Ruangan.upsert(r, { transaction: t });
    }

    // 4. SEED MENUS HIERARKIS
    console.log('4. Menambahkan data Menu Hierarkis...');
    const menuData = [
      // Modul Rawat Jalan (Parent)
      { id: 1, parent_id: null, kode_menu: 'MODUL_RJ', nama_menu: 'Pelayanan Rawat Jalan', icon: 'stethoscope', path: '/rawat-jalan', order_index: 10 },
      { id: 2, parent_id: 1, kode_menu: 'RJ_ANTREAN', nama_menu: 'Antrean Poliklinik', icon: 'list-ordered', path: '/rawat-jalan/antrean', order_index: 11 },
      { id: 3, parent_id: 1, kode_menu: 'RJ_PEMERIKSAAN', nama_menu: 'Pemeriksaan EMR', icon: 'file-text', path: '/rawat-jalan/pemeriksaan', order_index: 12 },
      { id: 4, parent_id: 1, kode_menu: 'RJ_RESEP', nama_menu: 'Resep Elektronik', icon: 'prescription', path: '/rawat-jalan/resep', order_index: 13 },
      { id: 5, parent_id: 1, kode_menu: 'RJ_KONSUL', nama_menu: 'Konsul Antar Poli', icon: 'share-2', path: '/rawat-jalan/konsul', order_index: 14 },

      // Modul Rawat Inap (Parent)
      { id: 10, parent_id: null, kode_menu: 'MODUL_IRNA', nama_menu: 'Pelayanan Rawat Inap', icon: 'bed', path: '/rawat-inap', order_index: 20 },
      { id: 11, parent_id: 10, kode_menu: 'IRNA_SENSUS', nama_menu: 'Sensus Pasien Dirawat', icon: 'users', path: '/rawat-inap/sensus', order_index: 21 },
      { id: 12, parent_id: 10, kode_menu: 'IRNA_CPPT', nama_menu: 'CPPT Terintegrasi', icon: 'clipboard', path: '/rawat-inap/cppt', order_index: 22 },
      { id: 13, parent_id: 10, kode_menu: 'IRNA_TTV', nama_menu: 'Monitoring Tanda Vital', icon: 'activity', path: '/rawat-inap/ttv', order_index: 23 },
      { id: 14, parent_id: 10, kode_menu: 'IRNA_DISCHARGE', nama_menu: 'Resume Medis Pasien Pulang', icon: 'check-square', path: '/rawat-inap/discharge', order_index: 24 },

      // Modul IGD (Parent)
      { id: 20, parent_id: null, kode_menu: 'MODUL_IGD', nama_menu: 'Gawat Darurat (IGD)', icon: 'alert-circle', path: '/igd', order_index: 30 },
      { id: 21, parent_id: 20, kode_menu: 'IGD_TRIAGE', nama_menu: 'Skrining & Triage Pasien', icon: 'shield-alert', path: '/igd/triage', order_index: 31 },
      { id: 22, parent_id: 20, kode_menu: 'IGD_TINDAKAN', nama_menu: 'Tindakan Resusitasi', icon: 'crosshair', path: '/igd/tindakan', order_index: 32 },

      // Modul Farmasi (Parent)
      { id: 30, parent_id: null, kode_menu: 'MODUL_FARMASI', nama_menu: 'Pelayanan Farmasi', icon: 'pill', path: '/farmasi', order_index: 40 },
      { id: 31, parent_id: 30, kode_menu: 'FAR_ANTREAN_RESEP', nama_menu: 'Antrean Resep Masuk', icon: 'inbox', path: '/farmasi/antrean-resep', order_index: 41 },
      { id: 32, parent_id: 30, kode_menu: 'FAR_TELAAH', nama_menu: 'Telaah Resep Klinis', icon: 'check-circle', path: '/farmasi/telaah', order_index: 42 },
      { id: 33, parent_id: 30, kode_menu: 'FAR_DISPENSING', nama_menu: 'Dispensing & Etiket', icon: 'package', path: '/farmasi/dispensing', order_index: 43 },
      { id: 34, parent_id: 30, kode_menu: 'FAR_STOK', nama_menu: 'Stok Obat & BMHP', icon: 'database', path: '/farmasi/stok', order_index: 44 },

      // Modul Kasir & Keuangan (Parent)
      { id: 40, parent_id: null, kode_menu: 'MODUL_KASIR', nama_menu: 'Kasir & Billing', icon: 'credit-card', path: '/kasir', order_index: 50 },
      { id: 41, parent_id: 40, kode_menu: 'KASIR_TAGIHAN', nama_menu: 'Tagihan & Pembayaran', icon: 'dollar-sign', path: '/kasir/tagihan', order_index: 51 },
      { id: 42, parent_id: 40, kode_menu: 'KASIR_LAPORAN', nama_menu: 'Laporan Kas Shift', icon: 'bar-chart-2', path: '/kasir/laporan', order_index: 52 },

      // Modul Master Data (Global / Admin Only)
      { id: 50, parent_id: null, kode_menu: 'MODUL_MASTER', nama_menu: 'Master & Pengaturan SIMRS', icon: 'settings', path: '/pengaturan', order_index: 90 },
      { id: 51, parent_id: 50, kode_menu: 'ADM_USERS', nama_menu: 'Manajemen Pengguna', icon: 'user-check', path: '/pengaturan/users', order_index: 91 },
      { id: 52, parent_id: 50, kode_menu: 'ADM_RUANGAN', nama_menu: 'Instalasi & Ruangan', icon: 'home', path: '/pengaturan/ruangan', order_index: 92 },
      { id: 53, parent_id: 50, kode_menu: 'ADM_ROLES', nama_menu: 'Role & Hak Akses', icon: 'shield', path: '/pengaturan/roles', order_index: 93 },
    ];

    for (const m of menuData) {
      await Menu.upsert(m, { transaction: t });
    }

    // 5. SEED MENU - INSTALASI MAPPING (Keterikatan Menu ke Instalasi)
    console.log('5. Menghubungkan Menu ke Instalasi...');
    const menuInstalasiList = [
      // Rawat Jalan (Instalasi ID = 1)
      { menu_id: 1, instalasi_id: 1 },
      { menu_id: 2, instalasi_id: 1 },
      { menu_id: 3, instalasi_id: 1 },
      { menu_id: 4, instalasi_id: 1 },
      { menu_id: 5, instalasi_id: 1 },

      // Rawat Inap (Instalasi ID = 2)
      { menu_id: 10, instalasi_id: 2 },
      { menu_id: 11, instalasi_id: 2 },
      { menu_id: 12, instalasi_id: 2 },
      { menu_id: 13, instalasi_id: 2 },
      { menu_id: 14, instalasi_id: 2 },

      // IGD (Instalasi ID = 3)
      { menu_id: 20, instalasi_id: 3 },
      { menu_id: 21, instalasi_id: 3 },
      { menu_id: 22, instalasi_id: 3 },

      // Farmasi (Instalasi ID = 4)
      { menu_id: 30, instalasi_id: 4 },
      { menu_id: 31, instalasi_id: 4 },
      { menu_id: 32, instalasi_id: 4 },
      { menu_id: 33, instalasi_id: 4 },
      { menu_id: 34, instalasi_id: 4 },

      // Kasir (Instalasi ID = 5)
      { menu_id: 40, instalasi_id: 5 },
      { menu_id: 41, instalasi_id: 5 },
      { menu_id: 42, instalasi_id: 5 },

      // Modul 50 (Master Data) sengaja tidak dimasukkan ke instalasi_id tertentu karena bersifat global
    ];

    await MenuInstalasi.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
    await MenuInstalasi.bulkCreate(menuInstalasiList, { transaction: t });

    // 6. SEED ROLE - MENU MAPPING
    console.log('6. Memberikan hak akses Menu ke masing-masing Role...');
    const roleMenuList = [];

    // Role ADMIN (ID: 1): Akses ke SEMUA menu (1 s/d 53)
    for (const m of menuData) {
      roleMenuList.push({ role_id: 1, menu_id: m.id });
    }

    // Role DOKTER (ID: 2): Akses ke Rawat Jalan (1-5), Rawat Inap (10-14), IGD (20-22)
    const dokterMenus = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 20, 21, 22];
    for (const mId of dokterMenus) {
      roleMenuList.push({ role_id: 2, menu_id: mId });
    }

    // Role PERAWAT (ID: 3): Akses ke Rawat Jalan (1,2,5), Rawat Inap (10,11,12,13), IGD (20,21)
    const perawatMenus = [1, 2, 5, 10, 11, 12, 13, 20, 21];
    for (const mId of perawatMenus) {
      roleMenuList.push({ role_id: 3, menu_id: mId });
    }

    // Role APOTEKER (ID: 4): Akses ke Modul Farmasi (30, 31, 32, 33, 34)
    const apotekerMenus = [30, 31, 32, 33, 34];
    for (const mId of apotekerMenus) {
      roleMenuList.push({ role_id: 4, menu_id: mId });
    }

    // Role KASIR (ID: 5): Akses ke Modul Kasir (40, 41, 42)
    const kasirMenus = [40, 41, 42];
    for (const mId of kasirMenus) {
      roleMenuList.push({ role_id: 5, menu_id: mId });
    }

    await RoleMenu.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
    await RoleMenu.bulkCreate(roleMenuList, { transaction: t });

    // 7. SEED USERS DENGAN PASSWORD HASH
    console.log('7. Menambahkan Akun Pengguna SIMRS...');
    const usersToCreate = [
      {
        username: 'admin',
        password_plain: 'admin123',
        nama_lengkap: 'Super Administrator SIMRS',
        nip_nik: '198801012015011001',
        email: 'admin@simrs.local',
      },
      {
        username: 'dr.budi',
        password_plain: 'dokter123',
        nama_lengkap: 'dr. Budi Santoso, Sp.PD',
        nip_nik: '198205122010011003',
        email: 'dr.budi@simrs.local',
      },
      {
        username: 'perawat.siti',
        password_plain: 'perawat123',
        nama_lengkap: 'Ns. Siti Rahmawati, S.Kep',
        nip_nik: '199003202014022005',
        email: 'siti.perawat@simrs.local',
      },
      {
        username: 'apt.rani',
        password_plain: 'apotek123',
        nama_lengkap: 'apt. Rani Kusuma, S.Farm',
        nip_nik: '199208152016022002',
        email: 'rani.farmasi@simrs.local',
      },
      {
        username: 'kasir.doni',
        password_plain: 'kasir123',
        nama_lengkap: 'Doni Pratama, S.E',
        nip_nik: '199411252018011004',
        email: 'doni.kasir@simrs.local',
      },
    ];

    const createdUsers = {};
    for (const u of usersToCreate) {
      let user = await User.findOne({ where: { username: u.username }, transaction: t });
      const password_hash = await bcrypt.hash(u.password_plain, 10);
      if (!user) {
        user = await User.create(
          {
            username: u.username,
            password_hash,
            nama_lengkap: u.nama_lengkap,
            nip_nik: u.nip_nik,
            email: u.email,
            is_active: true,
          },
          { transaction: t }
        );
      } else {
        user.password_hash = password_hash;
        user.nama_lengkap = u.nama_lengkap;
        user.nip_nik = u.nip_nik;
        user.email = u.email;
        await user.save({ transaction: t });
      }
      createdUsers[u.username] = user;
    }

    // 8. SEED USER RUANGAN ROLE (PENUGASAN MULTI-RUANGAN & INSTALASI)
    console.log('8. Mengonfigurasi Penugasan Ruangan & Role Pengguna...');
    await UserRuanganRole.destroy({ where: {}, truncate: true, cascade: true, transaction: t });

    const assignmentRows = [
      // Admin -> Akses Poli Penyakit Dalam sebagai ADMIN
      {
        user_id: createdUsers['admin'].id,
        ruangan_id: 101, // Poli Penyakit Dalam
        role_id: 1, // ADMIN
        is_default: true,
      },
      // dr. Budi Santoso -> Ditugaskan di 2 tempat:
      // 1. Poli Penyakit Dalam (IRJ) sebagai DOKTER
      {
        user_id: createdUsers['dr.budi'].id,
        ruangan_id: 101, // Poli Penyakit Dalam
        role_id: 2, // DOKTER
        is_default: true,
      },
      // 2. Bangsal Mawar VIP (IRNA) sebagai DOKTER (Visite rawat inap)
      {
        user_id: createdUsers['dr.budi'].id,
        ruangan_id: 201, // Bangsal Mawar (VIP)
        role_id: 2, // DOKTER
        is_default: false,
      },

      // Perawat Siti -> Ditugaskan di:
      // 1. Poli Penyakit Dalam (IRJ) sebagai PERAWAT
      {
        user_id: createdUsers['perawat.siti'].id,
        ruangan_id: 101,
        role_id: 3, // PERAWAT
        is_default: true,
      },
      // 2. Bangsal Melati (IRNA) sebagai PERAWAT
      {
        user_id: createdUsers['perawat.siti'].id,
        ruangan_id: 202,
        role_id: 3, // PERAWAT
        is_default: false,
      },

      // Apoteker Rani -> Ditugaskan di Depo Farmasi Rawat Jalan
      {
        user_id: createdUsers['apt.rani'].id,
        ruangan_id: 401, // Depo Farmasi Rawat Jalan
        role_id: 4, // APOTEKER
        is_default: true,
      },

      // Kasir Doni -> Ditugaskan di Loket Kasir Sentral 1
      {
        user_id: createdUsers['kasir.doni'].id,
        ruangan_id: 501, // Loket Kasir
        role_id: 5, // KASIR
        is_default: true,
      },
    ];

    await UserRuanganRole.bulkCreate(assignmentRows, { transaction: t });

    await t.commit();

    // Sinkronkan sequence serial auto-increment PostgreSQL
    await sequelize.query("SELECT setval('instalasi_id_seq', COALESCE((SELECT MAX(id) FROM instalasi), 1));");
    await sequelize.query("SELECT setval('ruangan_id_seq', COALESCE((SELECT MAX(id) FROM ruangan), 1));");
    await sequelize.query("SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1));");
    await sequelize.query("SELECT setval('menus_id_seq', COALESCE((SELECT MAX(id) FROM menus), 1));");
    await sequelize.query("SELECT setval('menu_instalasi_id_seq', COALESCE((SELECT MAX(id) FROM menu_instalasi), 1));");
    await sequelize.query("SELECT setval('role_menus_id_seq', COALESCE((SELECT MAX(id) FROM role_menus), 1));");
    await sequelize.query("SELECT setval('user_ruangan_roles_id_seq', COALESCE((SELECT MAX(id) FROM user_ruangan_roles), 1));");

    console.log('✓ Seeding database SIMRS berhasil dengan sukses!');
    console.log('\n--- Daftar Akun Demo SIMRS ---');
    console.log('1. Admin:        username: admin         | password: admin123');
    console.log('2. Dokter:       username: dr.budi       | password: dokter123  (Tersedia di IRJ Poli Dalam & IRNA Bangsal Mawar)');
    console.log('3. Perawat:      username: perawat.siti  | password: perawat123 (Tersedia di IRJ Poli Dalam & IRNA Bangsal Melati)');
    console.log('4. Apoteker:     username: apt.rani      | password: apotek123  (Tersedia di Instalasi Farmasi)');
    console.log('5. Kasir:        username: kasir.doni    | password: kasir123   (Tersedia di Instalasi Kasir)');
    console.log('--------------------------------\n');
  } catch (error) {
    await t.rollback();
    console.error('✗ Gagal melakukan seeding database:', error.message);
    if (closeConnection) process.exit(1);
    throw error;
  } finally {
    if (closeConnection) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  runSeeder(true);
}

module.exports = runSeeder;

