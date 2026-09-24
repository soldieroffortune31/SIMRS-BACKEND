const {
  sequelize,
  User,
  Ruangan,
  JadwalDokter,
  Pasien,
  PendaftaranRawatJalan,
} = require('../models');

async function seedPendaftaran(transaction = null, closeConnection = false) {
  const localTx = !transaction;
  const t = transaction || (await sequelize.transaction());

  try {
    console.log('--- Seeding Data Pendaftaran Rawat Jalan & Jadwal Dokter ---');

    // 1. Dapatkan akun dokter (dr.budi)
    const dokterBudi = await User.findOne({ where: { username: 'dr.budi' }, transaction: t });
    const poliDalam = await Ruangan.findByPk(101, { transaction: t });

    if (dokterBudi && poliDalam) {
      console.log('1. Menambahkan Jadwal Praktik Dokter dr. Budi di Poli Dalam...');
      const hariList = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      
      for (let i = 0; i < hariList.length; i++) {
        const h = hariList[i];
        await JadwalDokter.upsert({
          id: i + 1,
          dokter_id: dokterBudi.id,
          ruangan_id: poliDalam.id,
          hari: h,
          jam_mulai: '08:00',
          jam_selesai: '12:00',
          kuota_pasien: 30,
          keterangan: `Praktik Poliklinik Penyakit Dalam - ${h}`,
          is_active: true,
        }, { transaction: t });
      }
    }

    // 2. Data Pasien Demo
    console.log('2. Menambahkan Master Pasien Demo...');
    const pasien1 = await Pasien.findOne({ where: { no_rm: 'RM-000001' }, transaction: t });
    if (!pasien1) {
      await Pasien.create({
        no_rm: 'RM-000001',
        nik: '3201011205900001',
        nama_lengkap: 'Ahmad Fauzi',
        jenis_kelamin: 'L',
        tempat_lahir: 'Bogor',
        tanggal_lahir: '1990-05-12',
        golongan_darah: 'O',
        agama: 'ISLAM',
        status_pernikahan: 'MENIKAH',
        pendidikan: 'S1',
        pekerjaan: 'Karyawan Swasta',
        no_telepon: '081234567890',
        email: 'ahmad.fauzi@example.com',
        alamat_lengkap: 'Jl. Raya Bogor No. 12, RT 02/04',
        rt: '02',
        rw: '04',
        provinsi_id: 2, // Jawa Barat
        kabupaten_id: 3, // Kab Bogor
        kecamatan_id: 3, // Cibinong
        desa_id: 3, // Pabuaran
        kode_pos: '16916',
        nama_penanggung_jawab: 'Dewi Lestari',
        hubungan_penanggung_jawab: 'ISTRI',
        telepon_penanggung_jawab: '081298765432',
        jenis_penjamin_default: 'UMUM',
        is_active: true,
      }, { transaction: t });
    }

    const pasien2 = await Pasien.findOne({ where: { no_rm: 'RM-000002' }, transaction: t });
    if (!pasien2) {
      await Pasien.create({
        no_rm: 'RM-000002',
        nik: '3404074508850002',
        nama_lengkap: 'Siti Aminah',
        jenis_kelamin: 'P',
        tempat_lahir: 'Sleman',
        tanggal_lahir: '1985-08-25',
        golongan_darah: 'B',
        agama: 'ISLAM',
        status_pernikahan: 'MENIKAH',
        pendidikan: 'SMA',
        pekerjaan: 'Ibu Rumah Tangga',
        no_telepon: '081398765432',
        email: 'siti.aminah@example.com',
        alamat_lengkap: 'Jl. Kaliurang KM 5, Caturtunggal, Depok, Sleman',
        rt: '01',
        rw: '02',
        provinsi_id: 4, // DI Yogyakarta
        kabupaten_id: 5, // Kab Sleman
        kecamatan_id: 5, // Kec Depok
        desa_id: 5, // Desa Caturtunggal
        kode_pos: '55281',
        nama_penanggung_jawab: 'Bambang Irawan',
        hubungan_penanggung_jawab: 'SUAMI',
        telepon_penanggung_jawab: '081311223344',
        jenis_penjamin_default: 'BPJS',
        no_kartu_penjamin_default: '0001234567890',
        is_active: true,
      }, { transaction: t });
    }

    if (localTx) {
      await t.commit();
      try {
        await sequelize.query("SELECT setval('jadwal_dokter_id_seq', COALESCE((SELECT MAX(id) FROM jadwal_dokter), 1));");
        await sequelize.query("SELECT setval('pendaftaran_rawat_jalan_id_seq', COALESCE((SELECT MAX(id) FROM pendaftaran_rawat_jalan), 1));");
      } catch (_) {}
      console.log('✓ Seeding Jadwal Dokter & Pasien selesai!');
    }
  } catch (error) {
    if (localTx) await t.rollback();
    console.error('✗ Gagal seeding pendaftaran:', error.message);
    if (closeConnection) process.exit(1);
    throw error;
  } finally {
    if (localTx && closeConnection) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  seedPendaftaran(null, true);
}

module.exports = seedPendaftaran;
