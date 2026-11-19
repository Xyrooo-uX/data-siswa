import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Path penyimpanan database bersama
const DB_FILE_PATH = path.resolve(process.cwd(), 'backend/database/data_synced.json');

// Helper untuk membaca daftar IP lokal laptop
function getLocalNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Ambil IPv4 dan bukan internal (127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({
          interface: name,
          ip: net.address
        });
      }
    }
  }
  return ips;
}

// Inisialisasi Database Default
const defaultDatabase = {
  users: [
    {
      id: 1,
      name: 'Administrator Sekolah',
      email: 'admin@sekolah.sch.id',
      nisn: null,
      role: 'admin',
      password: 'admin123',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Siswa Baru',
      email: 'siswa@sekolah.sch.id',
      nisn: '0068192341',
      role: 'siswa',
      password: 'siswa123',
      created_at: new Date().toISOString()
    }
  ],
  students: []
};

// Baca database dari file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDatabase, null, 2), 'utf-8');
      return defaultDatabase;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = defaultDatabase.users;
    if (!parsed.students) parsed.students = [];
    return parsed;
  } catch (err) {
    console.error('[API Server] Error reading DB:', err);
    return defaultDatabase;
  }
}

// Tulis database ke file
function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API Server] Error writing DB:', err);
  }
}

