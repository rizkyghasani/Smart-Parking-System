<?php

use App\Http\Controllers\Api\ParkingController;
use App\Http\Controllers\Api\Admin\AuthController; // ← 1. Import AuthController Admin
use App\Http\Controllers\Api\Admin\RevenueConfigController;
use App\Http\Controllers\Api\Admin\StaffManagementController;
use App\Http\Controllers\Api\Admin\AdminSlotManagementController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Customer\AuthCustomerController;
use App\Http\Controllers\Api\Customer\CustomerDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rute-rute ini secara otomatis memiliki prefix "/api" via Laravel 11.
|
*/

// Route default (Sanctum) - Biarkan saja jika nanti butuh login
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/**
 * SMART PARKING SYSTEM ROUTES
 * Semua rute di dalam grup ini akan diawali dengan /api/parking/
 */
Route::prefix('parking')->group(function () {
    
    // 1. Mendapatkan semua data slot
    Route::get('/slots', [ParkingController::class, 'getSlots']);

    // 2. Simulasi Tap-In User
    Route::post('/tap-in', [ParkingController::class, 'tapIn']);

    // 3. Endpoint Validasi dari AI Service (FastAPI)
    Route::post('/validate', [ParkingController::class, 'validateSlot']);

    // 4. Endpoint Tap-Out untuk simulasi keluar
    Route::post('/tap-out', [ParkingController::class, 'tapOut']);
});

/**
 * 🔐 ADMIN & STAFF AUTHENTICATION ROUTES
 * Semua rute di dalam grup ini akan diawali dengan /api/admin/auth/
 */
Route::prefix('admin/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/**
 * 💼 Grup 2: Khusus Manajemen & Operasional Sistem Admin
 * URL: /api/admin/...
 */
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);   

    Route::get('/revenue-config', [RevenueConfigController::class, 'index']); // ← Tambahkan Baris Ini
    Route::get('/revenue-config/latest', [RevenueConfigController::class, 'getLatest']);
    Route::post('/revenue-config', [RevenueConfigController::class, 'store']);

    // 👥 Rute Baru: Manajemen Akun Petugas/Staff
    Route::get('/staff', [StaffManagementController::class, 'index']);
    Route::post('/staff', [StaffManagementController::class, 'store']);
    Route::patch('/staff/{id}/toggle-status', [StaffManagementController::class, 'toggleStatus']);

    // ⚙️ Rute Baru: Sakelar Status Slot Parkir
    Route::get('/slots', [AdminSlotManagementController::class, 'index']);
    Route::post('/slots', [AdminSlotManagementController::class, 'store']);
    Route::put('/slots/{id}', [AdminSlotManagementController::class, 'update']);
    Route::delete('/slots/{id}', [AdminSlotManagementController::class, 'destroy']);
    Route::patch('/slots/{id}/status', [AdminSlotManagementController::class, 'updateStatus']);

    Route::get('/members/customers', [MemberController::class, 'index']); // List & Search
    Route::get('/members/customers/{id}', [MemberController::class, 'show']); // Detail Profil
    Route::post('/members/customers/{id}/toggle', [MemberController::class, 'toggleMembership']); // Aktivasi/Deaktivasi
    Route::delete('/members/{id}', [MemberController::class, 'destroy']); // Hapus Permanen

});

Route::prefix('customer')->group(function () {
    Route::post('/register', [AuthCustomerController::class, 'register']);
    Route::post('/login', [AuthCustomerController::class, 'login']);
    
    // Rute yang butuh login
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthCustomerController::class, 'logout']);
        Route::get('/dashboard', [CustomerDashboardController::class, 'index']); // ← Rute dashboard yang kita bahas tadi
    });
});