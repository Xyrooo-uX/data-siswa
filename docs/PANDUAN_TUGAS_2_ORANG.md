# 👥 PANDUAN KOLABORASI PROYEK 2 ORANG (TUGAS KIK)
## Sistem Pendataan Siswa: Kondisi Sosial Ekonomi & Status Tempat Tinggal

Proyek ini dirancang secara khusus untuk dikerjakan secara kolaboratif oleh **2 orang** dengan pemisahan peran yang jelas (*separation of concerns*):
- **Orang 1**: Frontend Specialist & UI/UX Developer (React.js, Autentikasi UI, CSS Modern, State Management)
- **Orang 2**: Backend Specialist & Database Engineer (Laravel RESTful API, Autentikasi AuthController, Migrations, Storage File)

---

## 📋 1. Pembagian Jobdesk & Tanggung Jawab

| No | Komponen / Fitur | Penanggung Jawab | Deskripsi Pekerjaan |
|---|---|---|---|
| 1 | **Sistem Autentikasi UI (Login & Register)** | **Orang 1** | Membangun komponen `AuthPage.jsx` (tab Login via email/NISN dan tab Register akun siswa baru, lengkap dengan tombol *quick demo*). |
| 2 | **Pembagian Role & Navigasi Terproteksi** | **Orang 1** | Membatasi tampilan: jika role `siswa` hanya membuka form & profil status; jika role `admin` membuka dashboard analitik dan verifikasi data. |
| 3 | **Formulir Siswa (User 1)** | **Orang 1** | Form input data siswa, kondisi orang tua, ekonomi, alamat lengkap, validasi input, dan drag-and-drop live preview foto rumah. |
| 4 | **Dashboard Admin & 3 Filter Kriteria (User 2)** | **Orang 1** | Halaman monitoring admin dengan 3 filter utama: **Kondisi Ekonomi**, **Status Keluarga**, dan **Status Rumah**, serta pencarian real-time dan ekspor CSV. |
| 5 | **Modal Detail & Bukti Cetak** | **Orang 1** | Modal detail siswa dengan foto rumah resolusi penuh yang dapat diperbesar (zoom), verifikasi admin, dan kartu bukti tanda terima siswa (print-friendly). |
| 6 | **Autentikasi Backend (Laravel Auth)** | **Orang 2** | Pembuatan `AuthController.php` (login via email/NISN, registrasi akun siswa baru, hashing password dengan `Hash::make`, return role token). |
| 7 | **Perancangan Database & Migration** | **Orang 2** | Pembuatan migration Laravel: tabel `users` (kolom `role`, `nisn`, `email`, `password`) dan tabel `students` dengan seluruh kolom kriteria sosial ekonomi. |
| 8 | **Model & Seeder Data Realistis** | **Orang 2** | Model `Student`, relasi ke `User`, dan seeder `DatabaseSeeder.php` dengan akun admin, akun siswa, dan contoh data siswa dari berbagai kondisi. |
| 9 | **RESTful API Controller & Storage Foto** | **Orang 2** | Pembuatan `StudentController` dengan endpoint: `GET /api/students` (dengan filter parameter), `POST /api/students`, `PUT /api/students/{id}`, `DELETE`, `GET /api/students/stats`, dan storage foto rumah. |
| 10 | **Deploy ke Domain & Hosting Gratis** | **Orang 1 & 2** | Orang 1 mengupload frontend React ke **Vercel** (`*.vercel.app`), Orang 2 mengupload backend Laravel ke **Render.com** atau **InfinityFree**. |

---

## 🔑 Kredensial Akun Pengujian Demo

| Pengguna | Email / NISN | Password | Fungsi dalam Demo |
|---|---|---|---|
| **User 1: Siswa** | `siswa@sekolah.sch.id` *(NISN: `0068192341`)* | `siswa123` | Mengisi formulir, melihat status verifikasi, dan mencetak bukti tanda terima. |
| **User 2: Admin** | `admin@sekolah.sch.id` | `admin123` | Melihat semua data siswa, menyaring berdasarkan 3 filter, memeriksa foto rumah, dan mengubah status verifikasi. |

---

## 🔀 2. Alur Kolaborasi Git (Git Branching Workflow)

Untuk membuktikan kerja sama 2 orang di GitHub:

