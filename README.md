# SIMRS Backend - Sistem Informasi Manajemen Rumah Sakit

Backend API untuk Sistem Informasi Manajemen Rumah Sakit (SIMRS) berbasis **Node.js (Express)**, **Sequelize ORM**, dan **PostgreSQL (`pg`)**.

Sistem ini dirancang khusus untuk alur operasional rumah sakit di mana hak akses pengguna dan menu fitur yang tampil di dashboard disaring secara dinamis berdasarkan kombinasi **Role**, **Instalasi** (misal: Rawat Jalan, Rawat Inap, Farmasi, Kasir, IGD), dan **Ruangan** (misal: Poli Penyakit Dalam, Bangsal Mawar, Depo Farmasi, Loket Kasir).

---

## 🏛️ Arsitektur Tiga Lapis (Controller - Service - Model)

Aplikasi ini menerapkan pemisahan tugas (*Separation of Concerns*) dengan menempatkan seluruh *business logic* pada **Service Layer**:

```
Client (Front-end)
      │
      ▼
Routes Layer (routes/)
      │ (Auth Middleware, Context Guard, Joi Validation)
      ▼
Controllers Layer (controllers/) ──> Hanya menangani HTTP Req/Res & Status Codes
      │
      ▼
Services Layer (services/)       ──> Pusat Seluruh Logika Bisnis:
      │                              - auth.service.js: Login, JWT, validasi context
      │                              - menu.service.js: Filter dinamis & perakitan pohon menu
      │                              - user.service.js: Assignment user-ruangan-role
      │                              - master.service.js: Instalasi, Ruangan, Roles
      ▼
Models Layer (models/)           ──> Definisi entitas Sequelize ORM & Relasi
      │
      ▼
PostgreSQL Database (simrs_db)
```

---

## 🏥 Konsep Alur Kerja Autentikasi & Konteks Ruangan SIMRS

Dalam SIMRS, satu tenaga medis (misal: Dokter Spesialis) dapat bertugas di beberapa instalasi/ruangan pada hari yang sama (misal pagi di Poli Rawat Jalan, sore di Bangsal Rawat Inap). Sistem ini menyediakan 2 mekanisme login:

### 1. Two-Step Login (Direkomendasikan untuk Multi-Unit Staff)
1. **Langkah 1**: Pengguna mengirimkan `{ username, password }` ke `POST /api/auth/login`.
2. **Respon**: Sistem memvalidasi kredensial dan mengembalikan `status: "REQUIRE_CONTEXT_SELECTION"`, sebuah `temp_token`, dan daftar seluruh **Instalasi & Ruangan** yang diizinkan untuk pengguna tersebut (`available_contexts`).
3. **Langkah 2**: Pengguna memilih ruangan aktif melalui modal/dropdown frontend dan mengirimkan `{ instalasi_id, ruangan_id }` ke `POST /api/auth/select-context`.
4. **Respon**: Sistem menerbitkan JWT berkonteks penuh dan mengembalikan **Pohon Menu Hierarkis (`menus`)** serta daftar hak aksi (`permissions`) yang khusus berlaku untuk instalasi/ruangan tersebut.

### 2. Direct 1-Step Login (Langsung ke Ruangan)
Jika frontend sudah mengetahui ruangan tujuan pengguna, client dapat langsung mengirimkan:
```json
{
  "username": "dr.budi",
  "password": "dokter123",
  "instalasi_id": 1,
  "ruangan_id": 101
}
```
Sistem langsung memvalidasi penugasan dan mengembalikan token serta struktur menu dinamis dalam 1 request.

### 3. Switch Context (Ganti Ruangan Tanpa Logout)
Pengguna dapat berpindah ruangan (misal dokter selesai poliklinik dan ingin visite ke rawat inap) melalui endpoint:
`POST /api/auth/switch-context` dengan `{ instalasi_id, ruangan_id }`.
Struktur menu akan otomatis berganti ke modul ruangan baru tanpa meminta kata sandi ulang.

---

## 🗄️ Relasi Basis Data (ERD)

- **Users**: Pengguna sistem (`id`, `username`, `password_hash`, `nama_lengkap`, `nip_nik`, dll.)
- **Roles**: Peran pengguna (`ADMIN`, `DOKTER`, `PERAWAT`, `APOTEKER`, `KASIR`)
- **Instalasi**: Unit/Departemen utama RS (`IRJ`, `IRNA`, `IGD`, `FARMASI`, `KASIR`, `LAB`, `RAD`)
- **Ruangan**: Sub-unit/Poli/Bangsal bernaung di bawah Instalasi
- **UserRuanganRole**: Pivot penugasan seorang User ke Ruangan tertentu dengan Role tertentu
- **Menus**: Menu hierarkis bertingkat (`parent_id`, `kode_menu`, `nama_menu`, `icon`, `path`, `order_index`)
- **MenuInstalasi**: Menentukan menu apa saja yang aktif pada Instalasi tertentu
- **RoleMenu**: Menentukan menu apa saja yang boleh diakses oleh Role tertentu
- **Permissions**: Hak aksi granular (`emr:read`, `resep:create`, `kasir:pay`)
- **RolePermission**: Mapping hak aksi ke role

---

## 🚀 Cara Menjalankan Project (Termasuk Saat Pindah ke Laptop Lain)

