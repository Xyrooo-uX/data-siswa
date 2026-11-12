# 🚀 PANDUAN DEPLOY KE DOMAIN & HOSTING GRATIS
## Sistem Pendataan Siswa (Frontend React + Backend Laravel)

Dokumen ini menjelaskan langkah demi langkah untuk mengupload aplikasi ke **domain dan hosting gratis** sesuai kriteria tugas.

---

## 🌟 Ringkasan Arsitektur Hosting Gratis Terbaik

| Komponen | Penyedia Layanan Gratis | Jenis Domain Gratis | Biaya |
|---|---|---|---|
| **Frontend (React)** | **Vercel** / **Netlify** | `nama-proyek.vercel.app` atau `nama-proyek.netlify.app` | **Rp 0 (Gratis Selamanya)** |
| **Backend (Laravel API)** | **Render.com** / **Koyeb** | `nama-api.onrender.com` | **Rp 0 (Gratis)** |
| **Database (MySQL)** | **TiDB Cloud** / **Aiven** / **Neon** | Koneksi cloud host gratis | **Rp 0 (Gratis)** |
| **Alternatif Shared Hosting** | **InfinityFree** | `nama-proyek.rf.gd` / `*.kesug.com` | **Rp 0 (Gratis)** |

---

## 📦 OPSI A: Vercel (Frontend) + Render & TiDB (Backend) [SANGAT DIREKOMENDASIKAN]

Opsi ini adalah standar industri modern yang paling cepat, rapi, dan mudah dikonfigurasi.

### Bagian 1: Deploy Frontend React ke Vercel (Gratis)
1. **Push Proyek ke GitHub**:
   - Pastikan kode Anda sudah di-push ke repository GitHub (publik atau privat).
2. **Buka Akun Vercel**:
   - Masuk ke [https://vercel.com](https://vercel.com) dan klik **"Sign Up"** dengan akun GitHub Anda.
3. **Impor Repository**:
   - Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
   - Cari nama repository proyek Anda (misal `data_siswa_kik`) lalu klik **"Import"**.
4. **Konfigurasi Build**:
   - **Framework Preset**: `Vite` (terdeteksi otomatis).
   - **Root Directory**: `./` (atau folder `frontend` jika Anda memisahkannya).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Tambahkan Environment Variable (Opsional)**:
   - Di bagian **Environment Variables**, tambahkan:
     - `VITE_API_URL` = URL backend Laravel Anda (misalnya `https://sip-siswa-api.onrender.com/api`).
6. **Klik Deploy**:
   - Dalam waktu 30-60 detik, Vercel akan selesai melakukan build dan memberikan **domain gratis aktif** seperti:
     `https://data-siswa-kik.vercel.app`
   - Salin link ini untuk dikumpulkan ke guru/penguji!

---

### Bagian 2: Deploy Backend Laravel ke Render.com (Gratis)
1. **Daftar Akun Render**:
   - Buka [https://render.com](https://render.com) dan login menggunakan akun GitHub.
2. **Buat Database MySQL Gratis di TiDB Cloud**:
   - Buka [https://tidbcloud.com](https://tidbcloud.com), buat akun gratis (Serverless Tier, gratis selamanya).
   - Buat cluster baru (pilih Serverless).
   - Dapatkan informasi koneksi: `Host`, `Port (4000)`, `User`, `Password`, dan `Database Name`.
3. **Buat Web Service Baru di Render**:
   - Di Render dashboard, klik **"New +"** lalu pilih **"Web Service"**.
   - Pilih repository GitHub Anda.
   - Atur pengaturan berikut:
     - **Name**: `sip-siswa-backend`
     - **Root Directory**: `backend`
     - **Environment**: `PHP`
     - **Build Command**:
       ```bash
       composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan db:seed --force
       ```
     - **Start Command**:
       ```bash
       php artisan serve --host 0.0.0.0 --port $PORT
       ```
4. **Tambahkan Environment Variables di Render**:
   - `APP_ENV` = `production`
   - `APP_KEY` = `base64:XG8oFh5q8ZgQ+kC3f5+Y+uP1y5W1y6q5z7Q+kC3f5+Y=`
   - `APP_DEBUG` = `false`
   - `DB_CONNECTION` = `mysql`
   - `DB_HOST` = (Host dari TiDB Cloud)
   - `DB_PORT` = `4000`
   - `DB_DATABASE` = (Nama database Anda)
   - `DB_USERNAME` = (User dari TiDB Cloud)
   - `DB_PASSWORD` = (Password dari TiDB Cloud)
5. **Klik "Create Web Service"**:
   - Render akan mem-build backend dan memberikan URL domain gratis seperti: `https://sip-siswa-backend.onrender.com`.

---

## 🌐 OPSI B: InfinityFree (Shared Hosting cPanel Gratis)

Jika guru atau kriteria penilaian menghendaki hosting tradisional berkonsep cPanel:

1. Buka [https://www.infinityfree.com](https://www.infinityfree.com) dan buat akun gratis.
2. Klik **"Create Account"**, lalu pilih subdomain gratis yang disediakan (contoh: `.rf.gd`, `.kesug.com`, atau `.infinityfreeapp.com`).
   - Contoh domain: `http://datasiswa-kik.rf.gd`
3. Masuk ke **Control Panel (cPanel)**:
   - Buat database MySQL di menu **"MySQL Databases"**.
   - Buka **phpMyAdmin**, import struktur tabel atau jalankan migration/seeder.
4. Buka **File Manager**:
   - Masuk ke folder `htdocs/`.
   - Jalankan `npm run build` pada React di komputer Anda, lalu upload seluruh isi folder `dist/` ke `htdocs/`.
   - Backend PHP Laravel diletakkan di luar `htdocs` atau dalam subfolder `api/`.

---

## 🛡️ Fitur Proteksi Presentasi: "Smart Dual Mode (Offline/Online Resilient)"

Aplikasi ini sudah kami lengkapi dengan teknologi **Smart Fallback** di `src/services/api.js`:
- Jika backend Laravel online, aplikasi otomatis menggunakan database cloud.
- Jika server gratis sedang dalam masa *spin-down* (mode tidur hemat kuota) atau tidak ada koneksi internet saat presentasi di kelas, **frontend secara otomatis beralih ke Mode Lokal / LocalStorage** tanpa menghasilkan error layar putih!
- Seluruh fitur: input form siswa, upload foto, filter ekonomi, filter keluarga, filter rumah, ekspor CSV, dan cetak laporan **tetap berjalan 100% lancar**.

