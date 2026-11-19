<?php
/**
 * SIP Data Siswa - PHP Backend Server
 * Menghubungkan Laptop & HP secara realtime menggunakan PHP built-in server.
 * 
 * Cara menjalankan:
 * php -S 0.0.0.0:8000 backend/server.php
 */

// Enable CORS untuk semua origin (Laptop, HP, dsb)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbFilePath = __DIR__ . '/database/data_synced.json';

// Inisialisasi DB Default jika belum ada
$defaultDb = [
    'users' => [
        [
            'id' => 1,
            'name' => 'Administrator Sekolah',
            'email' => 'admin@sekolah.sch.id',
            'nisn' => null,
            'role' => 'admin',
            'password' => 'admin123',
            'created_at' => date('c')
        ],
        [
            'id' => 2,
            'name' => 'Siswa Baru',
            'email' => 'siswa@sekolah.sch.id',
            'nisn' => '0068192341',
            'role' => 'siswa',
            'password' => 'siswa123',
            'created_at' => date('c')
        ]
    ],
    'students' => []
];

function readDatabase($path, $default) {
    if (!file_exists($path)) {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        file_put_contents($path, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $default;
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    if (!isset($data['users'])) $data['users'] = $default['users'];
    if (!isset($data['students'])) $data['students'] = [];
    return $data;
}

function writeDatabase($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$db = readDatabase($dbFilePath, $defaultDb);

// Parse URI & Method
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper respon JSON
function jsonResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Health check
if ($uri === '/api/health' && $method === 'GET') {
    jsonResponse(200, [
        'status' => 'ok',
        'app' => 'SIP Data Siswa PHP API Server',
        'time' => date('c'),
        'connectedDevices' => true
    ]);
}

// 1b. Network Info
if ($uri === '/api/network-info' && $method === 'GET') {
    $ip = getHostByName(getHostName());
    jsonResponse(200, [
        'port' => 8000,
        'ips' => [['interface' => 'Default', 'ip' => $ip]],
        'networkUrls' => ["http://{$ip}:5173", "http://{$ip}:8000"]
    ]);
}

// 2. Auth: Login
if ($uri === '/api/auth/login' && $method === 'POST') {
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $identifier = strtolower($email);

    $matchedUser = null;
    foreach ($db['users'] as $u) {
        $uEmail = strtolower($u['email'] ?? '');
        $uNisn = (string)($u['nisn'] ?? '');
        if (($uEmail === $identifier || $uNisn === $identifier) && $u['password'] === $password) {
            $matchedUser = $u;
            break;
        }
    }

    if (!$matchedUser) {
        jsonResponse(401, [
            'success' => false,
            'message' => 'Email/NISN atau kata sandi tidak valid.'
        ]);
    }

    $safeUser = [
        'id' => $matchedUser['id'],
        'name' => $matchedUser['name'],
        'email' => $matchedUser['email'],
        'role' => $matchedUser['role'],
        'nisn' => $matchedUser['nisn']
    ];

    jsonResponse(200, [
        'success' => true,
        'message' => 'Login berhasil',
        'data' => [
            'user' => $safeUser,
            'token' => 'sample_token_' . md5($safeUser['id'] . time())
        ]
    ]);
}

// 3. Auth: Register
if ($uri === '/api/auth/register' && $method === 'POST') {
    $name = trim($body['name'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));
    $nisn = trim($body['nisn'] ?? '');
    $password = $body['password'] ?? '';

    foreach ($db['users'] as $u) {
        if (strtolower($u['email'] ?? '') === $email) {
            jsonResponse(422, ['success' => false, 'message' => 'Email sudah terdaftar.']);
        }
        if ($nisn && ($u['nisn'] ?? '') === $nisn) {
            jsonResponse(422, ['success' => false, 'message' => 'NISN sudah terdaftar dalam sistem.']);
        }
    }

    $newUser = [
        'id' => round(microtime(true) * 1000),
        'name' => $name,
        'email' => $email,
        'nisn' => $nisn,
        'role' => 'siswa',
        'password' => $password,
        'created_at' => date('c')
    ];

    $db['users'][] = $newUser;
    writeDatabase($dbFilePath, $db);

    $safeUser = [
        'id' => $newUser['id'],
        'name' => $newUser['name'],
        'email' => $newUser['email'],
        'role' => $newUser['role'],
        'nisn' => $newUser['nisn']
    ];

    jsonResponse(201, [
        'success' => true,
        'message' => 'Registrasi siswa berhasil',
        'data' => $safeUser
    ]);
}

// 4. Students Stats
if ($uri === '/api/students/stats' && $method === 'GET') {
    $students = $db['students'];
    $total = count($students);

    $stats = [
        'total' => $total,
        'ekonomi' => [
            'sangatKurang' => count(array_filter($students, fn($s) => ($s['kategori_ekonomi'] ?? '') === 'Sangat Kurang')),
            'kurangMampu' => count(array_filter($students, fn($s) => ($s['kategori_ekonomi'] ?? '') === 'Kurang Mampu')),
            'menengah' => count(array_filter($students, fn($s) => ($s['kategori_ekonomi'] ?? '') === 'Menengah')),
            'mampu' => count(array_filter($students, fn($s) => ($s['kategori_ekonomi'] ?? '') === 'Mampu')),
        ],
        'statusKeluarga' => [
            'lengkap' => count(array_filter($students, fn($s) => ($s['status_keluarga'] ?? '') === 'Lengkap')),
            'yatim' => count(array_filter($students, fn($s) => ($s['status_keluarga'] ?? '') === 'Yatim')),
            'piatu' => count(array_filter($students, fn($s) => ($s['status_keluarga'] ?? '') === 'Piatu')),
            'yatimPiatu' => count(array_filter($students, fn($s) => ($s['status_keluarga'] ?? '') === 'Yatim Piatu')),
            'wali' => count(array_filter($students, fn($s) => in_array($s['status_keluarga'] ?? '', ['Menumpang', 'Bersama Wali']))),
        ],
        'statusRumah' => [
            'sendiri' => count(array_filter($students, fn($s) => ($s['status_rumah'] ?? '') === 'Milik Sendiri')),
            'sewa' => count(array_filter($students, fn($s) => ($s['status_rumah'] ?? '') === 'Sewa/Kontrak')),
            'menumpang' => count(array_filter($students, fn($s) => ($s['status_rumah'] ?? '') === 'Menumpang')),
            'dinas' => count(array_filter($students, fn($s) => ($s['status_rumah'] ?? '') === 'Rumah Dinas')),
        ],
        'penerimaBantuan' => count(array_filter($students, fn($s) => !empty($s['penerima_bantuan']) && $s['penerima_bantuan'] !== 'Tidak Ada'))
    ];
    $stats['prioritasBantuan'] = $stats['ekonomi']['sangatKurang'] + $stats['ekonomi']['kurangMampu'] + $stats['statusKeluarga']['yatim'] + $stats['statusKeluarga']['piatu'] + $stats['statusKeluarga']['yatimPiatu'];

    jsonResponse(200, ['success' => true, 'data' => $stats]);
}

// 5. Students List & Filter
if ($uri === '/api/students' && $method === 'GET') {
    $students = $db['students'];

    $search = $_GET['search'] ?? null;
    $ekonomi = $_GET['ekonomi'] ?? null;
    $status_keluarga = $_GET['status_keluarga'] ?? null;
    $status_rumah = $_GET['status_rumah'] ?? null;

    if ($search) {
        $q = strtolower($search);
        $students = array_values(array_filter($students, function($s) use ($q) {
            return (isset($s['nama_lengkap']) && str_contains(strtolower($s['nama_lengkap']), $q))
                || (isset($s['nisn']) && str_contains($s['nisn'], $q))
                || (isset($s['kelas']) && str_contains(strtolower($s['kelas']), $q))
                || (isset($s['kota_kabupaten']) && str_contains(strtolower($s['kota_kabupaten']), $q));
        }));
    }

    if ($ekonomi && $ekonomi !== 'Semua') {
        $students = array_values(array_filter($students, fn($s) => ($s['kategori_ekonomi'] ?? '') === $ekonomi));
    }

    if ($status_keluarga && $status_keluarga !== 'Semua') {
        if ($status_keluarga === 'Bersama Wali') {
            $students = array_values(array_filter($students, fn($s) => in_array($s['status_keluarga'] ?? '', ['Bersama Wali', 'Menumpang'])));
        } else {
            $students = array_values(array_filter($students, fn($s) => ($s['status_keluarga'] ?? '') === $status_keluarga));
        }
    }

    if ($status_rumah && $status_rumah !== 'Semua') {
        $students = array_values(array_filter($students, fn($s) => ($s['status_rumah'] ?? '') === $status_rumah));
    }

    jsonResponse(200, [
        'success' => true,
        'message' => 'Data siswa berhasil dimuat',
        'count' => count($students),
        'data' => $students
    ]);
}

// 6. Create Student
if ($uri === '/api/students' && $method === 'POST') {
    $ayah = floatval($body['penghasilan_ayah'] ?? 0);
    $ibu = floatval($body['penghasilan_ibu'] ?? 0);
    $total = floatval($body['penghasilan_total'] ?? ($ayah + $ibu));

    $katEkonomi = $body['kategori_ekonomi'] ?? '';
    if (empty($katEkonomi)) {
        if ($total <= 1000000) $katEkonomi = 'Sangat Kurang';
        elseif ($total <= 3000000) $katEkonomi = 'Kurang Mampu';
        elseif ($total <= 5000000) $katEkonomi = 'Menengah';
        else $katEkonomi = 'Mampu';
    }

    $newStudent = array_merge($body, [
        'id' => round(microtime(true) * 1000),
        'penghasilan_ayah' => $ayah,
        'penghasilan_ibu' => $ibu,
        'penghasilan_total' => $total,
        'jumlah_tanggungan' => intval($body['jumlah_tanggungan'] ?? 1),
        'kategori_ekonomi' => $katEkonomi,
        'status_verifikasi' => $body['status_verifikasi'] ?? 'Menunggu',
        'catatan_admin' => $body['catatan_admin'] ?? '',
        'created_at' => date('c')
    ]);

    array_unshift($db['students'], $newStudent);
    writeDatabase($dbFilePath, $db);

    jsonResponse(201, [
        'success' => true,
        'message' => 'Data siswa dan kondisi sosial ekonomi berhasil disimpan!',
        'data' => $newStudent
    ]);
}

// 7. Student Detail, Update, Delete: /api/students/{id}
if (preg_match('#^/api/students/(\d+)$#', $uri, $matches)) {
    $studentId = intval($matches[1]);
    $studentIndex = -1;

    foreach ($db['students'] as $idx => $s) {
        if (intval($s['id']) === $studentId) {
            $studentIndex = $idx;
            break;
        }
    }

    if ($method === 'GET') {
        if ($studentIndex === -1) {
            jsonResponse(404, ['success' => false, 'message' => 'Data siswa tidak ditemukan']);
        }
        jsonResponse(200, ['success' => true, 'data' => $db['students'][$studentIndex]]);
    }

    if ($method === 'PUT') {
        if ($studentIndex === -1) {
            jsonResponse(404, ['success' => false, 'message' => 'Data siswa tidak ditemukan']);
        }
        $db['students'][$studentIndex] = array_merge($db['students'][$studentIndex], $body, [
            'updated_at' => date('c')
        ]);
        writeDatabase($dbFilePath, $db);
        jsonResponse(200, [
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui',
            'data' => $db['students'][$studentIndex]
        ]);
    }

    if ($method === 'DELETE') {
        if ($studentIndex === -1) {
            jsonResponse(404, ['success' => false, 'message' => 'Data siswa tidak ditemukan']);
        }
        array_splice($db['students'], $studentIndex, 1);
        writeDatabase($dbFilePath, $db);
        jsonResponse(200, ['success' => true, 'message' => 'Data siswa berhasil dihapus']);
    }
}

// Default 404
jsonResponse(404, ['success' => false, 'message' => 'Endpoint tidak ditemukan']);
