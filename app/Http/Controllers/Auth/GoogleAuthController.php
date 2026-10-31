<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect ke halaman login Google OAuth dengan pembatasan domain fellow.lpkia.ac.id
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->with(['hd' => 'fellow.lpkia.ac.id'])
            ->redirect();
    }

    /**
     * Callback dari Google setelah user menyetujui akses
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal terhubung dengan akun Google. Silakan coba lagi.',
            ]);
        }

        $email = strtolower($googleUser->getEmail());

        // Validasi ketat domain email kampus LPKIA
        if (! str_ends_with($email, '@fellow.lpkia.ac.id') && ! str_ends_with($email, '@lpkia.ac.id')) {
            return redirect()->route('login')->withErrors([
                'email' => 'Akses ditolak! Wajib menggunakan akun Google resmi mahasiswa LPKIA (@fellow.lpkia.ac.id).',
            ]);
        }

        // Ekstrak NIM dari bagian depan email (misal: 250414010 dari 250414010@fellow.lpkia.ac.id)
        $emailParts = explode('@', $email);
        $nim = is_numeric($emailParts[0]) ? $emailParts[0] : null;

        // Cari atau buat user baru
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $email)
            ->first();

        if ($user) {
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'nim' => $user->nim ?? $nim,
            ]);
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?? $emailParts[0],
                'email' => $email,
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'nim' => $nim,
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        // Single Session Protection: Invalidate sesi lama di perangkat lain
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', request()->session()->getId())
            ->delete();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