Aplikasi ini sudah dilengkapi dengan fitur **Auto-Bootstrap Database & Auto-Seeding**. Saat Anda melakukan `git clone` di laptop lain:
1. Anda **TIDAK PERLU** membuat database manual lewat psql / pgAdmin.
2. Anda **TIDAK PERLU** menjalankan script SQL create table secara manual.
3. Begitu server dijalankan (`npm run dev` atau `npm start`), sistem secara otomatis:
   - Membuat database `simrs_db` jika belum ada di PostgreSQL.
   - Membuat seluruh tabel dan relasi Sequelize beserta kolom `created_at`, `updated_at`, dan `deleted_at`.
   - Mengisikan data awal master SIMRS (Roles, Instalasi, Ruangan, Menu Hierarkis, Akun Dokter/Kasir/Apoteker) jika data masih kosong.

---

### Langkah Saat Pindah ke Laptop Lain:

1. **Clone repository dan install dependencies**:
   ```bash
   git clone <url-repository-anda>
   cd SIMRS
   npm install
   ```

2. **Siapkan file `.env`**:
   Salin dari template `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan `DB_PASSWORD` dan `DB_USER` dengan akun PostgreSQL di laptop baru Anda jika berbeda.*

3. **Jalankan Aplikasi (Database Otomatis Terbuat)**:
   ```bash
   npm run dev
   ```
   *(Opsional) Jika ingin melakukan setup database dan seeding sebelum menjalankan server, cukup ketik:*
   ```bash
   npm run setup
   ```

4. **Jalankan Pengujian Otomatis**:
   ```bash
   npm test
   ```

---

## 👥 Akun Demo Bawaan Seeder

| Username | Password | Nama Lengkap | Role | Penugasan Ruangan & Instalasi |
|---|---|---|---|---|
| `admin` | `admin123` | Super Administrator | ADMIN | Semua Ruangan & Menu Master Data |
| `dr.budi` | `dokter123` | dr. Budi Santoso, Sp.PD | DOKTER | 1. Poli Penyakit Dalam (Rawat Jalan)<br>2. Bangsal Mawar VIP (Rawat Inap) |
| `perawat.siti` | `perawat123` | Ns. Siti Rahmawati, S.Kep | PERAWAT | 1. Poli Penyakit Dalam (Rawat Jalan)<br>2. Bangsal Melati Kelas 1 (Rawat Inap) |
| `apt.rani` | `apotek123` | apt. Rani Kusuma, S.Farm | APOTEKER | Depo Farmasi Rawat Jalan (Instalasi Farmasi) |
| `kasir.doni` | `kasir123` | Doni Pratama, S.E | KASIR | Loket Kasir Sentral 1 (Instalasi Kasir) |

---

## 📡 Daftar Endpoint API

### 1. Autentikasi & Konteks (`/api/auth`)
- `POST /api/auth/login`: Login kredensial (mendukung 2-step maupun 1-step).
- `POST /api/auth/select-context`: Memilih Instalasi & Ruangan aktif.
- `POST /api/auth/switch-context`: Berganti ruangan aktif.
- `GET /api/auth/me`: Data sesi profil & konteks aktif saat ini.
- `GET /api/auth/menus`: Mengambil pohon menu terfilter untuk konteks saat ini.

### 2. Pelayanan Klinis Berkonteks (`/api/pelayanan`)
- `GET /api/pelayanan/rawat-jalan/antrean`: Antrean pasien Poli (Konteks IRJ).
- `GET /api/pelayanan/rawat-inap/sensus`: Sensus pasien bangsal (Konteks IRNA).
- `GET /api/pelayanan/farmasi/resep`: Antrean resep masuk (Konteks Farmasi).
- `GET /api/pelayanan/kasir/tagihan`: Billing & pembayaran (Konteks Kasir).

### 3. Master Data (`/api/master` & `/api/users`)
- `GET /api/master/instalasi`: Daftar seluruh Instalasi.
- `POST /api/master/instalasi`: Tambah Instalasi baru (Admin).
- `GET /api/master/ruangan`: Daftar seluruh Ruangan (bisa filter `?instalasi_id=X`).
- `POST /api/master/ruangan`: Tambah Ruangan baru (Admin).
- `GET /api/master/roles`: Daftar Role.
- `GET /api/users`: Daftar seluruh Pengguna beserta assignment ruangannya.
- `POST /api/users`: Tambah Pengguna baru (Admin).
- `POST /api/users/:id/assign-ruangan`: Tugaskan pengguna ke ruangan & role tertentu (Admin).
- `GET /api/menus`: Seluruh menu (bisa `?tree=true`).

### 4. Manajemen Modul & Hak Akses Akun (`/api/modul`)
- `GET /api/modul`: Daftar seluruh Modul SIMRS (bisa `?include_menus=true`).
- `POST /api/modul`: Tambah Modul baru (Admin).
- `POST /api/modul/assign-instalasi`: Atur daftar modul aktif untuk suatu Instalasi (Admin).
- `POST /api/modul/assign-ruangan`: Atur daftar modul aktif untuk suatu Ruangan (Admin).
- `POST /api/modul/assign-user-ruangan`: Atur hak akses modul secara spesifik untuk Akun Pengguna di Ruangan tertentu (Admin).
- `GET /api/modul/my-modules`: Daftar modul yang berhak diakses oleh akun pengguna pada sesi ruangan saat ini.
