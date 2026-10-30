<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:'.User::class,
                'regex:/^[a-zA-Z0-9._%+-]+@(fellow\.)?lpkia\.ac\.id$/i',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'email.regex' => 'Pendaftaran wajib menggunakan email resmi kampus LPKIA (@fellow.lpkia.ac.id).',
        ]);

        $email = strtolower($request->email);
        $emailParts = explode('@', $email);
        $nim = is_numeric($emailParts[0]) ? $emailParts[0] : null;

        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'nim' => $nim,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Kirim email sambutan ke pendaftar dan notifikasi ke admin info@hmif-lpkia.my.id
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\UserRegisteredWelcomeMail($user));
            \Illuminate\Support\Facades\Mail::to('info@hmif-lpkia.my.id')->send(new \App\Mail\AdminNewUserRegisteredMail($user));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal mengirim email pendaftaran: ' . $e->getMessage());
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}

