# 🎓 SIP Data Siswa: Sistem Pendataan Sosial Ekonomi & Status Tempat Tinggal

Aplikasi web fullstack modern berbasis **React** (Frontend) dan **Laravel** (Backend) yang dibangun untuk memenuhi kriteria tugas kelompok kelas 12 (dikerjakan oleh 2 orang), dilengkapi sistem **Login & Register**, **Pembagian Role Siswa & Admin**, serta panduan lengkap deploy ke **domain & hosting gratis**.

---

## 📌 Kriteria Tugas & Pemenuhan Fitur

| Kriteria Tugas | Implementasi dalam Aplikasi |
|---|---|
| **Sistem Login & Register** | Halaman autentikasi terpadu: **Login** (via Email atau NISN) dan **Register Siswa Baru**. Dilengkapi tombol cepat uji coba demo (*Quick Demo Login*). |
| **Pembagian Role (Siswa & Admin)** | Pembatasan hak akses ketat: <br>• **Siswa**: Hanya dapat mengakses formulir pengisian data, melihat data pengajuan diri sendiri, status verifikasi sekolah, dan cetak tanda terima.<br>• **Admin**: Mengakses seluruh dashboard analitik, 3 filter kriteria, modal detail foto rumah, status verifikasi, dan ekspor CSV. |
| **Dikerjakan 2 Orang** | Terbagi menjadi **Orang 1** (Frontend & UI/UX Specialist) dan **Orang 2** (Backend & Database Engineer). Panduan kolaborasi Git & naskah presentasi di `docs/PANDUAN_TUGAS_2_ORANG.md`. |
| **Upload ke Domain & Hosting Gratis** | Siap dideploy ke **Vercel / Netlify** (Domain gratis `.vercel.app`) dan backend di **Render.com / InfinityFree**. Panduan lengkap tersedia di `docs/PANDUAN_HOSTING_GRATIS.md`. |
| **Siswa menginput data kondisi ortu & ekonomi** | Formulir memuat: nama/pekerjaan/penghasilan ayah dan ibu, status keluarga (*Lengkap, Yatim, Piatu, Yatim Piatu, Bersama Wali*), kategori ekonomi, total penghasilan, dan bansos (*KIP/PKH*). |
| **Siswa memasukkan alamat saat ini & foto terbaru rumah** | Input alamat lengkap (Jalan, RT/RW, Desa, Kecamatan, Kota, Provinsi) serta unggah **Foto Terbaru Rumah** (drag-and-drop, validasi, live preview). |
| **Admin melihat kondisi siswa berdasarkan ekonomi** | Filter interaktif kategori ekonomi: *Sangat Kurang (< 1 Jt)*, *Kurang Mampu (1 - 3 Jt)*, *Menengah (3 - 5 Jt)*, *Mampu (> 5 Jt)*, lengkap dengan badge warna. |
| **Admin melihat kondisi siswa berdasarkan status keluarga** | Filter interaktif status keluarga: *Orang Tua Lengkap*, *Yatim*, *Piatu*, *Yatim Piatu*, dan *Bersama Wali*. |
| **Admin melihat kondisi siswa berdasarkan status rumah** | Filter interaktif status rumah: *Milik Sendiri*, *Sewa/Kontrak*, *Menumpang*, dan *Rumah Dinas*, lengkap dengan foto rumah terkini yang dapat diperbesar (*zoom modal*). |

---

## 🔑 Akun Demo Pengujian (Login Cepat)

Untuk keperluan penilaian / presentasi, sistem telah menyediakan akun demo bawaan:

| Role | Email / NISN | Password | Hak Akses |
|---|---|---|---|
| **User 1: Siswa** | `siswa@sekolah.sch.id` *(atau NISN `0068192341`)* | `siswa123` | Form Input Data, Status Pengajuan Diri, Cetak Bukti |
| **User 2: Admin** | `admin@sekolah.sch.id` | `admin123` | Dashboard Lengkap, Filter 3 Kriteria, Zoom Foto Rumah, Verifikasi Data, Ekspor CSV |

*(Siswa baru juga dapat langsung mendaftar melalui tab **Daftar Siswa (Register)**).*

---

## 📂 Struktur Proyek

```
data_siswa/
├── backend/                       # Backend Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php # Login & Registrasi Siswa
│   │   │   └── StudentController.php # CRUD, filter 3 kriteria, upload foto & stats
│   │   └── Models/                # Student.php & User.php
│   ├── database/
│   │   ├── migrations/            # Tabel users (role: admin, siswa) & students
│   │   └── seeders/               # DatabaseSeeder.php (Dummy data siswa realistis)
│   ├── routes/api.php             # Endpoint RESTful API
│   ├── config/cors.php            # Konfigurasi CORS
│   └── .env.example
├── src/                           # Frontend React (Vite)
│   ├── components/
│   │   ├── AuthPage.jsx           # Halaman Login & Registrasi Siswa
│   │   ├── Navbar.jsx             # Navigasi, Badge Role, dan Logout
│   │   ├── StudentForm.jsx        # Formulir input data siswa, ortu, ekonomi, alamat & foto
│   │   ├── StudentProfileView.jsx # Halaman status verifikasi & tanda terima siswa
│   │   ├── AdminDashboard.jsx     # Dashboard admin dengan 3 filter utama & tabel/kartu
│   │   ├── StudentDetailModal.jsx # Modal detail siswa + zoom foto rumah & verifikasi
│   │   ├── StudentProofModal.jsx  # Cetak bukti tanda terima siswa
│   │   └── CollaborationGuideModal.jsx # Modal panduan tugas 2 orang & hosting gratis
│   ├── services/
│   │   ├── api.js                 # Integrasi Laravel API + Smart Local Fallback
│   │   └── initialData.js         # Data awal siswa realistis
│   ├── App.jsx                    # Routing & pembagian role siswa/admin
│   ├── App.css                    # Styling modern responsif & print-friendly
│   └── main.jsx
├── docs/
│   ├── PANDUAN_TUGAS_2_ORANG.md   # Pembagian tugas, alur Git, dan naskah demo
│   └── PANDUAN_HOSTING_GRATIS.md  # Langkah upload ke Vercel, Render, dan InfinityFree
└── README.md
```

---

## 🚀 Cara Menjalankan di Komputer Lokal

### 1. Menjalankan Frontend (React)
```bash
npm run dev
```
Buka browser di `http://localhost:5173`. Masuk menggunakan tombol **Masuk sebagai Admin Demo** atau **Masuk sebagai Siswa Demo**, atau buat akun baru di tab **Register**.

### 2. Menjalankan Backend (Laravel) - *Opsional saat integrasi database*
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
Backend akan berjalan di `http://127.0.0.1:8000/api`.

---

## 🌐 Cara Deploy ke Domain & Hosting Gratis
1. **Frontend (React)**: Hubungkan repository GitHub ke [Vercel](https://vercel.com) &rarr; otomatis aktif dengan domain gratis `*.vercel.app`.
2. **Backend (Laravel)**: Hubungkan folder `backend` ke Web Service gratis di [Render.com](https://render.com) & database MySQL gratis di [TiDB Cloud](https://tidbcloud.com).
3. Panduan detail lengkap dapat dibaca di [`docs/PANDUAN_HOSTING_GRATIS.md`](file:///c:/Users/ahmad/OneDrive/Kelas%2012/KIK/data_siswa/docs/PANDUAN_HOSTING_GRATIS.md).