// Helper parsing JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      const raw = Buffer.concat(chunks).toString('utf-8');
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Hitung statistik siswa
function calculateStats(students) {
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

export function apiServerPlugin() {
  return {
    name: 'integrated-data-siswa-api',
    configureServer(server) {
      // Inisialisasi DB saat server start
      readDb();

      server.middlewares.use(async (req, res, next) => {
        // Hanya proses request yang diawali /api
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        if (!pathname.startsWith('/api')) {
          return next();
        }

        // Set CORS headers agar HP atau perangkat lain bisa akses tanpa halangan
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // Helper response JSON
        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
        };

        try {
          // 1. Health check
          if (pathname === '/api/health' && req.method === 'GET') {
            return sendJson(200, {
              status: 'ok',
              app: 'SIP Data Siswa Integrated Sync Server',
              time: new Date().toISOString(),
              connectedDevices: true
            });
          }

          // 2. Info Network IP laptop (untuk dibuka di HP)
          if (pathname === '/api/network-info' && req.method === 'GET') {
            const ips = getLocalNetworkIps();
            const port = server.config.server.port || 5173;
            return sendJson(200, {
              port,
              ips,
              networkUrls: ips.map(i => `http://${i.ip}:${port}`)
            });
          }

          // 3. Auth: Login
          if (pathname === '/api/auth/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const { email, password } = body;
            const db = readDb();
            const identifier = (email || '').trim().toLowerCase();

            const user = db.users.find(u =>
              (u.email && u.email.toLowerCase() === identifier) ||
              (u.nisn && u.nisn === identifier)
            );

            if (!user || user.password !== password) {
              return sendJson(401, {
                success: false,
                message: 'Email/NISN atau kata sandi tidak valid.'
              });
            }

            const safeUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              nisn: user.nisn
            };

            return sendJson(200, {
              success: true,
              message: 'Login berhasil',
              data: {
                user: safeUser,
                token: 'token_' + Date.now()
              }
            });
          }

          // 4. Auth: Register
          if (pathname === '/api/auth/register' && req.method === 'POST') {
            const body = await parseBody(req);
            const { name, email, nisn, password } = body;
            const db = readDb();

            const cleanEmail = (email || '').trim().toLowerCase();
            const cleanNisn = (nisn || '').trim();

            if (db.users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
              return sendJson(422, {
                success: false,
                message: 'Email sudah terdaftar. Silakan login.'
              });
            }

            if (cleanNisn && db.users.some(u => u.nisn === cleanNisn)) {
              return sendJson(422, {
                success: false,
                message: 'NISN sudah terdaftar dalam sistem.'
              });
            }

            const newUser = {
              id: Date.now(),
              name: (name || '').trim(),
              email: cleanEmail,
              nisn: cleanNisn,
              role: 'siswa',
              password: password,
              created_at: new Date().toISOString()
            };

            db.users.push(newUser);
            writeDb(db);

            const safeUser = {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              nisn: newUser.nisn
            };

            return sendJson(201, {
              success: true,
              message: 'Registrasi siswa berhasil',
              data: safeUser
            });
          }

          // 5. Get Students Stats
          if (pathname === '/api/students/stats' && req.method === 'GET') {
            const db = readDb();
            const stats = calculateStats(db.students);
            return sendJson(200, {
              success: true,
              data: stats
            });
          }

          // 6. Get Students (List & Filter)
          if (pathname === '/api/students' && req.method === 'GET') {
            const db = readDb();
            let result = [...db.students];

            const search = urlObj.searchParams.get('search');
            const ekonomi = urlObj.searchParams.get('ekonomi');
            const status_keluarga = urlObj.searchParams.get('status_keluarga');
            const status_rumah = urlObj.searchParams.get('status_rumah');

            if (search) {
              const q = search.toLowerCase();
              result = result.filter(s =>
                (s.nama_lengkap && s.nama_lengkap.toLowerCase().includes(q)) ||
                (s.nisn && s.nisn.includes(q)) ||
                (s.kelas && s.kelas.toLowerCase().includes(q)) ||
                (s.kota_kabupaten && s.kota_kabupaten.toLowerCase().includes(q))
              );
            }

            if (ekonomi && ekonomi !== 'Semua') {
              result = result.filter(s => s.kategori_ekonomi === ekonomi);
            }

            if (status_keluarga && status_keluarga !== 'Semua') {
              if (status_keluarga === 'Bersama Wali') {
                result = result.filter(s => s.status_keluarga === 'Bersama Wali' || s.status_keluarga === 'Menumpang');
              } else {
                result = result.filter(s => s.status_keluarga === status_keluarga);
              }
            }

            if (status_rumah && status_rumah !== 'Semua') {
              result = result.filter(s => s.status_rumah === status_rumah);
            }

            return sendJson(200, {
              success: true,
              message: 'Data siswa berhasil dimuat',
              count: result.length,
              data: result
            });
          }

          // 7. Create Student
          if (pathname === '/api/students' && req.method === 'POST') {
            const body = await parseBody(req);
            const db = readDb();

            const ayah = parseFloat(body.penghasilan_ayah || 0) || 0;
            const ibu = parseFloat(body.penghasilan_ibu || 0) || 0;
            const total = parseFloat(body.penghasilan_total || (ayah + ibu)) || 0;

            let katEkonomi = body.kategori_ekonomi;
            if (!katEkonomi) {
              if (total <= 1000000) katEkonomi = 'Sangat Kurang';
              else if (total <= 3000000) katEkonomi = 'Kurang Mampu';
              else if (total <= 5000000) katEkonomi = 'Menengah';
              else katEkonomi = 'Mampu';
            }

            const newStudent = {
              ...body,
              id: Date.now(),
              penghasilan_ayah: ayah,
              penghasilan_ibu: ibu,
              penghasilan_total: total,
              jumlah_tanggungan: parseInt(body.jumlah_tanggungan || 1, 10),
              kategori_ekonomi: katEkonomi,
              status_verifikasi: body.status_verifikasi || 'Menunggu',
              catatan_admin: body.catatan_admin || '',
              created_at: new Date().toISOString()
            };

            // Masukkan di urutan teratas
            db.students.unshift(newStudent);
            writeDb(db);

            return sendJson(201, {
              success: true,
              message: 'Data siswa dan kondisi sosial ekonomi berhasil disimpan!',
              data: newStudent
            });
          }

          // 8. Detail, Update, Delete Student: /api/students/:id
          const studentMatch = pathname.match(/^\/api\/students\/(\d+)$/);
          if (studentMatch) {
            const studentId = parseInt(studentMatch[1], 10);
            const db = readDb();
            const index = db.students.findIndex(s => s.id === studentId);

            if (req.method === 'GET') {
              if (index === -1) {
                return sendJson(404, { success: false, message: 'Data siswa tidak ditemukan' });
              }
              return sendJson(200, { success: true, data: db.students[index] });
            }

            if (req.method === 'PUT') {
              if (index === -1) {
                return sendJson(404, { success: false, message: 'Data siswa tidak ditemukan' });
              }
              const body = await parseBody(req);
              db.students[index] = {
                ...db.students[index],
                ...body,
                updated_at: new Date().toISOString()
              };
              writeDb(db);
              return sendJson(200, {
                success: true,
                message: 'Data siswa berhasil diperbarui',
                data: db.students[index]
              });
            }

            if (req.method === 'DELETE') {
              if (index === -1) {
                return sendJson(404, { success: false, message: 'Data siswa tidak ditemukan' });
              }
              db.students.splice(index, 1);
              writeDb(db);
              return sendJson(200, {
                success: true,
                message: 'Data siswa berhasil dihapus'
              });
            }
          }

          // Fallback route 404
          return sendJson(404, { success: false, message: 'Endpoint API tidak ditemukan' });
        } catch (err) {
          console.error('[API Server Error]:', err);
          return sendJson(500, { success: false, message: 'Terjadi kesalahan pada server API' });
        }
      });
    }
  };
}
