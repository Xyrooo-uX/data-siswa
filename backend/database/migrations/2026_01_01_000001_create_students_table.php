<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Biodata Siswa
            $table->string('nama_lengkap');
            $table->string('nisn', 20)->unique();
            $table->string('nik', 20)->nullable();
            $table->string('kelas', 20);
            $table->string('jurusan', 50);
            $table->string('jenis_kelamin', 20);
            $table->string('no_hp', 25)->nullable();

            // Kondisi Orang Tua & Status Keluarga
            $table->string('nama_ayah')->nullable();
            $table->string('pekerjaan_ayah')->nullable();
            $table->decimal('penghasilan_ayah', 15, 2)->default(0);
            $table->string('nama_ibu')->nullable();
            $table->string('pekerjaan_ibu')->nullable();
            $table->decimal('penghasilan_ibu', 15, 2)->default(0);
            $table->string('status_keluarga', 50)->default('Lengkap'); // Lengkap, Yatim, Piatu, Yatim Piatu, Bersama Wali

            // Kondisi Ekonomi
            $table->string('kategori_ekonomi', 50)->default('Kurang Mampu'); // Sangat Kurang, Kurang Mampu, Menengah, Mampu
            $table->decimal('penghasilan_total', 15, 2)->default(0);
            $table->integer('jumlah_tanggungan')->default(1);
            $table->string('penerima_bantuan', 50)->default('Tidak Ada'); // KIP, PKH, KKS, Tidak Ada

            // Status Rumah & Alamat Saat Ini
            $table->string('status_rumah', 50)->default('Milik Sendiri'); // Milik Sendiri, Sewa/Kontrak, Menumpang, Rumah Dinas
            $table->text('alamat_lengkap');
            $table->string('kelurahan_desa')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('kota_kabupaten')->nullable();
            $table->string('provinsi')->nullable();
            $table->text('foto_rumah')->nullable(); // URL atau path ke file foto rumah

            // Status Verifikasi Admin
            $table->string('status_verifikasi', 30)->default('Menunggu'); // Menunggu, Terverifikasi, Perlu Revisi
            $table->text('catatan_admin')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

