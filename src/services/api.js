import { initialStudents } from './initialData';
import { isStrongPassword } from '../utils/password';

// Penentuan URL API secara cerdas & otomatis:
// 1. Jika diset di .env (misal VITE_API_URL saat deploy), gunakan nilai tersebut.
// 2. Jika di browser, gunakan endpoint relatif '/api' agar otomatis mengikuti domain/IP perangkat
//    (baik dibuka dari Laptop via localhost, IP LAN, maupun domain publik seperti ngrok).
// 3. Fallback default ke 'http://127.0.0.1:8000/api'.
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Header bawaan termasuk perlindungan bypass warning untuk ngrok
const defaultHeaders = {
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

const LOCAL_STORAGE_KEY = 'sip_data_siswa_records_v4';
const LOCAL_USERS_KEY = 'sip_data_users_db_v4';
const CURRENT_USER_KEY = 'sip_current_user_v4';

// Bersihkan cache lama jika ada
try {
  localStorage.removeItem('sip_data_siswa_records');
  localStorage.removeItem('sip_data_siswa_records_clean');
  localStorage.removeItem(CURRENT_USER_KEY);
} catch { }

// Inisialisasi Database User Lokal untuk offline/demo fallback
const defaultUsers = [
  {
    id: 1,
    name: 'Administrator Sekolah',
    email: 'admin@sekolah.sch.id',
    nisn: null,
    role: 'admin',
    password: '@AkunAdmin1234',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Akun user',
    email: 'siswa@sekolah.sch.id',
    nisn: '0068192341',
    role: 'siswa',
    password: 'siswa123',
    created_at: new Date().toISOString()
  }
];

function getLocalUsers() {
  const existing = localStorage.getItem(LOCAL_USERS_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  try {
    const users = JSON.parse(existing);
    const adminUser = users.find(user => user.email === 'admin@sekolah.sch.id');
    if (adminUser?.password === 'admin123') {
      adminUser.password = '@AkunAdmin1234';
      saveLocalUsers(users);
    }
    return users;
  } catch {
    return defaultUsers;
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Helper inisialisasi localStorage siswa
function getLocalRecords() {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialStudents));
    return initialStudents;
  }
  try {
    return JSON.parse(existing);
  } catch {
    return initialStudents;
  }
}

function saveLocalRecords(records) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

// Sesi hanya disimpan di state aplikasi, bukan di browser storage.
export function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {
    // Logout tetap berhasil meskipun browser menolak akses ke storage.
  }
  return { success: true };
}

