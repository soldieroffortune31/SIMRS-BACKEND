4. Penjelasan: Cara Generate Table Database saat Pindah PC atau Deploy ke Server
Aplikasi backend SIMRS ini sudah menggunakan sistem Zero-Manual Database Setup melalui skrip 

auto-bootstrap.js
.

Bagaimana Cara Kerjanya di Balik Layar?
Saat perintah dijalankan:

Pengecekan Database: Script terhubung ke PostgreSQL menggunakan kredensial di file .env. Jika database simrs_db belum ada di PostgreSQL, script akan menjalankan perintah SQL CREATE DATABASE "simrs_db" secara otomatis.
Sinkronisasi Tabel (sequelize.sync({ alter: true })): Sequelize membaca seluruh file model di direktori models/ dan secara otomatis membuat tabel-tabel PostgreSQL, kolom tipe data, primary key, foreign key cascade, index, serta kolom created_at, updated_at, dan deleted_at tanpa perlu menulis script SQL CREATE TABLE manual.
Auto-Seeding: Jika tabel User masih kosong (pertama kali dipasang), script langsung menjalankan 

initial_seeder.js
 untuk mengisi roles, akun admin, dokter, perawat, apoteker, kasir, modul, menu, serta master wilayah & kodepos.
💻 Skenario A: Saat Pindah ke PC / Laptop Lain
Jika Anda meng-clone project ini ke laptop atau PC baru:

Install dependencies:

bash
npm install
Buat file .env: Salin dari template:

bash
cp .env.example .env
Buka file .env, lalu pastikan DB_USER dan DB_PASSWORD sesuai dengan akun PostgreSQL di PC baru tersebut (biasanya user: postgres, password: password lokal Anda).

Jalankan Perintah Setup (Database & Tabel Otomatis Dibuat):

bash
npm run setup
Atau langsung jalankan server development:

bash
npm run dev
Database dan seluruh tabel langsung otomatis terbuat dan siap pakai.

🚀 Skenario B: Saat Deploy ke Server Production (VPS / Cloud)
Clone repository dan install dependencies produksi:

bash
git clone <repo-url> simrs-backend
cd simrs-backend
npm ci --omit=dev
Konfigurasi Environment Variable (.env):

bash
cp .env.example .env
nano .env
Sesuaikan:

NODE_ENV=production
DB_HOST=127.0.0.1 (atau host database managed/RDS)
DB_PORT=5432
DB_USER=... & DB_PASSWORD=...
JWT_SECRET=... (gunakan string acak yang kuat)
Inisialisasi Database Sekali Saja:

bash
npm run setup
Jalankan Aplikasi dengan Process Manager (PM2):

bash
pm2 start server.js --name "simrs-backend"
pm2 save
pm2 startup
5. Hasil Verifikasi Pengujian
Seluruh 17 test suite (59 assertion checks) pada 

api_verification.js
 telah diuji dan berhasil 100% tanpa error:

bash
📊 HASIL PENGUJIAN API: 59 BERHASIL, 0 GAGAL
