const sequelize = require('../config/database');

async function migrate() {
  console.log('--- Migrasi Primary Key & Foreign Key Tahap 2: namatable_id ---');

  // 1. Drop FK pendaftaran -> jadwal_dokter
  try {
    await sequelize.query('ALTER TABLE pendaftaran DROP CONSTRAINT IF EXISTS pendaftaran_jadwal_dokter_id_fkey;');
  } catch (err) {
    console.log('Drop constraint note:', err.message);
  }

  const renames = [
    { table: 'jadwal_dokter', oldCol: 'jadwal_dokter_id', newCol: 'jadwaldokter_id' },
    { table: 'pendaftaran', oldCol: 'jadwal_dokter_id', newCol: 'jadwaldokter_id' },
    { table: 'kode_pos', oldCol: 'kode_pos_id', newCol: 'kodepos_id' },
    { table: 'menu_instalasi', oldCol: 'menu_instalasi_id', newCol: 'menuinstalasi_id' },
    { table: 'modul_instalasi', oldCol: 'modul_instalasi_id', newCol: 'modulinstalasi_id' },
    { table: 'modul_ruangan', oldCol: 'modul_ruangan_id', newCol: 'modulruangan_id' },
    { table: 'role_menus', oldCol: 'role_menu_id', newCol: 'rolemenu_id' },
    { table: 'role_permissions', oldCol: 'role_permission_id', newCol: 'rolepermission_id' },
    { table: 'user_ruangan_modul', oldCol: 'user_ruangan_modul_id', newCol: 'userruanganmodul_id' },
    { table: 'user_ruangan_roles', oldCol: 'user_ruangan_role_id', newCol: 'userruanganrole_id' },
  ];

  for (const r of renames) {
    try {
      await sequelize.query(`ALTER TABLE ${r.table} RENAME COLUMN ${r.oldCol} TO ${r.newCol};`);
      console.log(`✓ ${r.table}: ${r.oldCol} -> ${r.newCol}`);
    } catch (err) {
      console.log(`- ${r.table} rename skip/err: ${err.message}`);
    }
  }

  // Re-add FK constraint pendaftaran -> jadwal_dokter
  try {
    await sequelize.query(`
      ALTER TABLE pendaftaran
      ADD CONSTRAINT pendaftaran_jadwaldokter_id_fkey
      FOREIGN KEY (jadwaldokter_id) REFERENCES jadwal_dokter(jadwaldokter_id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    `);
    console.log('✓ Added FK constraint pendaftaran.jadwaldokter_id -> jadwal_dokter.jadwaldokter_id');
  } catch (err) {
    console.log('Add FK note:', err.message);
  }

  console.log('--- Migrasi Tahap 2 Selesai ---');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
