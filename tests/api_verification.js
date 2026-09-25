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

    // -------------------------------------------------------------
    // TEST 12: Master Wilayah - Mengambil daftar Provinsi
    // -------------------------------------------------------------
    console.log('\n--- TEST 12: Master Wilayah - Daftar Provinsi ---');
    const provRes = await fetch(`${baseUrl}/master/provinsi`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const provJson = await provRes.json();
    assert(provRes.status === 200, 'Berhasil mengambil daftar provinsi (status 200)');
    assert(Array.isArray(provJson.data) && provJson.data.length >= 6, 'Data provinsi memuat minimal 6 data');
    const dki = provJson.data.find(p => p.kode_provinsi === '31');
    assert(!!dki && dki.nama_provinsi === 'DKI JAKARTA', 'Ditemukan provinsi DKI JAKARTA (31)');

    // -------------------------------------------------------------
    // TEST 13: Master Wilayah - Filter Kabupaten berdasarkan provinsi_id
    // -------------------------------------------------------------
    console.log('\n--- TEST 13: Master Wilayah - Filter Kabupaten per Provinsi ---');
    const kabRes = await fetch(`${baseUrl}/master/kabupaten?provinsi_id=${dki.id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const kabJson = await kabRes.json();
    assert(kabRes.status === 200, 'Berhasil mengambil kabupaten per provinsi (status 200)');
    assert(kabJson.data.some(k => k.kode_kabupaten === '31.71'), 'Ditemukan KOTA JAKARTA PUSAT');

    // -------------------------------------------------------------
    // TEST 14: Master Wilayah - Filter Kecamatan berdasarkan kabupaten_id
    // -------------------------------------------------------------
    console.log('\n--- TEST 14: Master Wilayah - Filter Kecamatan per Kabupaten ---');
    const kabPusat = kabJson.data.find(k => k.kode_kabupaten === '31.71');
    const kecRes = await fetch(`${baseUrl}/master/kecamatan?kabupaten_id=${kabPusat.id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const kecJson = await kecRes.json();
    assert(kecRes.status === 200, 'Berhasil mengambil kecamatan per kabupaten (status 200)');
    assert(kecJson.data.some(kc => kc.kode_kecamatan === '31.71.01'), 'Ditemukan KECAMATAN GAMBIR');

    // -------------------------------------------------------------
    // TEST 15: Master Wilayah - Filter Desa & Kelurahan
    // -------------------------------------------------------------
    console.log('\n--- TEST 15: Master Wilayah - Filter Desa / Kelurahan ---');
    const kecGambir = kecJson.data.find(kc => kc.kode_kecamatan === '31.71.01');
    const desaRes = await fetch(`${baseUrl}/master/desa?kecamatan_id=${kecGambir.id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const desaJson = await desaRes.json();
    assert(desaRes.status === 200, 'Berhasil mengambil desa per kecamatan (status 200)');
    assert(desaJson.data.some(d => d.kode_desa === '31.71.01.1001'), 'Ditemukan KELURAHAN GAMBIR');
    const kelGambir = desaJson.data.find(d => d.kode_desa === '31.71.01.1001');
    assert(kelGambir.kode_pos === '10110', 'Kelurahan Gambir memiliki kode pos 10110');

    // -------------------------------------------------------------
    // TEST 16: Master Kode Pos - Lookup / Search Kode Pos
    // -------------------------------------------------------------
    console.log('\n--- TEST 16: Master Kode Pos - Lookup Kode Pos ---');
    const kodeposRes = await fetch(`${baseUrl}/master/kodepos/search/55281`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const kodeposJson = await kodeposRes.json();
    assert(kodeposRes.status === 200, 'Lookup kode pos berhasil (status 200)');
    assert(kodeposJson.data.length > 0, 'Ditemukan data kode pos 55281');
    assert(kodeposJson.data[0].provinsi.nama_provinsi === 'DI YOGYAKARTA', 'Kode pos 55281 terhubung ke Provinsi DI YOGYAKARTA');
    assert(kodeposJson.data[0].kabupaten.nama_kabupaten === 'KABUPATEN SLEMAN', 'Kode pos 55281 terhubung ke Kab Sleman');
    assert(kodeposJson.data[0].desa.nama_desa === 'CATURTUNGGAL', 'Kode pos 55281 terhubung ke Desa Caturtunggal');

    // -------------------------------------------------------------
    // TEST 17: Admin Menambahkan Provinsi Baru & Proteksi Non-Admin
    // -------------------------------------------------------------
    console.log('\n--- TEST 17: Admin Tambah Provinsi Baru & Proteksi Non-Admin ---');
    const dynamicKode = `T${Date.now().toString().slice(-8)}`;
    const forbiddenAddRes = await fetch(`${baseUrl}/master/provinsi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorTokenRJ}`,
      },
      body: JSON.stringify({ kode_provinsi: dynamicKode, nama_provinsi: 'PROVINSI BARU' }),
    });
    assert(forbiddenAddRes.status === 403, 'Dokter ditolak (403) saat mencoba menambah master provinsi');

    const adminAddRes = await fetch(`${baseUrl}/master/provinsi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ kode_provinsi: dynamicKode, nama_provinsi: 'PROVINSI UJI COBA' }),
    });
    const adminAddJson = await adminAddRes.json();
    assert(adminAddRes.status === 201, 'Admin berhasil menambahkan master provinsi (status 201)');

    if (adminAddJson.data && adminAddJson.data.id) {
      await fetch(`${baseUrl}/master/provinsi/${adminAddJson.data.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
    }

    // -------------------------------------------------------------
    // TEST 18: Mengambil Jadwal Dokter
    // -------------------------------------------------------------
    console.log('\n--- TEST 18: Jadwal Dokter Poliklinik ---');
    const jadwalRes = await fetch(`${baseUrl}/jadwal-dokter?ruangan_id=101`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const jadwalJson = await jadwalRes.json();
    assert(jadwalRes.status === 200, 'Berhasil mengambil jadwal dokter (status 200)');
    assert(jadwalJson.data.length > 0, 'Ditemukan jadwal dokter di Poli Penyakit Dalam');
    const jadwalBudi = jadwalJson.data[0];
    assert(jadwalBudi.dokter.nama_lengkap.includes('Budi'), 'Jadwal dokter terhubung ke dr. Budi');
    assert(jadwalBudi.kuota_pasien > 0, 'Jadwal dokter memiliki kuota pasien');

    // -------------------------------------------------------------
    // TEST 19: Pendaftaran Rawat Jalan - Pasien Baru (Umum)
    // -------------------------------------------------------------
    console.log('\n--- TEST 19: Pendaftaran Rawat Jalan Pasien Baru (Umum) ---');
    const uniqueNik = `3201${Date.now().toString().slice(-12)}`;
    const regBaruRes = await fetch(`${baseUrl}/pendaftaran/rawat-jalan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tipe_pasien: 'BARU',
        pasien_baru: {
          nik: uniqueNik,
          nama_lengkap: 'Budi Darmawan',
          jenis_kelamin: 'L',
          tempat_lahir: 'Jakarta',
          tanggal_lahir: '1995-04-10',
          golongan_darah: 'A',
          agama: 'ISLAM',
          status_pernikahan: 'BELUM_MENIKAH',
          alamat_lengkap: 'Jl. Sudirman Kav 20, Jakarta',
          provinsi_id: 1,
          kabupaten_id: 1,
          kecamatan_id: 1,
          desa_id: 1,
          kode_pos: '10110',
          nama_penanggung_jawab: 'Darmawan',
          hubungan_penanggung_jawab: 'ORANG_TUA',
          telepon_penanggung_jawab: '081234567800',
        },
        jadwal_dokter_id: jadwalBudi.id,
        jenis_penjamin: 'UMUM',
        keluhan_utama: 'Demam tinggi sejak 3 hari yang lalu',
      }),
    });
    const regBaruJson = await regBaruRes.json();
    assert(regBaruRes.status === 201, 'Pendaftaran pasien baru berhasil status 201');
    assert(!!regBaruJson.data.no_registrasi, 'Menerima nomor registrasi rawat jalan');
    assert(!!regBaruJson.data.no_antrean, 'Menerima nomor antrean poliklinik');
    assert(regBaruJson.data.tipe_pasien === 'BARU', 'Tipe pasien tercatat BARU');
    assert(!!regBaruJson.data.pasien.no_rm, 'Pasien baru otomatis memperoleh No RM');
    assert(regBaruJson.data.status_antrean === 'MENUNGGU', 'Status awal antrean adalah MENUNGGU');
    assert(regBaruJson.data.jenis_pelayanan === 'RAWAT_JALAN', 'Jenis pelayanan tercatat RAWAT_JALAN pada tabel pendaftaran terpadu');

    const regId1 = regBaruJson.data.id;

    // -------------------------------------------------------------
    // TEST 20: Pendaftaran Rawat Jalan - Pasien Lama (BPJS)
    // -------------------------------------------------------------
    console.log('\n--- TEST 20: Pendaftaran Rawat Jalan Pasien Lama (BPJS) ---');
    const pasienListRes = await fetch(`${baseUrl}/pasien?search=Aminah`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const pasienListJson = await pasienListRes.json();
    assert(pasienListJson.rows.length > 0, 'Ditemukan pasien Siti Aminah');
    const siti = pasienListJson.rows[0];

    const regLamaRes = await fetch(`${baseUrl}/pendaftaran/rawat-jalan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tipe_pasien: 'LAMA',
        pasien_id: siti.id,
        jadwal_dokter_id: jadwalBudi.id,
        jenis_penjamin: 'BPJS',
        no_kartu_penjamin: '0001234567890',
        keluhan_utama: 'Kontrol rutin hipertensi',
      }),
    });
    const regLamaJson = await regLamaRes.json();
    assert(regLamaRes.status === 201, 'Pendaftaran pasien lama berhasil status 201');
    assert(regLamaJson.data.pasien.id === siti.id, 'Data pendaftaran terhubung ke pasien Siti Aminah');
    assert(regLamaJson.data.jenis_penjamin === 'BPJS', 'Jenis penjamin tercatat BPJS');
    assert(regLamaJson.data.angka_antrean > regBaruJson.data.angka_antrean, 'Nomor antrean bertambah secara sekuensial');

    // -------------------------------------------------------------
    // TEST 21: Update Status Antrean Rawat Jalan
    // -------------------------------------------------------------
    console.log('\n--- TEST 21: Update Status Antrean Rawat Jalan ---');
    const updateStatusRes = await fetch(`${baseUrl}/pendaftaran/rawat-jalan/${regId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status_antrean: 'DIPANGGIL',
        catatan: 'Pasien dipanggil menuju ruang pemeriksaan Poli Penyakit Dalam',
      }),
    });
    const updateStatusJson = await updateStatusRes.json();
    assert(updateStatusRes.status === 200, 'Berhasil update status antrean (status 200)');
    assert(updateStatusJson.data.status_antrean === 'DIPANGGIL', 'Status antrean berubah menjadi DIPANGGIL');

    // Test Generic /pendaftaran endpoint
    const genericRes = await fetch(`${baseUrl}/pendaftaran`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(genericRes.status === 200, 'GET /pendaftaran generic endpoint berhasil (status 200)');
    const genericJson = await genericRes.json();
    assert(genericJson.rows.length > 0, 'Daftar pendaftaran terpadu mengembalikan data');

    // -------------------------------------------------------------
    // TEST 22: Proteksi Validasi Duplikasi Kunjungan Pasien
    // -------------------------------------------------------------
    console.log('\n--- TEST 22: Proteksi Duplikasi Kunjungan Hari yang Sama ---');
    const duplicateRes = await fetch(`${baseUrl}/pendaftaran/rawat-jalan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tipe_pasien: 'LAMA',
        pasien_id: siti.id,
        jadwal_dokter_id: jadwalBudi.id,
        jenis_penjamin: 'BPJS',
      }),
    });
    assert(duplicateRes.status === 409, 'Pendaftaran duplikat ditolak dengan status 409 Conflict');

    // -------------------------------------------------------------
    // TEST 23: Direct 1-Step Login untuk Petugas Pendaftaran (Rekam Medis)
    // -------------------------------------------------------------
    console.log('\n--- TEST 23: Direct Login Petugas Pendaftaran (Instalasi Rekam Medis) ---');
    const pendaftaranLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'pendaftaran',
        password: 'pendaftaran123',
        instalasi_id: 8,
        ruangan_id: 801,
      }),
    });
    const pendaftaranJson = await pendaftaranLoginRes.json();
    assert(pendaftaranLoginRes.status === 200, 'Direct login petugas pendaftaran sukses');
    assert(pendaftaranJson.data.status === 'AUTHENTICATED', 'Status terautentikasi');
    assert(pendaftaranJson.data.active_context.instalasi.kode === 'IRM', 'Konteks instalasi adalah IRM (Instalasi Rekam Medis)');
    assert(pendaftaranJson.data.active_context.ruangan.kode === 'LOKET_PENDAFTARAN_1', 'Konteks ruangan adalah LOKET_PENDAFTARAN_1');
    assert(pendaftaranJson.data.active_context.role.kode === 'PENDAFTARAN', 'Peran aktif adalah PENDAFTARAN');

    const pendaftaranModuleCodes = pendaftaranJson.data.modules.map(m => m.kode_modul);
    assert(pendaftaranModuleCodes.includes('MODUL_PENDAFTARAN'), 'Petugas pendaftaran menerima MODUL_PENDAFTARAN');
    assert(!pendaftaranModuleCodes.includes('MODUL_RJ'), 'Petugas pendaftaran TIDAK memiliki akses ke Modul Rawat Jalan');
    assert(!pendaftaranModuleCodes.includes('MODUL_FARMASI'), 'Petugas pendaftaran TIDAK memiliki akses ke Modul Farmasi');
    assert(!pendaftaranModuleCodes.includes('MODUL_KASIR'), 'Petugas pendaftaran TIDAK memiliki akses ke Modul Kasir');

    const pendaftaranMenus = pendaftaranJson.data.menus.map(m => m.kode_menu);
    assert(pendaftaranMenus.includes('MODUL_PENDAFTARAN'), 'Petugas pendaftaran menerima pohon menu Pendaftaran & Admisi');

    // -------------------------------------------------------------
    // TEST 24: Proteksi Boundary (Petugas Pendaftaran coba akses endpoint Rawat Jalan & Kasir)
    // -------------------------------------------------------------
    console.log('\n--- TEST 24: Proteksi Keamanan Boundary Petugas Pendaftaran ---');
    const pendaftaranToken = pendaftaranJson.data.token;
    const forbiddenRJRes = await fetch(`${baseUrl}/pelayanan/rawat-jalan/antrean`, {
      headers: { 'Authorization': `Bearer ${pendaftaranToken}` },
    });
    assert(forbiddenRJRes.status === 403, 'Petugas pendaftaran ditolak (403) saat mencoba mengakses fitur Rawat Jalan Poliklinik');

    const forbiddenKasirRes = await fetch(`${baseUrl}/pelayanan/kasir/tagihan`, {
      headers: { 'Authorization': `Bearer ${pendaftaranToken}` },
    });
    assert(forbiddenKasirRes.status === 403, 'Petugas pendaftaran ditolak (403) saat mencoba mengakses fitur Kasir Tagihan');

    // -------------------------------------------------------------
    // TEST 25: Master Pasien CRUD & Search Dedicated Endpoints (/api/pasien)
    // -------------------------------------------------------------
    console.log('\n--- TEST 25: Master Pasien Dedicated Endpoints (/api/pasien) ---');
    const dedicatedNik = `3171${Date.now().toString().slice(-12)}`;

    // 1. Create Pasien
    const createPasienRes = await fetch(`${baseUrl}/pasien`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nik: dedicatedNik,
        nama_lengkap: 'Ahmad Fauzi Dedicated',
        jenis_kelamin: 'L',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1990-08-17',
        golongan_darah: 'O',
        alamat_lengkap: 'Jl. Merdeka No. 45',
        no_telepon: '081234567890',
        jenis_penjamin_default: 'UMUM',
      }),
    });
    const createPasienJson = await createPasienRes.json();
    assert(createPasienRes.status === 201, 'POST /api/pasien berhasil membuat pasien baru (status 201)');
    assert(!!createPasienJson.data.id && typeof createPasienJson.data.id === 'number', 'Pasien baru memiliki ID Auto-Increment (Integer)');
    assert(createPasienJson.data.no_rm.startsWith('RM-'), 'Nomor RM otomatis digenerate');
    const dedicatedPasienId = createPasienJson.data.id;
    const dedicatedNoRM = createPasienJson.data.no_rm;

    // 2. Get Pasien By ID
    const getByIdRes = await fetch(`${baseUrl}/pasien/${dedicatedPasienId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const getByIdJson = await getByIdRes.json();
    assert(getByIdRes.status === 200, 'GET /api/pasien/:id berhasil (status 200)');
    assert(getByIdJson.data.nama_lengkap === 'Ahmad Fauzi Dedicated', 'Data nama pasien sesuai');

    // 3. Get Pasien By No RM
    const getByNoRMRes = await fetch(`${baseUrl}/pasien/no-rm/${dedicatedNoRM}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const getByNoRMJson = await getByNoRMRes.json();
    assert(getByNoRMRes.status === 200, 'GET /api/pasien/no-rm/:no_rm berhasil (status 200)');
    assert(getByNoRMJson.data.id === dedicatedPasienId, 'Data pasien berdasarkan No RM cocok');

    // 4. Get Pasien By NIK
    const getByNikRes = await fetch(`${baseUrl}/pasien/nik/${dedicatedNik}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const getByNikJson = await getByNikRes.json();
    assert(getByNikRes.status === 200, 'GET /api/pasien/nik/:nik berhasil (status 200)');
    assert(getByNikJson.data.id === dedicatedPasienId, 'Data pasien berdasarkan NIK cocok');

    // 5. Update Pasien
    const updatePasienRes = await fetch(`${baseUrl}/pasien/${dedicatedPasienId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        no_telepon: '089999999999',
      }),
    });
    const updatePasienJson = await updatePasienRes.json();
    assert(updatePasienRes.status === 200, 'PUT /api/pasien/:id berhasil memperbarui data (status 200)');
    assert(updatePasienJson.data.no_telepon === '089999999999', 'Nomor telepon berhasil diperbarui');

    // 6. Delete Pasien (Soft Delete)
    const deletePasienRes = await fetch(`${baseUrl}/pasien/${dedicatedPasienId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(deletePasienRes.status === 200, 'DELETE /api/pasien/:id berhasil (status 200)');

    // 7. Verify Soft Deleted Pasien is 404
    const getDeletedRes = await fetch(`${baseUrl}/pasien/${dedicatedPasienId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(getDeletedRes.status === 404, 'GET /api/pasien/:id yang telah dihapus menghasilkan 404 Not Found');

    // Permanent Cleanup Pasien
    const { Pasien: PasienCleanup } = require('../models');
    await PasienCleanup.destroy({ where: { id: dedicatedPasienId }, force: true });

    // -------------------------------------------------------------
    // TEST 26: Master Jadwal Dokter CRUD & Proteksi Admin (/api/jadwal-dokter)
    // -------------------------------------------------------------
    console.log('\n--- TEST 26: Master Jadwal Dokter Dedicated Endpoints (/api/jadwal-dokter) ---');
    // Non-Admin (Petugas Pendaftaran) coba tambah jadwal dokter -> 403
    const forbiddenJadwalRes = await fetch(`${baseUrl}/jadwal-dokter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pendaftaranToken}`,
      },
      body: JSON.stringify({
        dokter_id: jadwalBudi.dokter_id,
        ruangan_id: 101,
        hari: 'MINGGU',
        jam_mulai: '08:00',
        jam_selesai: '12:00',
        kuota_pasien: 15,
      }),
    });
    assert(forbiddenJadwalRes.status === 403, 'Petugas non-admin ditolak (403) saat menambah jadwal dokter');

    // Admin tambah jadwal dokter -> 201
    const createJadwalRes = await fetch(`${baseUrl}/jadwal-dokter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        dokter_id: jadwalBudi.dokter_id,
        ruangan_id: 101,
        hari: 'MINGGU',
        jam_mulai: '08:00',
        jam_selesai: '12:00',
        kuota_pasien: 15,
      }),
    });
    const createJadwalJson = await createJadwalRes.json();
    assert(createJadwalRes.status === 201, 'Admin berhasil menambahkan jadwal dokter baru (status 201)');
    assert(createJadwalJson.data.hari === 'MINGGU', 'Hari jadwal dokter tercatat MINGGU');
    const newJadwalId = createJadwalJson.data.id;

    // Get Jadwal Dokter by ID -> 200
    const getJadwalRes = await fetch(`${baseUrl}/jadwal-dokter/${newJadwalId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const getJadwalJson = await getJadwalRes.json();
    assert(getJadwalRes.status === 200, 'GET /api/jadwal-dokter/:id berhasil (status 200)');
    assert(getJadwalJson.data.kuota_pasien === 15, 'Kuota pasien jadwal baru sesuai');

    // Update Jadwal Dokter -> 200
    const updateJadwalRes = await fetch(`${baseUrl}/jadwal-dokter/${newJadwalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kuota_pasien: 20,
      }),
    });
    const updateJadwalJson = await updateJadwalRes.json();
    assert(updateJadwalRes.status === 200, 'PUT /api/jadwal-dokter/:id berhasil (status 200)');
    assert(updateJadwalJson.data.kuota_pasien === 20, 'Kuota pasien berhasil diperbarui menjadi 20');

    // Delete Jadwal Dokter -> 200
    const deleteJadwalRes = await fetch(`${baseUrl}/jadwal-dokter/${newJadwalId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(deleteJadwalRes.status === 200, 'DELETE /api/jadwal-dokter/:id berhasil (status 200)');

    // Verify deleted schedule -> 404
    const getDeletedJadwalRes = await fetch(`${baseUrl}/jadwal-dokter/${newJadwalId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(getDeletedJadwalRes.status === 404, 'GET /api/jadwal-dokter/:id yang dihapus menghasilkan 404');

    // -------------------------------------------------------------
    // TEST 27: Master Instalasi, Ruangan, dan Role Dedicated Endpoints
    // -------------------------------------------------------------
    console.log('\n--- TEST 27: Master Instalasi, Ruangan & Role Dedicated Endpoints ---');
    const uniqueSuffix = Date.now().toString().slice(-6);

    // 1. INSTALASI
    const newInstalasiRes = await fetch(`${baseUrl}/instalasi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kode_instalasi: `INS_${uniqueSuffix}`,
        nama_instalasi: 'Instalasi Uji Coba Dedicated',
      }),
    });
    const newInstalasiJson = await newInstalasiRes.json();
    assert(newInstalasiRes.status === 201, 'POST /api/instalasi berhasil status 201');
    const createdInstalasiId = newInstalasiJson.data.id;

    const getInstalasiRes = await fetch(`${baseUrl}/instalasi/${createdInstalasiId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(getInstalasiRes.status === 200, 'GET /api/instalasi/:id berhasil status 200');

    // 2. RUANGAN
    const newRuanganRes = await fetch(`${baseUrl}/ruangan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        instalasi_id: createdInstalasiId,
        kode_ruangan: `RNG_${uniqueSuffix}`,
        nama_ruangan: 'Ruangan Uji Coba Dedicated',
      }),
    });
    const newRuanganJson = await newRuanganRes.json();
    assert(newRuanganRes.status === 201, 'POST /api/ruangan berhasil status 201');
    const createdRuanganId = newRuanganJson.data.id;

    const getRuanganRes = await fetch(`${baseUrl}/ruangan/${createdRuanganId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(getRuanganRes.status === 200, 'GET /api/ruangan/:id berhasil status 200');

    // 3. ROLE
    const newRoleRes = await fetch(`${baseUrl}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kode_role: `ROLE_${uniqueSuffix}`,
        nama_role: 'Role Uji Coba Dedicated',
      }),
    });
    const newRoleJson = await newRoleRes.json();
    assert(newRoleRes.status === 201, 'POST /api/roles berhasil status 201');
    const createdRoleId = newRoleJson.data.id;

    const getRoleRes = await fetch(`${baseUrl}/roles/${createdRoleId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(getRoleRes.status === 200, 'GET /api/roles/:id berhasil status 200');

    // Cleanup dedicated test entries
    const { Instalasi: MInstalasi, Ruangan: MRuangan, Role: MRole } = require('../models');
    await MRuangan.destroy({ where: { id: createdRuanganId }, force: true });
    await MInstalasi.destroy({ where: { id: createdInstalasiId }, force: true });
    await MRole.destroy({ where: { id: createdRoleId }, force: true });

    // Cleanup data uji coba pendaftaran agar tes dapat dijalankan berulang secara idempotent
    const { Pendaftaran: PRJ, Pasien: PasienModel } = require('../models');
    await PRJ.destroy({ where: { id: [regId1, regLamaJson.data ? regLamaJson.data.id : null] }, force: true });
    if (regBaruJson.data && regBaruJson.data.pasien) {
      await PasienModel.destroy({ where: { id: regBaruJson.data.pasien.id }, force: true });
    }

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
