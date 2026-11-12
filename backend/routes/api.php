<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - SIP Data Siswa
|--------------------------------------------------------------------------
*/

// Health check endpoint (digunakan frontend untuk cek apakah backend online)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'SIP Data Siswa Laravel API',
        'time' => now()->toIso8601String()
    ]);
});

// Autentikasi
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Data Siswa (CRUD & Filter)
Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/stats', [StudentController::class, 'stats']);
Route::post('/students', [StudentController::class, 'store']);
Route::get('/students/{id}', [StudentController::class, 'show']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);

