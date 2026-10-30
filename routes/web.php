<?php

use App\Http\Controllers\KsmSurveyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
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
    Route::get('/admin/ksm-survey', function () {
        return redirect()->route('dashboard', ['tab' => 'ksm']);
    })->name('admin.ksm.dashboard');
    Route::get('/admin/ksm-survey/export', [KsmSurveyController::class, 'exportCsv'])->name('admin.ksm.export');
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    $ksmData = null;

    if ($user && $user->isAdmin()) {
        $ksmData = KsmSurveyController::getDashboardData($request->input('search'));
    }

    return Inertia::render('Dashboard', [
        'ksmData' => $ksmData,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
