<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Admin
        User::firstOrCreate(
            ['email' => 'admin@sekolah.sch.id'],
            [
                'name' => 'Administrator Sekolah',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // 2. Akun Siswa Awal untuk Login
        User::firstOrCreate(
            ['email' => 'siswa@sekolah.sch.id'],
            [
                'name' => 'Siswa Baru',
                'nisn' => '0068192341',
                'role' => 'siswa',
                'password' => Hash::make('siswa123'),
            ]
        );

        // Catatan: Data siswa dan foto tempat tinggal dibiarkan kosong
        // agar pengguna dapat menginputkan datanya sendiri secara mandiri.
    }
}
