const sequelize = require('../config/database');

const tablePkMap = {
  desa_kelurahan: 'desa_id',
  instalasi: 'instalasi_id',
  jadwal_dokter: 'jadwal_dokter_id',
  kabupaten_kota: 'kabupaten_id',
  kecamatan: 'kecamatan_id',
  kode_pos: 'kode_pos_id',
  menu_instalasi: 'menu_instalasi_id',
  menus: 'menu_id',
  modul: 'modul_id',
  modul_instalasi: 'modul_instalasi_id',
  modul_ruangan: 'modul_ruangan_id',
  pasien: 'pasien_id',
  pendaftaran: 'pendaftaran_id',
  permissions: 'permission_id',
  provinsi: 'provinsi_id',
  role_menus: 'role_menu_id',
  role_permissions: 'role_permission_id',
  roles: 'role_id',
  ruangan: 'ruangan_id',
  user_ruangan_modul: 'user_ruangan_modul_id',
  user_ruangan_roles: 'user_ruangan_role_id',
  users: 'user_id'
};

const foreignKeys = [
  { table: 'desa_kelurahan', col: 'kecamatan_id', refTable: 'kecamatan', refCol: 'kecamatan_id', name: 'desa_kelurahan_kecamatan_id_fkey', onDelete: 'CASCADE' },
  { table: 'jadwal_dokter', col: 'dokter_id', refTable: 'users', refCol: 'user_id', name: 'jadwal_dokter_dokter_id_fkey', onDelete: 'RESTRICT' },
  { table: 'jadwal_dokter', col: 'ruangan_id', refTable: 'ruangan', refCol: 'ruangan_id', name: 'jadwal_dokter_ruangan_id_fkey', onDelete: 'RESTRICT' },
  { table: 'kabupaten_kota', col: 'provinsi_id', refTable: 'provinsi', refCol: 'provinsi_id', name: 'kabupaten_kota_provinsi_id_fkey', onDelete: 'CASCADE' },
  { table: 'kecamatan', col: 'kabupaten_id', refTable: 'kabupaten_kota', refCol: 'kabupaten_id', name: 'kecamatan_kabupaten_id_fkey', onDelete: 'CASCADE' },
  { table: 'kode_pos', col: 'desa_id', refTable: 'desa_kelurahan', refCol: 'desa_id', name: 'kode_pos_desa_id_fkey', onDelete: 'CASCADE' },
  { table: 'kode_pos', col: 'kabupaten_id', refTable: 'kabupaten_kota', refCol: 'kabupaten_id', name: 'kode_pos_kabupaten_id_fkey', onDelete: 'CASCADE' },
  { table: 'kode_pos', col: 'kecamatan_id', refTable: 'kecamatan', refCol: 'kecamatan_id', name: 'kode_pos_kecamatan_id_fkey', onDelete: 'CASCADE' },
  { table: 'kode_pos', col: 'provinsi_id', refTable: 'provinsi', refCol: 'provinsi_id', name: 'kode_pos_provinsi_id_fkey', onDelete: 'CASCADE' },
  { table: 'menu_instalasi', col: 'instalasi_id', refTable: 'instalasi', refCol: 'instalasi_id', name: 'menu_instalasi_instalasi_id_fkey', onDelete: 'CASCADE' },
  { table: 'menu_instalasi', col: 'menu_id', refTable: 'menus', refCol: 'menu_id', name: 'menu_instalasi_menu_id_fkey', onDelete: 'CASCADE' },
  { table: 'menus', col: 'modul_id', refTable: 'modul', refCol: 'modul_id', name: 'menus_modul_id_fkey', onDelete: 'CASCADE' },
  { table: 'menus', col: 'parent_id', refTable: 'menus', refCol: 'menu_id', name: 'menus_parent_id_fkey', onDelete: 'SET NULL' },
  { table: 'modul_instalasi', col: 'instalasi_id', refTable: 'instalasi', refCol: 'instalasi_id', name: 'modul_instalasi_instalasi_id_fkey', onDelete: 'CASCADE' },
  { table: 'modul_instalasi', col: 'modul_id', refTable: 'modul', refCol: 'modul_id', name: 'modul_instalasi_modul_id_fkey', onDelete: 'CASCADE' },
  { table: 'modul_ruangan', col: 'modul_id', refTable: 'modul', refCol: 'modul_id', name: 'modul_ruangan_modul_id_fkey', onDelete: 'CASCADE' },
  { table: 'modul_ruangan', col: 'ruangan_id', refTable: 'ruangan', refCol: 'ruangan_id', name: 'modul_ruangan_ruangan_id_fkey', onDelete: 'CASCADE' },
  { table: 'pasien', col: 'desa_id', refTable: 'desa_kelurahan', refCol: 'desa_id', name: 'pasien_desa_id_fkey', onDelete: 'SET NULL' },
  { table: 'pasien', col: 'kabupaten_id', refTable: 'kabupaten_kota', refCol: 'kabupaten_id', name: 'pasien_kabupaten_id_fkey', onDelete: 'SET NULL' },
  { table: 'pasien', col: 'kecamatan_id', refTable: 'kecamatan', refCol: 'kecamatan_id', name: 'pasien_kecamatan_id_fkey', onDelete: 'SET NULL' },
  { table: 'pasien', col: 'provinsi_id', refTable: 'provinsi', refCol: 'provinsi_id', name: 'pasien_provinsi_id_fkey', onDelete: 'SET NULL' },
  { table: 'pendaftaran', col: 'created_by', refTable: 'users', refCol: 'user_id', name: 'pendaftaran_created_by_fkey', onDelete: 'SET NULL' },
  { table: 'pendaftaran', col: 'dokter_id', refTable: 'users', refCol: 'user_id', name: 'pendaftaran_dokter_id_fkey', onDelete: 'RESTRICT' },
  { table: 'pendaftaran', col: 'jadwal_dokter_id', refTable: 'jadwal_dokter', refCol: 'jadwal_dokter_id', name: 'pendaftaran_jadwal_dokter_id_fkey', onDelete: 'RESTRICT' },
  { table: 'pendaftaran', col: 'pasien_id', refTable: 'pasien', refCol: 'pasien_id', name: 'pendaftaran_pasien_id_fkey', onDelete: 'RESTRICT' },
  { table: 'pendaftaran', col: 'pendaftaran_asal_id', refTable: 'pendaftaran', refCol: 'pendaftaran_id', name: 'pendaftaran_pendaftaran_asal_id_fkey', onDelete: 'SET NULL' },
  { table: 'pendaftaran', col: 'ruangan_id', refTable: 'ruangan', refCol: 'ruangan_id', name: 'pendaftaran_ruangan_id_fkey', onDelete: 'RESTRICT' },
  { table: 'permissions', col: 'menu_id', refTable: 'menus', refCol: 'menu_id', name: 'permissions_menu_id_fkey', onDelete: 'CASCADE' },
  { table: 'role_menus', col: 'menu_id', refTable: 'menus', refCol: 'menu_id', name: 'role_menus_menu_id_fkey', onDelete: 'CASCADE' },
  { table: 'role_menus', col: 'role_id', refTable: 'roles', refCol: 'role_id', name: 'role_menus_role_id_fkey', onDelete: 'CASCADE' },
  { table: 'role_permissions', col: 'permission_id', refTable: 'permissions', refCol: 'permission_id', name: 'role_permissions_permission_id_fkey', onDelete: 'CASCADE' },
  { table: 'role_permissions', col: 'role_id', refTable: 'roles', refCol: 'role_id', name: 'role_permissions_role_id_fkey', onDelete: 'CASCADE' },
  { table: 'ruangan', col: 'instalasi_id', refTable: 'instalasi', refCol: 'instalasi_id', name: 'ruangan_instalasi_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_modul', col: 'modul_id', refTable: 'modul', refCol: 'modul_id', name: 'user_ruangan_modul_modul_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_modul', col: 'ruangan_id', refTable: 'ruangan', refCol: 'ruangan_id', name: 'user_ruangan_modul_ruangan_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_modul', col: 'user_id', refTable: 'users', refCol: 'user_id', name: 'user_ruangan_modul_user_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_roles', col: 'role_id', refTable: 'roles', refCol: 'role_id', name: 'user_ruangan_roles_role_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_roles', col: 'ruangan_id', refTable: 'ruangan', refCol: 'ruangan_id', name: 'user_ruangan_roles_ruangan_id_fkey', onDelete: 'CASCADE' },
  { table: 'user_ruangan_roles', col: 'user_id', refTable: 'users', refCol: 'user_id', name: 'user_ruangan_roles_user_id_fkey', onDelete: 'CASCADE' }
];

