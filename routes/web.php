<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\KsmSurveyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Perlindungan Global Rate Limit (Mencegah request flood / scraping)
Route::middleware(['throttle:global'])->group(function () {
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

    // Rute Notifikasi Email Aspirasi ke Admin & Mahasiswa
    Route::post('/aspirasi/notify', [\App\Http\Controllers\AspirationNotificationController::class, 'notify'])
        ->middleware('throttle:forms')
        ->name('aspirasi.notify');

    // Rute API Aspirasi Mahasiswa
    Route::get('/api/aspirations', [\App\Http\Controllers\AspirationController::class, 'index'])->name('aspirations.index');
    Route::post('/api/aspirations', [\App\Http\Controllers\AspirationController::class, 'store'])
        ->middleware(['auth', 'throttle:forms'])
        ->name('aspirations.store');
    Route::post('/api/aspirations/{aspiration}/vote', [\App\Http\Controllers\AspirationController::class, 'vote'])->name('aspirations.vote');
    Route::post('/api/aspirations/{aspiration}/comments', [\App\Http\Controllers\AspirationController::class, 'comment'])
        ->middleware('throttle:forms')
        ->name('aspirations.comment');
    Route::delete('/api/aspirations/{aspiration}', [\App\Http\Controllers\AspirationController::class, 'destroy'])
        ->middleware('auth')
        ->name('aspirations.destroy');
    Route::delete('/api/aspirations/comments/{comment}', [\App\Http\Controllers\AspirationController::class, 'destroyComment'])
        ->middleware('auth')
        ->name('aspirations.comment.destroy');

    // Rute Survei Peminatan KSM untuk Mahasiswa (Wajib Login & Rate Limit)
    Route::middleware(['auth'])->group(function () {
        Route::get('/ksm/survey', [KsmSurveyController::class, 'create'])->name('ksm.survey.index');
        Route::post('/ksm/survey', [KsmSurveyController::class, 'store'])
            ->middleware('throttle:forms')
            ->name('ksm.survey.store');
    });


    // Rute Khusus Admin HIMA IF (Wajib Login & Memiliki Role Admin)
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/admin/ksm-survey', function () {
            return redirect()->route('dashboard', ['tab' => 'ksm']);
        })->name('admin.ksm.dashboard');
        Route::get('/admin/ksm-survey/export', [KsmSurveyController::class, 'exportCsv'])->name('admin.ksm.export');
        Route::delete('/admin/ksm-survey/{survey}', [KsmSurveyController::class, 'destroy'])->name('admin.ksm.destroy');

        // Manajemen Pengguna & Admin Baru
        Route::post('/admin/users', [AdminUserController::class, 'store'])
            ->middleware('throttle:forms')
            ->name('admin.users.store');
        Route::patch('/admin/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.updateRole');
        Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    });

    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();
        $ksmData = null;
        $usersData = null;

        if ($user && $user->isAdmin()) {
            $ksmData = KsmSurveyController::getDashboardData($request->input('search_ksm') ?: $request->input('search'));
            $usersData = AdminUserController::getUsersData($request->input('search_user') ?: $request->input('search'));
        }

        return Inertia::render('Dashboard', [
            'ksmData' => $ksmData,
            'usersData' => $usersData,
            'currentTab' => $request->query('tab', 'feed'),
        ]);
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::middleware('auth')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});

require __DIR__.'/auth.php';
