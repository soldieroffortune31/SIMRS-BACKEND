const http = require('http');
const app = require('../server');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 MEMULAI TEST VERIFIKASI API BACKEND SIMRS');
  console.log('====================================================\n');

  // Jalankan server pada port acak (ephemeral port) untuk pengujian
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      testsFailed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('--- TEST 1: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthJson.status === 'UP', 'Health check status is UP');

    // -------------------------------------------------------------
    // TEST 2: Login 2-Tahap untuk Dokter (Pilih Konteks)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Login 2-Tahap untuk Dokter (dr. Budi) ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dr.budi', password: 'dokter123' }),
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, 'Login berhasil status 200');
    assert(loginJson.data.status === 'REQUIRE_CONTEXT_SELECTION', 'Status REQUIRE_CONTEXT_SELECTION diterima');
    assert(Array.isArray(loginJson.data.available_contexts), 'Daftar available_contexts berupa Array');
    
    // Periksa instalasi yang tersedia untuk dr. Budi (Harus ada IRJ dan IRNA)
    const contextInstalasiCodes = loginJson.data.available_contexts.map(c => c.kode_instalasi);
    assert(contextInstalasiCodes.includes('IRJ'), 'dr. Budi memiliki akses Instalasi Rawat Jalan (IRJ)');
    assert(contextInstalasiCodes.includes('IRNA'), 'dr. Budi memiliki akses Instalasi Rawat Inap (IRNA)');

    const tempToken = loginJson.data.temp_token;
    assert(!!tempToken, 'Temp Token untuk pemilihan ruangan berhasil diterbitkan');

    // -------------------------------------------------------------
    // TEST 3: Pemilihan Konteks Rawat Jalan (Poli Penyakit Dalam)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Pemilihan Konteks Rawat Jalan (Poli Penyakit Dalam) ---');
    const selectRes = await fetch(`${baseUrl}/auth/select-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ instalasi_id: 1, ruangan_id: 101 }), // IRJ -> Poli Dalam
    });
    const selectJson = await selectRes.json();
    assert(selectRes.status === 200, 'Select context berhasil status 200');
    assert(selectJson.data.status === 'AUTHENTICATED', 'Status berubah menjadi AUTHENTICATED');
    assert(selectJson.data.active_context.instalasi.kode === 'IRJ', 'Konteks aktif instalasi adalah IRJ');
    assert(selectJson.data.active_context.ruangan.kode === 'POLI_DALAM', 'Konteks aktif ruangan adalah POLI_DALAM');

    // Validasi Menu Dinamis & Modul: Hanya modul & menu Rawat Jalan yang tampil
    assert(Array.isArray(selectJson.data.modules), 'Data modules berupa Array');
    const moduleCodesRJ = selectJson.data.modules.map(m => m.kode_modul);
    assert(moduleCodesRJ.includes('MODUL_RJ'), 'Akun dr. Budi di Poli Dalam mendapatkan MODUL_RJ');
    assert(!moduleCodesRJ.includes('MODUL_IRNA'), 'Akun dr. Budi di Poli Dalam TIDAK mendapatkan MODUL_IRNA');

    const menusRJ = selectJson.data.menus;
    const menuCodesRJ = menusRJ.map(m => m.kode_menu);
    assert(menuCodesRJ.includes('MODUL_RJ'), 'Menu memuat Modul Rawat Jalan (MODUL_RJ)');
    assert(!menuCodesRJ.includes('MODUL_IRNA'), 'Menu TIDAK memuat Modul Rawat Inap (karena di konteks IRJ)');
    assert(!menuCodesRJ.includes('MODUL_FARMASI'), 'Menu TIDAK memuat Modul Farmasi');
    assert(!menuCodesRJ.includes('MODUL_KASIR'), 'Menu TIDAK memuat Modul Kasir');

    const doctorTokenRJ = selectJson.data.token;

    // -------------------------------------------------------------
    // TEST 4: Akses Endpoint Pelayanan Rawat Jalan dengan Token Berkonteks IRJ
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Akses Fitur Pelayanan Berkonteks Rawat Jalan ---');
    const rjQueueRes = await fetch(`${baseUrl}/pelayanan/rawat-jalan/antrean`, {
      headers: { 'Authorization': `Bearer ${doctorTokenRJ}` },
    });
    const rjQueueJson = await rjQueueRes.json();
    assert(rjQueueRes.status === 200, 'Berhasil mengakses antrean poliklinik');
    assert(rjQueueJson.meta.ruangan_code === 'POLI_DALAM', 'Data antrean terikat ruangan POLI_DALAM');

    // -------------------------------------------------------------
    // TEST 5: Switch Context ke Rawat Inap (Bangsal Mawar VIP)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Switch Context ke Rawat Inap (Bangsal Mawar) ---');
    const switchRes = await fetch(`${baseUrl}/auth/switch-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorTokenRJ}`,
      },
      body: JSON.stringify({ instalasi_id: 2, ruangan_id: 201 }), // IRNA -> Bangsal Mawar
    });
    const switchJson = await switchRes.json();
    assert(switchRes.status === 200, 'Switch context status 200');
    assert(switchJson.data.active_context.instalasi.kode === 'IRNA', 'Konteks aktif berganti menjadi IRNA');
    assert(switchJson.data.active_context.ruangan.kode === 'BANGSAL_MAWAR', 'Konteks aktif ruangan berganti ke BANGSAL_MAWAR');

    // Validasi Modul & Menu Dinamis berubah menjadi Rawat Inap
    const moduleCodesIRNA = switchJson.data.modules.map(m => m.kode_modul);
    assert(moduleCodesIRNA.includes('MODUL_IRNA'), 'Modul aktif berganti menjadi MODUL_IRNA');
    assert(!moduleCodesIRNA.includes('MODUL_RJ'), 'MODUL_RJ otomatis tidak aktif');

    const menusIRNA = switchJson.data.menus;
    const menuCodesIRNA = menusIRNA.map(m => m.kode_menu);
    assert(menuCodesIRNA.includes('MODUL_IRNA'), 'Menu sekarang memuat Modul Rawat Inap (MODUL_IRNA)');
    assert(!menuCodesIRNA.includes('MODUL_RJ'), 'Menu Modul Rawat Jalan otomatis disembunyikan');

    const doctorTokenIRNA = switchJson.data.token;

    // -------------------------------------------------------------
    // TEST 6: Proteksi Boundary (Dokter di IRNA coba akses endpoint IRJ)
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Proteksi Keamanan Boundary Antar Instalasi ---');
    const forbiddenRes = await fetch(`${baseUrl}/pelayanan/rawat-jalan/antrean`, {
      headers: { 'Authorization': `Bearer ${doctorTokenIRNA}` },
    });
    assert(forbiddenRes.status === 403, 'Akses ke fitur IRJ ditolak (403) saat sesi aktif berada di IRNA');

    // -------------------------------------------------------------
    // TEST 7: Direct 1-Step Login untuk Kasir
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Direct 1-Step Login Kasir ---');
    const kasirLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'kasir.doni',
        password: 'kasir123',
        instalasi_id: 5,
        ruangan_id: 501,
      }),
    });
    const kasirJson = await kasirLoginRes.json();
    assert(kasirLoginRes.status === 200, 'Direct login kasir sukses');
    assert(kasirJson.data.status === 'AUTHENTICATED', 'Langsung berstatus AUTHENTICATED');
    const kasirModuleCodes = kasirJson.data.modules.map(m => m.kode_modul);
    assert(kasirModuleCodes.includes('MODUL_KASIR'), 'Kasir menerima MODUL_KASIR');
    const kasirMenus = kasirJson.data.menus.map(m => m.kode_menu);
    assert(kasirMenus.includes('MODUL_KASIR'), 'Kasir menerima menu Kasir & Billing');
    assert(!kasirMenus.includes('MODUL_RJ'), 'Kasir tidak memiliki akses ke Modul Rawat Jalan');

    // -------------------------------------------------------------
    // TEST 8: Direct 1-Step Login untuk Farmasis / Apoteker
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Direct 1-Step Login Farmasi ---');
    const farmasiLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'apt.rani',
        password: 'apotek123',
        instalasi_id: 4,
        ruangan_id: 401,
      }),
    });
    const farmasiJson = await farmasiLoginRes.json();
    assert(farmasiLoginRes.status === 200, 'Direct login apoteker sukses');
    const farmasiModuleCodes = farmasiJson.data.modules.map(m => m.kode_modul);
    assert(farmasiModuleCodes.includes('MODUL_FARMASI'), 'Apoteker menerima MODUL_FARMASI');
    const farmasiMenus = farmasiJson.data.menus.map(m => m.kode_menu);
    assert(farmasiMenus.includes('MODUL_FARMASI'), 'Apoteker menerima menu Pelayanan Farmasi');

    // -------------------------------------------------------------
    // TEST 9: Menolak Ruangan yang Bukan Hak Akses User
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Validasi Otorisasi Penugasan Ruangan ---');
    const unauthorizedRoomRes = await fetch(`${baseUrl}/auth/select-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ instalasi_id: 4, ruangan_id: 401 }), // dr. Budi coba masuk Depo Farmasi
    });
    assert(unauthorizedRoomRes.status === 403, 'Akses ditolak (403) jika user memilih ruangan yang bukan hak aksesnya');

    // -------------------------------------------------------------
    // TEST 10: Validasi Kredensial Salah
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Kredensial Salah ---');
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dr.budi', password: 'passwordsalah' }),
    });
    assert(badLoginRes.status === 401, 'Login kredensial salah menghasilkan status 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST 11: Pengaturan Hak Akses Modul Akun oleh Admin
    // -------------------------------------------------------------
    console.log('\n--- TEST 11: Admin Mengatur Hak Akses Modul Akun di Ruangan ---');
    // Login sebagai Admin
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123', instalasi_id: 1, ruangan_id: 101 }),
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.data.token;
    assert(!!adminToken, 'Admin berhasil login');

    // Admin assign modul 1 ke dr. Budi di Poli Dalam
    const assignModRes = await fetch(`${baseUrl}/modul/assign-user-ruangan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        user_id: selectJson.data.user.id, // dr. Budi
        ruangan_id: 101, // Poli Dalam
        modul_ids: [1], // Hanya Modul Rawat Jalan
      }),
    });
    const assignModJson = await assignModRes.json();
    assert(assignModRes.status === 200, 'Admin berhasil mengatur modul akun di ruangan (status 200)');
    assert(assignModJson.data.some(m => m.id === 1), 'Modul 1 (Rawat Jalan) aktif untuk user tersebut');

  } catch (error) {
    console.error('Terjadi error saat eksekusi test:', error);
    testsFailed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 HASIL PENGUJIAN API: ${testsPassed} BERHASIL, ${testsFailed} GAGAL`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
