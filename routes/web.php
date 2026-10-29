<?php

use App\Http\Controllers\KsmSurveyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/topik', function () {
    return Inertia::render('Topik', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('topik.index');

// Rute Survei Peminatan KSM untuk Mahasiswa
Route::get('/ksm/survey', [KsmSurveyController::class, 'create'])->name('ksm.survey.index');
Route::post('/ksm/survey', [KsmSurveyController::class, 'store'])->name('ksm.survey.store');

// Rute Khusus Admin HIMA IF (Wajib Login & Memiliki Role Admin)
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/ksm-survey', [KsmSurveyController::class, 'adminDashboard'])->name('admin.ksm.dashboard');
    Route::get('/admin/ksm-survey/export', [KsmSurveyController::class, 'exportCsv'])->name('admin.ksm.export');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
