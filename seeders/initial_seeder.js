const bcrypt = require('bcrypt');
const seedWilayah = require('./wilayah_seeder');
const seedPendaftaran = require('./pendaftaran_seeder');
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
  Modul,
  ModulInstalasi,
  ModulRuangan,
  UserRuanganModul,
} = require('../models');

async function runSeeder(closeConnection = false) {
  console.log('--- Memulai Seeding Data Master SIMRS & Modul ---');
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
      { id: 6, kode_role: 'PENDAFTARAN', nama_role: 'Petugas Pendaftaran & Rekam Medis', keterangan: 'Pelayanan pendaftaran pasien baru/lama dan admisi rawat jalan' },
    ];

    for (const r of rolesData) {
      await Role.upsert(r, { transaction: t });
    }

    // 2. SEED MODUL UTAMA SIMRS
    console.log('2. Menambahkan data Modul SIMRS...');
    const modulData = [
      { id: 1, kode_modul: 'MODUL_RJ', nama_modul: 'Pelayanan Rawat Jalan', deskripsi: 'Pemeriksaan poliklinik, antrean, EMR poli', icon: 'stethoscope', order_index: 10 },
      { id: 2, kode_modul: 'MODUL_IRNA', nama_modul: 'Pelayanan Rawat Inap', deskripsi: 'Sensus bangsal, CPPT, monitoring TTV, discharge', icon: 'bed', order_index: 20 },
      { id: 3, kode_modul: 'MODUL_IGD', nama_modul: 'Gawat Darurat (IGD)', deskripsi: 'Triage gawat darurat, resusitasi, transfer ruangan', icon: 'alert-circle', order_index: 30 },
      { id: 4, kode_modul: 'MODUL_FARMASI', nama_modul: 'Pelayanan Farmasi & Apotek', deskripsi: 'Antrean resep, telaah klinis, dispensing, stok obat', icon: 'pill', order_index: 40 },
      { id: 5, kode_modul: 'MODUL_KASIR', nama_modul: 'Kasir & Billing Pasien', deskripsi: 'Tagihan kasir, pembayaran pelayanan, rekap shift kasir', icon: 'credit-card', order_index: 50 },
      { id: 6, kode_modul: 'MODUL_MASTER', nama_modul: 'Master & Pengaturan SIMRS', deskripsi: 'Manajemen pengguna, instalasi, ruangan, hak akses modul & menu', icon: 'settings', order_index: 90 },
      { id: 7, kode_modul: 'MODUL_PENDAFTARAN', nama_modul: 'Pendaftaran & Admisi Pasien', deskripsi: 'Pendaftaran rawat jalan, manajemen data pasien rekam medis & antrean poli', icon: 'user-plus', order_index: 5 },
    ];

    for (const mod of modulData) {
      await Modul.upsert(mod, { transaction: t });
    }

    // 3. SEED INSTALASI
    console.log('3. Menambahkan data Instalasi...');
    const instalasiData = [
      { id: 1, kode_instalasi: 'IRJ', nama_instalasi: 'Instalasi Rawat Jalan' },
      { id: 2, kode_instalasi: 'IRNA', nama_instalasi: 'Instalasi Rawat Inap' },
      { id: 3, kode_instalasi: 'IGD', nama_instalasi: 'Instalasi Gawat Darurat' },
      { id: 4, kode_instalasi: 'FARMASI', nama_instalasi: 'Instalasi Farmasi' },
      { id: 5, kode_instalasi: 'KASIR', nama_instalasi: 'Instalasi Kasir & Keuangan' },
      { id: 6, kode_instalasi: 'LAB', nama_instalasi: 'Instalasi Laboratorium' },
      { id: 7, kode_instalasi: 'RAD', nama_instalasi: 'Instalasi Radiologi' },
      { id: 8, kode_instalasi: 'IRM', nama_instalasi: 'Instalasi Rekam Medis & Admisi' },
    ];

    for (const inst of instalasiData) {
      await Instalasi.upsert(inst, { transaction: t });
    }

    // 4. SEED RUANGAN
    console.log('4. Menambahkan data Ruangan...');
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
      // Rekam Medis & Pendaftaran
      { id: 801, instalasi_id: 8, kode_ruangan: 'LOKET_PENDAFTARAN_1', nama_ruangan: 'Loket Pendaftaran Sentral 1' },
    ];

    for (const r of ruanganData) {
      await Ruangan.upsert(r, { transaction: t });
    }

    // 5. SEED MODUL KE INSTALASI & RUANGAN
    console.log('5. Memetakan Modul ke Instalasi dan Ruangan...');
    await ModulInstalasi.destroy({ where: {}, force: true, transaction: t });
    await ModulRuangan.destroy({ where: {}, force: true, transaction: t });

    const modulInstalasiList = [
      { modul_id: 1, instalasi_id: 1 }, // Modul Rawat Jalan di Instalasi IRJ
      { modul_id: 2, instalasi_id: 2 }, // Modul Rawat Inap di Instalasi IRNA
      { modul_id: 3, instalasi_id: 3 }, // Modul IGD di Instalasi IGD
      { modul_id: 4, instalasi_id: 4 }, // Modul Farmasi di Instalasi Farmasi
      { modul_id: 5, instalasi_id: 5 },
      { modul_id: 7, instalasi_id: 8 }, // Modul Pendaftaran di Instalasi Rekam Medis // Modul Kasir di Instalasi Kasir
    ];
    await ModulInstalasi.bulkCreate(modulInstalasiList, { transaction: t });

    const modulRuanganList = [
      { modul_id: 1, ruangan_id: 101 },
      { modul_id: 1, ruangan_id: 102 },
      { modul_id: 1, ruangan_id: 103 },
      { modul_id: 2, ruangan_id: 201 },
      { modul_id: 2, ruangan_id: 202 },
      { modul_id: 3, ruangan_id: 301 },
      { modul_id: 4, ruangan_id: 401 },
      { modul_id: 4, ruangan_id: 402 },
      { modul_id: 5, ruangan_id: 501 },
      { modul_id: 7, ruangan_id: 801 }, // Modul Pendaftaran di Loket Pendaftaran 1
    ];
    await ModulRuangan.bulkCreate(modulRuanganList, { transaction: t });

    // 6. SEED MENUS HIERARKIS (DENGAN KETERIKATAN MODUL)
    console.log('6. Menambahkan data Menu Hierarkis dengan relasi Modul...');
    const menuData = [
      // Modul 1: Rawat Jalan
      { id: 1, modul_id: 1, parent_id: null, kode_menu: 'MODUL_RJ', nama_menu: 'Pelayanan Rawat Jalan', icon: 'stethoscope', path: '/rawat-jalan', order_index: 10 },
      { id: 2, modul_id: 1, parent_id: 1, kode_menu: 'RJ_ANTREAN', nama_menu: 'Antrean Poliklinik', icon: 'list-ordered', path: '/rawat-jalan/antrean', order_index: 11 },
      { id: 3, modul_id: 1, parent_id: 1, kode_menu: 'RJ_PEMERIKSAAN', nama_menu: 'Pemeriksaan EMR', icon: 'file-text', path: '/rawat-jalan/pemeriksaan', order_index: 12 },
      { id: 4, modul_id: 1, parent_id: 1, kode_menu: 'RJ_RESEP', nama_menu: 'Resep Elektronik', icon: 'prescription', path: '/rawat-jalan/resep', order_index: 13 },
      { id: 5, modul_id: 1, parent_id: 1, kode_menu: 'RJ_KONSUL', nama_menu: 'Konsul Antar Poli', icon: 'share-2', path: '/rawat-jalan/konsul', order_index: 14 },

      // Modul 2: Rawat Inap
      { id: 10, modul_id: 2, parent_id: null, kode_menu: 'MODUL_IRNA', nama_menu: 'Pelayanan Rawat Inap', icon: 'bed', path: '/rawat-inap', order_index: 20 },
      { id: 11, modul_id: 2, parent_id: 10, kode_menu: 'IRNA_SENSUS', nama_menu: 'Sensus Pasien Dirawat', icon: 'users', path: '/rawat-inap/sensus', order_index: 21 },
      { id: 12, modul_id: 2, parent_id: 10, kode_menu: 'IRNA_CPPT', nama_menu: 'CPPT Terintegrasi', icon: 'clipboard', path: '/rawat-inap/cppt', order_index: 22 },
      { id: 13, modul_id: 2, parent_id: 10, kode_menu: 'IRNA_TTV', nama_menu: 'Monitoring Tanda Vital', icon: 'activity', path: '/rawat-inap/ttv', order_index: 23 },
      { id: 14, modul_id: 2, parent_id: 10, kode_menu: 'IRNA_DISCHARGE', nama_menu: 'Resume Medis Pasien Pulang', icon: 'check-square', path: '/rawat-inap/discharge', order_index: 24 },

      // Modul 3: IGD
      { id: 20, modul_id: 3, parent_id: null, kode_menu: 'MODUL_IGD', nama_menu: 'Gawat Darurat (IGD)', icon: 'alert-circle', path: '/igd', order_index: 30 },
      { id: 21, modul_id: 3, parent_id: 20, kode_menu: 'IGD_TRIAGE', nama_menu: 'Skrining & Triage Pasien', icon: 'shield-alert', path: '/igd/triage', order_index: 31 },
      { id: 22, modul_id: 3, parent_id: 20, kode_menu: 'IGD_TINDAKAN', nama_menu: 'Tindakan Resusitasi', icon: 'crosshair', path: '/igd/tindakan', order_index: 32 },

      // Modul 4: Farmasi
      { id: 30, modul_id: 4, parent_id: null, kode_menu: 'MODUL_FARMASI', nama_menu: 'Pelayanan Farmasi', icon: 'pill', path: '/farmasi', order_index: 40 },
      { id: 31, modul_id: 4, parent_id: 30, kode_menu: 'FAR_ANTREAN_RESEP', nama_menu: 'Antrean Resep Masuk', icon: 'inbox', path: '/farmasi/antrean-resep', order_index: 41 },
      { id: 32, modul_id: 4, parent_id: 30, kode_menu: 'FAR_TELAAH', nama_menu: 'Telaah Resep Klinis', icon: 'check-circle', path: '/farmasi/telaah', order_index: 42 },
      { id: 33, modul_id: 4, parent_id: 30, kode_menu: 'FAR_DISPENSING', nama_menu: 'Dispensing & Etiket', icon: 'package', path: '/farmasi/dispensing', order_index: 43 },
      { id: 34, modul_id: 4, parent_id: 30, kode_menu: 'FAR_STOK', nama_menu: 'Stok Obat & BMHP', icon: 'database', path: '/farmasi/stok', order_index: 44 },

      // Modul 5: Kasir & Keuangan
      { id: 40, modul_id: 5, parent_id: null, kode_menu: 'MODUL_KASIR', nama_menu: 'Kasir & Billing', icon: 'credit-card', path: '/kasir', order_index: 50 },
      { id: 41, modul_id: 5, parent_id: 40, kode_menu: 'KASIR_TAGIHAN', nama_menu: 'Tagihan & Pembayaran', icon: 'dollar-sign', path: '/kasir/tagihan', order_index: 51 },
      { id: 42, modul_id: 5, parent_id: 40, kode_menu: 'KASIR_LAPORAN', nama_menu: 'Laporan Kas Shift', icon: 'bar-chart-2', path: '/kasir/laporan', order_index: 52 },

      // Modul 6: Master Data & Pengaturan SIMRS
      { id: 50, modul_id: 6, parent_id: null, kode_menu: 'MODUL_MASTER', nama_menu: 'Master & Pengaturan SIMRS', icon: 'settings', path: '/pengaturan', order_index: 90 },
      { id: 51, modul_id: 6, parent_id: 50, kode_menu: 'ADM_USERS', nama_menu: 'Manajemen Pengguna', icon: 'user-check', path: '/pengaturan/users', order_index: 91 },
      { id: 52, modul_id: 6, parent_id: 50, kode_menu: 'ADM_RUANGAN', nama_menu: 'Instalasi & Ruangan', icon: 'home', path: '/pengaturan/ruangan', order_index: 92 },
      { id: 53, modul_id: 6, parent_id: 50, kode_menu: 'ADM_ROLES', nama_menu: 'Role & Hak Akses', icon: 'shield', path: '/pengaturan/roles', order_index: 93 },
      { id: 54, modul_id: 6, parent_id: 50, kode_menu: 'ADM_WILAYAH', nama_menu: 'Master Wilayah & Kodepos', icon: 'map-pin', path: '/pengaturan/wilayah', order_index: 94 },

      // Modul 7: Pendaftaran & Admisi Pasien (Rekam Medis)
      { id: 60, modul_id: 7, parent_id: null, kode_menu: 'MODUL_PENDAFTARAN', nama_menu: 'Pendaftaran & Admisi Pasien', icon: 'user-plus', path: '/pendaftaran', order_index: 5 },
      { id: 61, modul_id: 7, parent_id: 60, kode_menu: 'PENDAFTARAN_RJ', nama_menu: 'Pendaftaran Rawat Jalan', icon: 'calendar', path: '/pendaftaran/rawat-jalan', order_index: 6 },
      { id: 62, modul_id: 7, parent_id: 60, kode_menu: 'PENDAFTARAN_PASIEN', nama_menu: 'Data Pasien Rekam Medis', icon: 'users', path: '/pendaftaran/pasien', order_index: 7 },
      { id: 63, modul_id: 7, parent_id: 60, kode_menu: 'PENDAFTARAN_JADWAL', nama_menu: 'Jadwal Praktik Dokter', icon: 'clock', path: '/pendaftaran/jadwal-dokter', order_index: 8 },
    ];

    for (const m of menuData) {
      await Menu.upsert(m, { transaction: t });
    }

    // 7. SEED MENU - INSTALASI MAPPING
    console.log('7. Menghubungkan Menu ke Instalasi...');
    const menuInstalasiList = [
      { menu_id: 1, instalasi_id: 1 },
      { menu_id: 2, instalasi_id: 1 },
      { menu_id: 3, instalasi_id: 1 },
      { menu_id: 4, instalasi_id: 1 },
      { menu_id: 5, instalasi_id: 1 },      { menu_id: 10, instalasi_id: 2 },
      { menu_id: 11, instalasi_id: 2 },
      { menu_id: 12, instalasi_id: 2 },
      { menu_id: 13, instalasi_id: 2 },
      { menu_id: 14, instalasi_id: 2 },
      { menu_id: 20, instalasi_id: 3 },
      { menu_id: 21, instalasi_id: 3 },
      { menu_id: 22, instalasi_id: 3 },
      { menu_id: 30, instalasi_id: 4 },
      { menu_id: 31, instalasi_id: 4 },
      { menu_id: 32, instalasi_id: 4 },
      { menu_id: 33, instalasi_id: 4 },
      { menu_id: 34, instalasi_id: 4 },
      { menu_id: 40, instalasi_id: 5 },
      { menu_id: 41, instalasi_id: 5 },
      { menu_id: 42, instalasi_id: 5 },
      { menu_id: 60, instalasi_id: 8 },
      { menu_id: 61, instalasi_id: 8 },
      { menu_id: 62, instalasi_id: 8 },
      { menu_id: 63, instalasi_id: 8 },
    ];

    await MenuInstalasi.destroy({ where: {}, force: true, transaction: t });
    await MenuInstalasi.bulkCreate(menuInstalasiList, { transaction: t });

    // 8. SEED ROLE - MENU MAPPING
    console.log('8. Memberikan hak akses Menu ke masing-masing Role...');
    const roleMenuList = [];
    for (const m of menuData) {
      roleMenuList.push({ role_id: 1, menu_id: m.id }); // ADMIN akses semua
    }
    const dokterMenus = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 20, 21, 22];
    for (const mId of dokterMenus) {
      roleMenuList.push({ role_id: 2, menu_id: mId });
    }
    const perawatMenus = [1, 2, 5, 10, 11, 12, 13, 20, 21];
    for (const mId of perawatMenus) {
      roleMenuList.push({ role_id: 3, menu_id: mId });
    }
    const apotekerMenus = [30, 31, 32, 33, 34];
    for (const mId of apotekerMenus) {
      roleMenuList.push({ role_id: 4, menu_id: mId });
    }
    const kasirMenus = [40, 41, 42];
    for (const mId of kasirMenus) {
      roleMenuList.push({ role_id: 5, menu_id: mId });
    }
    const pendaftaranMenus = [60, 61, 62, 63];
    for (const mId of pendaftaranMenus) {
      roleMenuList.push({ role_id: 6, menu_id: mId });
    }

    await RoleMenu.destroy({ where: {}, force: true, transaction: t });
    await RoleMenu.bulkCreate(roleMenuList, { transaction: t });

    // 9. SEED USERS DENGAN PASSWORD HASH
    console.log('9. Menambahkan Akun Pengguna SIMRS...');
    const usersToCreate = [
      { username: 'admin', password_plain: 'admin123', nama_lengkap: 'Super Administrator SIMRS', nip_nik: '198801012015011001', email: 'admin@simrs.local' },
      { username: 'dr.budi', password_plain: 'dokter123', nama_lengkap: 'dr. Budi Santoso, Sp.PD', nip_nik: '198205122010011003', email: 'dr.budi@simrs.local' },
      { username: 'perawat.siti', password_plain: 'perawat123', nama_lengkap: 'Ns. Siti Rahmawati, S.Kep', nip_nik: '199003202014022005', email: 'siti.perawat@simrs.local' },
      { username: 'apt.rani', password_plain: 'apotek123', nama_lengkap: 'apt. Rani Kusuma, S.Farm', nip_nik: '199208152016022002', email: 'rani.farmasi@simrs.local' },
      { username: 'kasir.doni', password_plain: 'kasir123', nama_lengkap: 'Doni Pratama, S.E', nip_nik: '199411252018011004', email: 'doni.kasir@simrs.local' },
      { username: 'pendaftaran', password_plain: 'pendaftaran123', nama_lengkap: 'Lia Puspita, A.Md.RMIK', nip_nik: '199505102019032008', email: 'pendaftaran@simrs.local' },
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

    // 10. SEED USER RUANGAN ROLE (PENUGASAN MULTI-RUANGAN & INSTALASI)
    console.log('10. Mengonfigurasi Penugasan Ruangan & Role Pengguna...');
    await UserRuanganRole.destroy({ where: {}, force: true, transaction: t });

    const assignmentRows = [
      { user_id: createdUsers['admin'].id, ruangan_id: 101, role_id: 1, is_default: true },
      { user_id: createdUsers['dr.budi'].id, ruangan_id: 101, role_id: 2, is_default: true },
      { user_id: createdUsers['dr.budi'].id, ruangan_id: 201, role_id: 2, is_default: false },
      { user_id: createdUsers['perawat.siti'].id, ruangan_id: 101, role_id: 3, is_default: true },
      { user_id: createdUsers['perawat.siti'].id, ruangan_id: 202, role_id: 3, is_default: false },
      { user_id: createdUsers['apt.rani'].id, ruangan_id: 401, role_id: 4, is_default: true },
      { user_id: createdUsers['kasir.doni'].id, ruangan_id: 501, role_id: 5, is_default: true },
      { user_id: createdUsers['pendaftaran'].id, ruangan_id: 801, role_id: 6, is_default: true },
    ];
    await UserRuanganRole.bulkCreate(assignmentRows, { transaction: t });

    // 11. SEED USER RUANGAN MODUL (HAK AKSES MODUL PER AKUN DI RUANGAN)
    console.log('11. Mengonfigurasi Hak Akses Modul per Akun di Ruangan...');
    await UserRuanganModul.destroy({ where: {}, force: true, transaction: t });

    const userModulRows = [
      // dr. Budi di Poli Penyakit Dalam -> Diberikan Modul Rawat Jalan (ID: 1)
      { user_id: createdUsers['dr.budi'].id, ruangan_id: 101, modul_id: 1, is_active: true },
      // dr. Budi di Bangsal Mawar -> Diberikan Modul Rawat Inap (ID: 2)
      { user_id: createdUsers['dr.budi'].id, ruangan_id: 201, modul_id: 2, is_active: true },
      // Perawat Siti di Poli Penyakit Dalam -> Diberikan Modul Rawat Jalan (ID: 1)
      { user_id: createdUsers['perawat.siti'].id, ruangan_id: 101, modul_id: 1, is_active: true },
      // Perawat Siti di Bangsal Melati -> Diberikan Modul Rawat Inap (ID: 2)
      { user_id: createdUsers['perawat.siti'].id, ruangan_id: 202, modul_id: 2, is_active: true },
      // Apoteker Rani di Depo Farmasi -> Diberikan Modul Farmasi (ID: 4)
      { user_id: createdUsers['apt.rani'].id, ruangan_id: 401, modul_id: 4, is_active: true },
      // Kasir Doni di Loket Kasir -> Diberikan Modul Kasir (ID: 5)
      { user_id: createdUsers['kasir.doni'].id, ruangan_id: 501, modul_id: 5, is_active: true },
      // Petugas Pendaftaran di Loket Pendaftaran Sentral 1 -> Diberikan Modul Pendaftaran (ID: 7)
      { user_id: createdUsers['pendaftaran'].id, ruangan_id: 801, modul_id: 7, is_active: true },
    ];
    await UserRuanganModul.bulkCreate(userModulRows, { transaction: t });

    // 12. SEED MASTER WILAYAH & KODE POS
    await seedWilayah(t);

    // 13. SEED JADWAL DOKTER & PASIEN DEMO
    await seedPendaftaran(t);

    await t.commit();

    // Sinkronkan sequence serial auto-increment PostgreSQL
    await sequelize.query("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));");
    await sequelize.query("SELECT setval('pasien_id_seq', COALESCE((SELECT MAX(id) FROM pasien), 1));");
    await sequelize.query("SELECT setval('instalasi_id_seq', COALESCE((SELECT MAX(id) FROM instalasi), 1));");
    await sequelize.query("SELECT setval('ruangan_id_seq', COALESCE((SELECT MAX(id) FROM ruangan), 1));");
    await sequelize.query("SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1));");
    await sequelize.query("SELECT setval('menus_id_seq', COALESCE((SELECT MAX(id) FROM menus), 1));");
    await sequelize.query("SELECT setval('menu_instalasi_id_seq', COALESCE((SELECT MAX(id) FROM menu_instalasi), 1));");
    await sequelize.query("SELECT setval('role_menus_id_seq', COALESCE((SELECT MAX(id) FROM role_menus), 1));");
    await sequelize.query("SELECT setval('user_ruangan_roles_id_seq', COALESCE((SELECT MAX(id) FROM user_ruangan_roles), 1));");
    await sequelize.query("SELECT setval('modul_id_seq', COALESCE((SELECT MAX(id) FROM modul), 1));");
    await sequelize.query("SELECT setval('modul_instalasi_id_seq', COALESCE((SELECT MAX(id) FROM modul_instalasi), 1));");
    await sequelize.query("SELECT setval('modul_ruangan_id_seq', COALESCE((SELECT MAX(id) FROM modul_ruangan), 1));");
    await sequelize.query("SELECT setval('user_ruangan_modul_id_seq', COALESCE((SELECT MAX(id) FROM user_ruangan_modul), 1));");
    await sequelize.query("SELECT setval('provinsi_id_seq', COALESCE((SELECT MAX(id) FROM provinsi), 1));");
    await sequelize.query("SELECT setval('kabupaten_kota_id_seq', COALESCE((SELECT MAX(id) FROM kabupaten_kota), 1));");
    await sequelize.query("SELECT setval('kecamatan_id_seq', COALESCE((SELECT MAX(id) FROM kecamatan), 1));");
    await sequelize.query("SELECT setval('desa_kelurahan_id_seq', COALESCE((SELECT MAX(id) FROM desa_kelurahan), 1));");
    await sequelize.query("SELECT setval('kode_pos_id_seq', COALESCE((SELECT MAX(id) FROM kode_pos), 1));");
    await sequelize.query("SELECT setval('jadwal_dokter_id_seq', COALESCE((SELECT MAX(id) FROM jadwal_dokter), 1));");
    await sequelize.query("SELECT setval('pendaftaran_id_seq', COALESCE((SELECT MAX(id) FROM pendaftaran), 1));");

    console.log('✓ Seeding database SIMRS & Modul berhasil dengan sukses!');
    console.log('\n--- Daftar Akun Demo SIMRS ---');
    console.log('1. Admin:        username: admin         | password: admin123  (Akses Semua Modul & Master Data)');
    console.log('2. Dokter:       username: dr.budi       | password: dokter123 (Modul RJ di Poli Dalam, Modul IRNA di Bangsal Mawar)');
    console.log('3. Perawat:      username: perawat.siti  | password: perawat123 (Modul RJ di Poli Dalam, Modul IRNA di Bangsal Melati)');
    console.log('4. Apoteker:     username: apt.rani      | password: apotek123 (Modul Farmasi di Depo Farmasi)');
    console.log('5. Kasir:        username: kasir.doni    | password: kasir123  (Modul Kasir di Loket Kasir)');
    console.log('6. Pendaftaran:  username: pendaftaran   | password: pendaftaran123 (Modul Pendaftaran di Loket Pendaftaran 1, Instalasi Rekam Medis)');
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
