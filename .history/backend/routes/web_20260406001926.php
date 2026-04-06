<?php


use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

Route::prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/activities', [AdminController::class, 'activities'])->name('admin.activities');
    Route::get('/nurses', [AdminController::class, 'nurses'])->name('admin.nurses');
    Route::get('/nurses/{user}', [AdminController::class, 'showNurse'])->name('admin.nurses.show');
    Route::get('/nurses/{user}/edit', [AdminController::class, 'editNurse'])->name('admin.nurses.edit');
    Route::put('/nurses/{user}', [AdminController::class, 'updateNurse'])->name('admin.nurses.update');
    Route::post('/nurses/{user}/verify', [AdminController::class, 'verifyNurse'])->name('admin.nurses.verify');
    Route::post('/nurses/{user}/suspend', [AdminController::class, 'suspendNurse'])->name('admin.nurses.suspend');
    Route::post('/nurses/{user}/ban', [AdminController::class, 'banNurse'])->name('admin.nurses.ban');
    Route::post('/nurses/{user}/activate', [AdminController::class, 'activateNurse'])->name('admin.nurses.activate');
    Route::delete('/nurses/{user}', [AdminController::class, 'deleteNurse'])->name('admin.nurses.delete');
});
