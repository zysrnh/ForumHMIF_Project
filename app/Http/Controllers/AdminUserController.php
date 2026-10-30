<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Ambil data statistik dan daftar pengguna untuk dashboard admin.
     */
    public static function getUsersData(?string $search = null): array
    {
        $query = User::query()->orderBy('id', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        $allUsers = User::all();
        $totalUsers = $allUsers->count();
        $superAdminCount = $allUsers->whereIn('role', ['super_admin', 'superadmin'])->count();
        $adminCount = $allUsers->where('role', 'admin')->count();
        $mahasiswaCount = $totalUsers - ($superAdminCount + $adminCount);

        return [
            'users' => $query->paginate(15)->withQueryString(),
            'stats' => [
                'total' => $totalUsers,
                'super_admin' => $superAdminCount,
                'admin' => $adminCount,
                'mahasiswa' => max(0, $mahasiswaCount),
            ],
        ];
    }

    /**
     * Buat akun admin atau pengurus baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nim' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in(['admin', 'super_admin', 'mahasiswa'])],
        ], [
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.min' => 'Password minimal harus 6 karakter.',
            'role.in' => 'Role yang dipilih tidak valid.',
        ]);

        User::create([
            'name' => $validated['name'],
            'nim' => $validated['nim'] ?: null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'email_verified_at' => now(),
        ]);

        return redirect()->route('dashboard', ['tab' => 'users'])->with('success', 'Akun admin/pengguna baru berhasil dibuat!');
    }

    /**
     * Update role pengguna (misal: angkat jadi admin atau turunkan ke mahasiswa).
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(['admin', 'super_admin', 'mahasiswa'])],
        ]);

        // Cegah pengguna mencabut hak akses super admin dirinya sendiri secara tidak sengaja
        if ($user->id === Auth::id() && $validated['role'] !== $user->role) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengubah role akun Anda sendiri.');
        }

        $user->update([
            'role' => $validated['role'],
        ]);

        return redirect()->route('dashboard', ['tab' => 'users'])->with('success', "Role untuk {$user->name} berhasil diperbarui.");
    }

    /**
     * Hapus akun pengguna.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->route('dashboard', ['tab' => 'users'])->with('success', "Akun {$userName} berhasil dihapus.");
    }
}
