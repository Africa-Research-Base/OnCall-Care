<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\NurseController;
use App\Http\Controllers\NurseRewardsController;
use App\Http\Controllers\AdminRewardSettingsController;
use App\Http\Controllers\AdminUserManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NurseManagementController;

// Public Routes
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user()->load('nurseProfile');
    });
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::get('/medical-profile', [AuthController::class, 'medicalProfile']);
    Route::put('/medical-profile', [AuthController::class, 'updateMedicalProfile']);
    Route::patch('/medical-profile', [AuthController::class, 'updateMedicalProfile']);
    Route::apiResource('addresses', \App\Http\Controllers\AddressController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Request Actions
    Route::post('/request/create', [RequestController::class, 'create']);
    Route::get('/request/{id}', [RequestController::class, 'show']);
    Route::post('/request/{id}/accept', [RequestController::class, 'accept']);
    Route::post('/request/{id}/status', [RequestController::class, 'updateStatus']);
    Route::post('/request/{id}/cancel', [RequestController::class, 'cancel']);

    // Nurse Actions
    Route::post('/nurse/apply', [NurseController::class, 'apply']);
    Route::get('/nurse/application', [NurseController::class, 'applicationStatus']);
    Route::post('/nurse/status', [NurseController::class, 'toggleOnline']);
    Route::post('/nurse/location', [NurseController::class, 'updateLocation']);
    Route::get('/nurse/requests/pending', [RequestController::class, 'getPendingRequests']);
    Route::get('/nurse/rewards', [NurseRewardsController::class, 'show']);
    Route::post('/nurse/wallet/connect', [NurseRewardsController::class, 'connectWallet']);
    Route::post('/nurse/rewards/withdraw', [NurseRewardsController::class, 'withdraw']);

    // Admin Actions
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminUserManagementController::class, 'dashboard']);
        Route::get('/users', [AdminUserManagementController::class, 'users']);
        Route::post('/users/{user}/promote-nurse', [AdminUserManagementController::class, 'approveNurse']);
        Route::post('/users/{user}/reject-nurse', [AdminUserManagementController::class, 'rejectNurse']);
        Route::post('/users/{user}/make-admin', [AdminUserManagementController::class, 'makeAdmin']);
        Route::get('/nurse-applications', [AdminUserManagementController::class, 'pendingNurseApplications']);
        Route::get('/nurses', [AdminUserManagementController::class, 'nurses']);
        Route::get('/nurses/{user}', [AdminUserManagementController::class, 'showNurse']);
        Route::put('/nurses/{user}', [AdminUserManagementController::class, 'updateNurse']);
        Route::patch('/nurses/{user}', [AdminUserManagementController::class, 'updateNurse']);
        Route::post('/nurses/{user}/verify', [AdminUserManagementController::class, 'approveNurse']);
        Route::post('/nurses/{user}/suspend', [AdminUserManagementController::class, 'suspendNurse']);
        Route::post('/nurses/{user}/ban', [AdminUserManagementController::class, 'banNurse']);
        Route::post('/nurses/{user}/activate', [AdminUserManagementController::class, 'activateNurse']);
        Route::delete('/nurses/{user}', [AdminUserManagementController::class, 'deleteNurse']);
        Route::get('/audit-logs', [AdminUserManagementController::class, 'auditLogs']);

        Route::get('/rewards/settings', [AdminRewardSettingsController::class, 'show']);
        Route::put('/rewards/settings', [AdminRewardSettingsController::class, 'update']);

        // Hospital Management Routes
        Route::get('/hospitals', [NurseManagementController::class, 'getHospitals']);
        Route::post('/hospitals', [NurseManagementController::class, 'createHospital']);
        Route::put('/hospitals/{hospital}', [NurseManagementController::class, 'updateHospital']);
        Route::post('/hospitals/{hospital}/verify', [NurseManagementController::class, 'verifyHospital']);

        // Nurse Management Routes (creation with default password)
        Route::post('/nurses/create', [NurseManagementController::class, 'createNurse']);
        Route::put('/nurses/{user}/update', [NurseManagementController::class, 'updateNurse']);
        Route::post('/nurses/{user}/verify', [NurseManagementController::class, 'verifyNurse']);
        Route::get('/hospitals/{hospital}/nurses', [NurseManagementController::class, 'getNursesByHospital']);
    });
});