async function migrate() {
  console.log('--- Starting Migration of Primary Keys ---');

  // 1. Drop all existing foreign key constraints
  console.log('1. Dropping existing foreign key constraints...');
  for (const fk of foreignKeys) {
    try {
      await sequelize.query(`ALTER TABLE "${fk.table}" DROP CONSTRAINT IF EXISTS "${fk.name}" CASCADE;`);
      console.log(`  ✓ Dropped constraint ${fk.name} on ${fk.table}`);
    } catch (e) {
      console.warn(`  ! Could not drop constraint ${fk.name}: ${e.message}`);
    }
  }

  // 2. Rename column 'id' to new PK in each table
  console.log('2. Renaming primary key columns...');
  for (const [table, newPk] of Object.entries(tablePkMap)) {
    try {
      const [cols] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'id';
      `);
      if (cols.length > 0) {
        await sequelize.query(`ALTER TABLE "${table}" RENAME COLUMN "id" TO "${newPk}";`);
        console.log(`  ✓ Renamed ${table}.id -> ${table}.${newPk}`);
      } else {
        console.log(`  - ${table}.id already renamed or does not exist`);
      }
    } catch (e) {
      console.error(`  ✗ Error renaming ${table}.id: ${e.message}`);
      throw e;
    }
  }

  // 3. Re-add foreign key constraints pointing to new PK columns
  console.log('3. Recreating foreign key constraints...');
  for (const fk of foreignKeys) {
    try {
      await sequelize.query(`
        ALTER TABLE "${fk.table}" 
        ADD CONSTRAINT "${fk.name}" 
        FOREIGN KEY ("${fk.col}") 
        REFERENCES "${fk.refTable}" ("${fk.refCol}") 
        ON UPDATE CASCADE ON DELETE ${fk.onDelete};
      `);
      console.log(`  ✓ Added constraint ${fk.name}: ${fk.table}(${fk.col}) -> ${fk.refTable}(${fk.refCol})`);
    } catch (e) {
      console.error(`  ✗ Error adding constraint ${fk.name}: ${e.message}`);
      throw e;
    }
  }

  console.log('--- Migration of Primary Keys Completed Successfully! ---');
  await sequelize.close();
}

migrate().catch(async (err) => {
  console.error('Migration failed:', err);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
