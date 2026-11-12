<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_lengkap',
        'nisn',
        'nik',
        'kelas',
        'jurusan',
        'jenis_kelamin',
        'no_hp',
        'nama_ayah',
        'pekerjaan_ayah',
        'penghasilan_ayah',
        'nama_ibu',
        'pekerjaan_ibu',
        'penghasilan_ibu',
        'status_keluarga',
        'kategori_ekonomi',
        'penghasilan_total',
        'jumlah_tanggungan',
        'penerima_bantuan',
        'status_rumah',
        'alamat_lengkap',
        'kelurahan_desa',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'foto_rumah',
        'status_verifikasi',
        'catatan_admin',
    ];

    protected $casts = [
        'penghasilan_ayah' => 'decimal:2',
        'penghasilan_ibu' => 'decimal:2',
        'penghasilan_total' => 'decimal:2',
        'jumlah_tanggungan' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

