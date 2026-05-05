<?php


use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminHospitalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

Route::prefix('admin')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
        Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
    });

    Route::middleware('auth')->post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/activities', [AdminController::class, 'activities'])->name('admin.activities');
    Route::get('/requests/cancelled', [AdminController::class, 'cancelledRequests'])->name('admin.requests.cancelled');
    
    // Original Nurse Routes
    Route::get('/nurses', [AdminController::class, 'nurses'])->name('admin.nurses');
    Route::get('/nurses/{user}', [AdminController::class, 'showNurse'])->name('admin.nurses.show');
    Route::get('/nurses/{user}/edit', [AdminController::class, 'editNurse'])->name('admin.nurses.edit');
    Route::put('/nurses/{user}', [AdminController::class, 'updateNurse'])->name('admin.nurses.update');
    Route::post('/nurses/{user}/verify', [AdminController::class, 'verifyNurse'])->name('admin.nurses.verify');
    Route::post('/nurses/{user}/reject', [AdminController::class, 'rejectNurse'])->name('admin.nurses.reject');
    Route::post('/nurses/{user}/suspend', [AdminController::class, 'suspendNurse'])->name('admin.nurses.suspend');
    Route::post('/nurses/{user}/ban', [AdminController::class, 'banNurse'])->name('admin.nurses.ban');
    Route::post('/nurses/{user}/activate', [AdminController::class, 'activateNurse'])->name('admin.nurses.activate');
    Route::delete('/nurses/{user}', [AdminController::class, 'deleteNurse'])->name('admin.nurses.delete');

    // Hospital Management Routes
    Route::get('/hospitals', [AdminHospitalController::class, 'hospitals'])->name('admin.hospitals');
    Route::get('/hospitals/create', [AdminHospitalController::class, 'createHospitalForm'])->name('admin.hospitals.create');
    Route::post('/hospitals', [AdminHospitalController::class, 'storeHospital'])->name('admin.hospitals.store');
    Route::get('/hospitals/{hospital}/edit', [AdminHospitalController::class, 'editHospitalForm'])->name('admin.hospitals.edit');
    Route::put('/hospitals/{hospital}', [AdminHospitalController::class, 'updateHospital'])->name('admin.hospitals.update');
    Route::post('/hospitals/{hospital}/verify', [AdminHospitalController::class, 'verifyHospital'])->name('admin.hospitals.verify');
    Route::get('/hospitals/{hospital}/nurses', [AdminHospitalController::class, 'hospitalNurses'])->name('admin.hospitals.nurses');

    // New Nurse Management Routes (create with password)
    Route::get('/nurses-manage', [AdminHospitalController::class, 'nurses'])->name('admin.nurses.manage');
    Route::get('/nurses-manage/create', [AdminHospitalController::class, 'createNurseForm'])->name('admin.nurses.manage.create');
    Route::post('/nurses-manage', [AdminHospitalController::class, 'storeNurse'])->name('admin.nurses.manage.store');
    Route::get('/nurses-manage/{nurse}/edit', [AdminHospitalController::class, 'editNurseForm'])->name('admin.nurses.manage.edit');
    Route::put('/nurses-manage/{nurse}', [AdminHospitalController::class, 'updateNurse'])->name('admin.nurses.manage.update');
    Route::post('/nurses-manage/{nurse}/verify', [AdminHospitalController::class, 'verifyNurse'])->name('admin.nurses.manage.verify');
    Route::post('/nurses-manage/{nurse}/reset-password', [AdminHospitalController::class, 'resetNursePassword'])->name('admin.nurses.manage.reset-password');
    Route::post('/nurses-manage/{nurse}/suspend', [AdminHospitalController::class, 'suspendNurse'])->name('admin.nurses.manage.suspend');
});
