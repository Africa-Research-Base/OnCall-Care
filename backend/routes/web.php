<?php


use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return redirect('/admin');
});

Route::prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/activities', [AdminController::class, 'activities'])->name('admin.activities');
    Route::get('/nurses', [AdminController::class, 'nurses'])->name('admin.nurses');
});
