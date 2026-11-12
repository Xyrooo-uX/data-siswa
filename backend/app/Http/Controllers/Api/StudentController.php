<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Menampilkan daftar semua siswa dengan filter:
     * - ekonomi
     * - status_keluarga
     * - status_rumah
     * - search (nama, nisn, kelas)
     */
    public function index(Request $request)
    {
        $query = Student::query();

        // 1. Filter Kategori Ekonomi
        if ($request->filled('ekonomi') && $request->ekonomi !== 'Semua') {
            $query->where('kategori_ekonomi', $request->ekonomi);
        }

        // 2. Filter Status Keluarga
        if ($request->filled('status_keluarga') && $request->status_keluarga !== 'Semua') {
            $query->where('status_keluarga', $request->status_keluarga);
        }

        // 3. Filter Status Rumah
        if ($request->filled('status_rumah') && $request->status_rumah !== 'Semua') {
            $query->where('status_rumah', $request->status_rumah);
        }

        // 4. Pencarian Teks
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('kelas', 'like', "%{$search}%")
                  ->orWhere('kota_kabupaten', 'like', "%{$search}%");
            });
        }

        $students = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil dimuat',
            'count' => $students->count(),
            'data' => $students
        ]);
    }

    /**
     * Menyimpan data siswa baru beserta upload foto rumah.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nisn' => 'required|string|max:20|unique:students,nisn',
            'kelas' => 'required|string|max:20',
            'jurusan' => 'required|string|max:100',
            'jenis_kelamin' => 'required|string',
            'no_hp' => 'nullable|string|max:25',
            
            // Orang tua & status keluarga
            'nama_ayah' => 'nullable|string|max:255',
            'pekerjaan_ayah' => 'nullable|string|max:255',
            'penghasilan_ayah' => 'nullable|numeric',
            'nama_ibu' => 'nullable|string|max:255',
            'pekerjaan_ibu' => 'nullable|string|max:255',
            'penghasilan_ibu' => 'nullable|numeric',
            'status_keluarga' => 'required|string', // Lengkap, Yatim, Piatu, Yatim Piatu, Bersama Wali
            
            // Ekonomi
            'kategori_ekonomi' => 'required|string', // Sangat Kurang, Kurang Mampu, Menengah, Mampu
            'penghasilan_total' => 'nullable|numeric',
            'jumlah_tanggungan' => 'nullable|integer',
            'penerima_bantuan' => 'nullable|string',

            // Rumah & Alamat
            'status_rumah' => 'required|string', // Milik Sendiri, Sewa/Kontrak, Menumpang, Rumah Dinas
            'alamat_lengkap' => 'required|string',
            'kelurahan_desa' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kota_kabupaten' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'foto_rumah' => 'nullable', // bisa file upload atau base64 string
        ]);

        // Hitung total penghasilan otomatis jika kosong
        if (!isset($validated['penghasilan_total']) || empty($validated['penghasilan_total'])) {
            $ayah = floatval($request->input('penghasilan_ayah', 0));
            $ibu = floatval($request->input('penghasilan_ibu', 0));
            $validated['penghasilan_total'] = $ayah + $ibu;
        }

        // Tentukan kategori ekonomi otomatis jika belum dipilih secara spesifik
        if (empty($validated['kategori_ekonomi'])) {
            $total = $validated['penghasilan_total'];
            if ($total <= 1000000) {
                $validated['kategori_ekonomi'] = 'Sangat Kurang';
            } elseif ($total <= 3000000) {
                $validated['kategori_ekonomi'] = 'Kurang Mampu';
            } elseif ($total <= 5000000) {
                $validated['kategori_ekonomi'] = 'Menengah';
            } else {
                $validated['kategori_ekonomi'] = 'Mampu';
            }
        }

        // Handle File Foto Rumah jika diupload sebagai file binary
        if ($request->hasFile('foto_rumah_file')) {
            $file = $request->file('foto_rumah_file');
            $filename = 'rumah_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/rumah', $filename);
            $validated['foto_rumah'] = Storage::url($path);
        } elseif ($request->filled('foto_rumah') && Str::startsWith($request->foto_rumah, 'data:image')) {
            // Handle base64 image
            $image_parts = explode(";base64,", $request->foto_rumah);
            if (count($image_parts) === 2) {
                $image_type_aux = explode("image/", $image_parts[0]);
                $image_type = $image_type_aux[1] ?? 'jpg';
                $image_base64 = base64_decode($image_parts[1]);
                $filename = 'rumah_' . time() . '_' . Str::random(8) . '.' . $image_type;
                Storage::disk('public')->put('rumah/' . $filename, $image_base64);
                $validated['foto_rumah'] = Storage::url('rumah/' . $filename);
            }
        }

        $student = Student::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data siswa dan kondisi sosial ekonomi berhasil disimpan!',
            'data' => $student
        ], 201);
    }

    /**
     * Menampilkan detail satu siswa.
     */
    public function show(string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Memperbarui data siswa atau status verifikasi admin.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        $student->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui',
            'data' => $student
        ]);
    }

    /**
     * Menghapus data siswa.
     */
    public function destroy(string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil dihapus'
        ]);
    }

    /**
     * Mengembalikan ringkasan statistik untuk dashboard admin.
     */
    public function stats()
    {
        $total = Student::count();

        $ekonomi = [
            'sangatKurang' => Student::where('kategori_ekonomi', 'Sangat Kurang')->count(),
            'kurangMampu' => Student::where('kategori_ekonomi', 'Kurang Mampu')->count(),
            'menengah' => Student::where('kategori_ekonomi', 'Menengah')->count(),
            'mampu' => Student::where('kategori_ekonomi', 'Mampu')->count(),
        ];

        $statusKeluarga = [
            'lengkap' => Student::where('status_keluarga', 'Lengkap')->count(),
            'yatim' => Student::where('status_keluarga', 'Yatim')->count(),
            'piatu' => Student::where('status_keluarga', 'Piatu')->count(),
            'yatimPiatu' => Student::where('status_keluarga', 'Yatim Piatu')->count(),
            'wali' => Student::whereIn('status_keluarga', ['Menumpang', 'Bersama Wali'])->count(),
        ];

        $statusRumah = [
            'sendiri' => Student::where('status_rumah', 'Milik Sendiri')->count(),
            'sewa' => Student::where('status_rumah', 'Sewa/Kontrak')->count(),
            'menumpang' => Student::where('status_rumah', 'Menumpang')->count(),
            'dinas' => Student::where('status_rumah', 'Rumah Dinas')->count(),
        ];

        $penerimaBantuan = Student::where('penerima_bantuan', '!=', 'Tidak Ada')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'ekonomi' => $ekonomi,
                'statusKeluarga' => $statusKeluarga,
                'statusRumah' => $statusRumah,
                'penerimaBantuan' => $penerimaBantuan,
                'prioritasBantuan' => $ekonomi['sangatKurang'] + $ekonomi['kurangMampu'] + $statusKeluarga['yatim'] + $statusKeluarga['piatu'] + $statusKeluarga['yatimPiatu'],
            ]
        ]);
    }
}