// Ambil info network IP dari server
export async function getNetworkInfo() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE_URL}/network-info`, {
      headers: defaultHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch { }
  return null;
}

// Login User (Mencoba Server API, fallback ke Local DB)
export async function loginUser(emailOrNisn, password) {
  // 1. Coba hubungi backend server (Vite/Laravel/PHP)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrNisn, password }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const user = result.data?.user || result.user;
      return { success: true, user, source: 'backend' };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Login gagal.' };
    }
  } catch {
    // Backend offline, gunakan fallback local users DB
  }

  // 2. Fallback Local Authentication
  const users = getLocalUsers();
  const identifier = emailOrNisn.trim().toLowerCase();
  const matchedUser = users.find(u =>
    (u.email && u.email.toLowerCase() === identifier) ||
    (u.nisn && u.nisn === identifier)
  );

  if (!matchedUser) {
    return { success: false, message: 'Akun dengan Email atau NISN tersebut tidak ditemukan.' };
  }

  if (matchedUser.password !== password) {
    return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
  }

  const safeUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    nisn: matchedUser.nisn,
    role: matchedUser.role,
  };

  return { success: true, user: safeUser, source: 'local' };
}

// Register Siswa Baru (Role otomatis 'siswa')
export async function registerUser({ name, email, nisn, password }) {
  if (!isStrongPassword(password)) {
    return {
      success: false,
      message: 'Kata sandi minimal 8 karakter dan harus memuat huruf, angka, serta simbol.'
    };
  }

  // 1. Coba registrasi ke backend server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, nisn, password }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const newUser = result.data || result.user;
      return { success: true, user: newUser, source: 'backend' };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Gagal registrasi akun siswa.' };
    }
  } catch {
    // Backend offline, simpan di local users DB
  }

  // 2. Fallback Local Registration
  const users = getLocalUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanNisn = nisn.trim();

  // Validasi unik email & NISN
  if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
  }
  if (cleanNisn && users.some(u => u.nisn === cleanNisn)) {
    return { success: false, message: 'NISN sudah terdaftar dalam sistem.' };
  }

  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: cleanEmail,
    nisn: cleanNisn,
    role: 'siswa',
    password: password,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  const safeUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    nisn: newUser.nisn,
    role: newUser.role,
  };

  return { success: true, user: safeUser, source: 'local' };
}

// ---------------------------------------------------------------------------
// DATA SISWA (CRUD, FILTERS, & STATS)
// ---------------------------------------------------------------------------

// Ambil semua data siswa dengan filter & pencarian
export async function fetchStudents(filters = {}) {
  // Coba panggil server API terlebih dahulu
  try {
    const query = new URLSearchParams();
    if (filters.ekonomi && filters.ekonomi !== 'Semua') query.append('ekonomi', filters.ekonomi);
    if (filters.status_keluarga && filters.status_keluarga !== 'Semua') query.append('status_keluarga', filters.status_keluarga);
    if (filters.status_rumah && filters.status_rumah !== 'Semua') query.append('status_rumah', filters.status_rumah);
    if (filters.search) query.append('search', filters.search);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
      headers: defaultHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const list = data.data || data;
      // Sinkronkan ke local cache untuk perlindungan offline
      if (Array.isArray(list)) {
        saveLocalRecords(list);
      }
      return { success: true, data: list, source: 'backend' };
    }
  } catch {
    // Backend tidak aktif, gunakan localStorage fallback
  }

  // Fallback LocalStorage (Offline / Demo Mode)
  let records = getLocalRecords();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(s =>
      s.nama_lengkap.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.kelas.toLowerCase().includes(q) ||
      s.kota_kabupaten.toLowerCase().includes(q)
    );
  }

  if (filters.ekonomi && filters.ekonomi !== 'Semua') {
    records = records.filter(s => s.kategori_ekonomi === filters.ekonomi);
  }

  if (filters.status_keluarga && filters.status_keluarga !== 'Semua') {
    records = records.filter(s => s.status_keluarga === filters.status_keluarga);
  }

  if (filters.status_rumah && filters.status_rumah !== 'Semua') {
    records = records.filter(s => s.status_rumah === filters.status_rumah);
  }

  return { success: true, data: records, source: 'local' };
}

// Tambah data siswa baru
export async function createStudent(payload) {
  try {
    const isFormData = payload instanceof FormData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? { 'ngrok-skip-browser-warning': 'true' } : { ...defaultHeaders, 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const created = result.data || result;
      // Perbarui juga local cache
      const local = getLocalRecords();
      local.unshift(created);
      saveLocalRecords(local);
      return { success: true, data: created, source: 'backend' };
    }
  } catch {
    // Fallback simpan ke local storage jika server tidak merespons
  }

  const records = getLocalRecords();

  let newRecord = payload;
  if (payload instanceof FormData) {
    newRecord = Object.fromEntries(payload.entries());
  }

  const id = Date.now();
  const createdRecord = {
    ...newRecord,
    id,
    penghasilan_ayah: Number(newRecord.penghasilan_ayah || 0),
    penghasilan_ibu: Number(newRecord.penghasilan_ibu || 0),
    penghasilan_total: Number(newRecord.penghasilan_total || 0),
    jumlah_tanggungan: Number(newRecord.jumlah_tanggungan || 1),
    status_verifikasi: 'Menunggu',
    created_at: new Date().toISOString()
  };

  records.unshift(createdRecord);
  saveLocalRecords(records);

  return { success: true, data: createdRecord, source: 'local' };
}

// Update status verifikasi atau catatan siswa oleh Admin
export async function updateStudent(id, updates) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const updated = result.data || result;
      const records = getLocalRecords();
      const idx = records.findIndex(r => r.id === Number(id));
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...updates };
        saveLocalRecords(records);
      }
      return { success: true, data: updated, source: 'backend' };
    }
  } catch {
    // fallback local
  }

  const records = getLocalRecords();
  const index = records.findIndex(r => r.id === Number(id));
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveLocalRecords(records);
    return { success: true, data: records[index], source: 'local' };
  }

  return { success: false, message: 'Data tidak ditemukan' };
}

// Hapus data siswa
export async function deleteStudent(id) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      let records = getLocalRecords();
      records = records.filter(r => r.id !== Number(id));
      saveLocalRecords(records);
      return { success: true, source: 'backend' };
    }
  } catch {
    // fallback local
  }

  let records = getLocalRecords();
  records = records.filter(r => r.id !== Number(id));
  saveLocalRecords(records);
  return { success: true, source: 'local' };
}

// Hitung ringkasan statistik untuk dashboard admin
export function calculateStats(students = []) {
  const total = students.length;
  const ekonomi = {
    sangatKurang: students.filter(s => s.kategori_ekonomi === 'Sangat Kurang').length,
    kurangMampu: students.filter(s => s.kategori_ekonomi === 'Kurang Mampu').length,
    menengah: students.filter(s => s.kategori_ekonomi === 'Menengah').length,
    mampu: students.filter(s => s.kategori_ekonomi === 'Mampu').length,
  };

  const statusKeluarga = {
    lengkap: students.filter(s => s.status_keluarga === 'Lengkap').length,
    yatim: students.filter(s => s.status_keluarga === 'Yatim').length,
    piatu: students.filter(s => s.status_keluarga === 'Piatu').length,
    yatimPiatu: students.filter(s => s.status_keluarga === 'Yatim Piatu').length,
    wali: students.filter(s => s.status_keluarga === 'Menumpang' || s.status_keluarga === 'Bersama Wali').length,
  };

  const statusRumah = {
    sendiri: students.filter(s => s.status_rumah === 'Milik Sendiri').length,
    sewa: students.filter(s => s.status_rumah === 'Sewa/Kontrak').length,
    menumpang: students.filter(s => s.status_rumah === 'Menumpang').length,
    dinas: students.filter(s => s.status_rumah === 'Rumah Dinas').length,
  };

  const penerimaBantuan = students.filter(s => s.penerima_bantuan && s.penerima_bantuan !== 'Tidak Ada').length;

  return {
    total,
    ekonomi,
    statusKeluarga,
    statusRumah,
    penerimaBantuan,
    prioritasBantuan: ekonomi.sangatKurang + ekonomi.kurangMampu + statusKeluarga.yatim + statusKeluarga.piatu + statusKeluarga.yatimPiatu
  };
}
