/**
 * Controller contoh fitur pelayanan SIMRS yang dilindungi konteks Instalasi & Ruangan
 */
class PelayananController {
  /**
   * Mengambil antrean pasien untuk Poliklinik Rawat Jalan aktif
   */
  async getAntreanPoli(req, res, next) {
    try {
      const { ruanganId, ruanganCode, username } = req.user;

      // Simulasi data antrean berdasarkan ruangan aktif
      const antrean = [
        {
          no_antrean: `${ruanganCode}-001`,
          no_rm: 'RM-2026-0041',
          nama_pasien: 'Tn. Ahmad Fauzi',
          jaminan: 'BPJS Kesehatan',
          status: 'MENUNGGU',
          waktu_daftar: '08:15:00',
        },
        {
          no_antrean: `${ruanganCode}-002`,
          no_rm: 'RM-2026-0089',
          nama_pasien: 'Ny. Siti Aminah',
          jaminan: 'UMUM / PRIBADI',
          status: 'DIPERIKSA',
          waktu_daftar: '08:30:00',
        },
      ];

      return res.status(200).json({
        success: true,
        message: `Data antrean untuk ruangan ${ruanganCode}`,
        meta: {
          ruangan_id: ruanganId,
          ruangan_code: ruanganCode,
          dokter_pemeriksa: username,
          total_pasien: antrean.length,
        },
        data: antrean,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil sensus pasien rawat inap pada Bangsal aktif
   */
  async getSensusRawatInap(req, res, next) {
    try {
      const { ruanganId, ruanganCode } = req.user;

      const sensus = [
        {
          no_bed: `${ruanganCode}-B01`,
          no_rm: 'RM-2026-0012',
          nama_pasien: 'Ny. Ratna Dewi',
          diagnosa_masuk: 'Demam Tifoid',
          dpjp: 'dr. Budi Santoso, Sp.PD',
          hari_rawat_ke: 3,
        },
        {
          no_bed: `${ruanganCode}-B02`,
          no_rm: 'RM-2026-0055',
          nama_pasien: 'Tn. Hendra Wijaya',
          diagnosa_masuk: 'Dispepsia Akut',
          dpjp: 'dr. Budi Santoso, Sp.PD',
          hari_rawat_ke: 1,
        },
      ];

      return res.status(200).json({
        success: true,
        message: `Sensus pasien rawat inap ruangan ${ruanganCode}`,
        meta: {
          ruangan_id: ruanganId,
          ruangan_code: ruanganCode,
          kapasitas_terisi: sensus.length,
        },
        data: sensus,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil antrean resep masuk di Depo Farmasi aktif
   */
  async getAntreanResep(req, res, next) {
    try {
      const { ruanganId, ruanganCode } = req.user;

      const resepList = [
        {
          no_resep: 'RSP-20260917-001',
          asal_ruangan: 'Poli Penyakit Dalam',
          nama_pasien: 'Tn. Ahmad Fauzi',
          dokter_penulis: 'dr. Budi Santoso, Sp.PD',
          status_resep: 'MENUNGGU_TELAAH',
          jumlah_r: 3,
        },
      ];

      return res.status(200).json({
        success: true,
        message: `Daftar resep masuk di ${ruanganCode}`,
        meta: {
          ruangan_id: ruanganId,
          ruangan_code: ruanganCode,
        },
        data: resepList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil tagihan pasien di Loket Kasir aktif
   */
  async getTagihanKasir(req, res, next) {
    try {
      const { ruanganId, ruanganCode, username } = req.user;

      const tagihanList = [
        {
          no_billing: 'BIL-2026-00912',
          no_rm: 'RM-2026-0089',
          nama_pasien: 'Ny. Siti Aminah',
          total_tagihan: 350000,
          status_pembayaran: 'BELUM_LUNAS',
        },
      ];

      return res.status(200).json({
        success: true,
        message: `Daftar tagihan di loket ${ruanganCode}`,
        meta: {
          kasir: username,
          ruangan_id: ruanganId,
          ruangan_code: ruanganCode,
        },
        data: tagihanList,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PelayananController();
