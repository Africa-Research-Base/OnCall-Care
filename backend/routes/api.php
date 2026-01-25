<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\NurseController;

// Public Routes
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    
    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user()->load('nurseProfile');
    });
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::apiResource('addresses', \App\Http\Controllers\AddressController::class);

    // Request Actions
    Route::post('/request/create', [RequestController::class, 'create']);
    Route::get('/request/{id}', [RequestController::class, 'show']);
    Route::post('/request/{id}/accept', [RequestController::class, 'accept']);
    Route::post('/request/{id}/status', [RequestController::class, 'updateStatus']);

    // Nurse Actions
    Route::post('/nurse/status', [NurseController::class, 'toggleOnline']);
    Route::post('/nurse/location', [NurseController::class, 'updateLocation']);
    Route::get('/nurse/requests/pending', [RequestController::class, 'getPendingRequests']);
});