### Langkah 1: Inisialisasi Repository oleh Orang 1
```bash
git init
git add .
git commit -m "feat: inisialisasi awal proyek pendataan siswa (React & Laravel)"
git branch -M main
git remote add origin https://github.com/USERNAME/data_siswa_kik.git
git push -u origin main
```
*Undang rekan tim Anda di GitHub: **Settings** -> **Collaborators** -> **Add people**.*

### Langkah 2: Orang 2 Melakukan Clone
```bash
git clone https://github.com/USERNAME/data_siswa_kik.git
cd data_siswa_kik
```

### Langkah 3: Mengembangkan Fitur dengan Branch Terpisah
- **Orang 1 (Frontend):**
  ```bash
  git checkout -b feature/frontend-auth
  # Buat atau edit komponen React...
  git add src/
  git commit -m "feat(frontend): buat sistem login register dan pembagian role siswa admin"
  git push origin feature/frontend-auth
  ```

- **Orang 2 (Backend):**
  ```bash
  git checkout -b feature/backend-api
  # Buat atau edit controller Laravel, migration...
  git add backend/
  git commit -m "feat(backend): buat auth controller dan endpoint filter data siswa"
  git push origin feature/backend-api
  ```

### Langkah 4: Penggabungan (Merge ke Main)
Buat **Pull Request (PR)** di GitHub dari branch masing-masing ke branch `main`, lakukan review bersama, lalu klik **Merge pull request**.

---

## 🎤 3. Panduan Pembagian Presentasi / Demo Tugas (5-10 Menit)

Saat mempresentasikan hasil tugas di depan guru atau penguji:

### Bagian 1: Pembukaan & Latar Belakang (Orang 1 & Orang 2 bersama)
- "Selamat pagi/siang Bapak/Ibu guru. Kami dari kelompok [Nama Kelompok] beranggotakan [Nama Orang 1] dan [Nama Orang 2] mempresentasikan aplikasi **SIP Data Siswa**."
- "Aplikasi ini dilengkapi sistem **Login & Register** dengan **pembagian hak akses (role) yang ketat** antara **Siswa** dan **Admin**."

### Bagian 2: Demo Alur Siswa (Orang 1)
- Masuk ke aplikasi menggunakan tombol **Masuk sebagai Siswa Demo** atau lakukan registrasi akun siswa baru.
- Perlihatkan bahwa siswa hanya memiliki akses ke **Formulir Input Data** dan **Data Saya & Status**:
  1. Pengisian biodata siswa (Nama, NISN, Kelas).
  2. Kondisi orang tua (Status keluarga: Lengkap, Yatim, Piatu, atau Yatim Piatu).
  3. Kondisi ekonomi (Penghasilan total, tanggungan, status KIP/PKH).
  4. Penginputan alamat saat ini dan **upload foto terbaru rumah**.
- Klik **Kirim Data Siswa** dan perlihatkan **Tanda Bukti Input Data** yang siap dicetak.
- Lakukan **Logout** untuk menunjukkan pergantian akun.

### Bagian 3: Demo Alur Admin & Filter (Orang 2)
- Masuk ke aplikasi menggunakan akun **Admin** (`admin@sekolah.sch.id`).
- Perlihatkan ringkasan statistik (Total siswa, siswa kurang mampu, yatim/piatu, status rumah sewa).
- Tunjukkan **3 Filter Kriteria Utama**:
  1. Filter **Kondisi Ekonomi** (misal: filter hanya yang 'Kurang Mampu' dan 'Sangat Kurang').
  2. Filter **Status Keluarga** (misal: filter siswa yang berstatus 'Yatim Piatu').
  3. Filter **Status Rumah** (misal: filter siswa yang tinggal di rumah 'Sewa/Kontrak' atau 'Menumpang').
- Klik salah satu siswa untuk membuka **Modal Detail**:
  - Tunjukkan foto terbaru rumah siswa dalam ukuran besar dan jelas untuk verifikasi.
  - Berikan status verifikasi (Terverifikasi / Perlu Revisi) dan catatan rekomendasi bantuan.
  - Tunjukkan fitur ekspor data ke file CSV / Cetak Laporan Rekapitulasi.

### Bagian 4: Penjelasan Backend & Hosting (Orang 2 & Orang 1)
- Orang 2 menjelaskan struktur Laravel API, Database Migration, tabel `users` & `students`, serta penanganan upload gambar.
- Orang 1 menjelaskan cara deploy ke Vercel (Frontend) dan Render (Backend).
- Penutup dan sesi tanya jawab.
