<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login untuk Admin atau Siswa.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        // Cek login via email atau via NISN
        $user = User::where('email', $request->email)
                    ->orWhere('nisn', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/NISN atau kata sandi tidak valid.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role, // 'admin' atau 'siswa'
                    'nisn' => $user->nisn,
                ],
                'token' => 'sample_token_' . md5($user->id . time()),
            ]
        ]);
    }

    /**
     * Registrasi akun siswa baru.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nisn' => 'required|string|max:20|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*\p{L})(?=.*\p{N})(?=.*[^\p{L}\p{N}\s]).{8,}$/u',
            ],
        ], [
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.regex' => 'Kata sandi harus memuat huruf, angka, dan simbol.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nisn' => $validated['nisn'],
            'role' => 'siswa',
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi siswa berhasil',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'nisn' => $user->nisn,
            ]
        ], 201);
    }
}

