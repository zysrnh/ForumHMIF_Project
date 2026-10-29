<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Akun Super Admin HIMA IF
        User::updateOrCreate(
            ['email' => '250414010@fellow.lpkia.ac.id'],
            [
                'name' => 'ZAKI YUSRON HASYIMMI',
                'nim' => '250414010',
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // Akun Mahasiswa Tambahan untuk Testing
        User::updateOrCreate(
            ['email' => '250414011@fellow.lpkia.ac.id'],
            [
                'name' => 'Siti Rahma',
                'nim' => '250414011',
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
                'email_verified_at' => now(),
            ]
        );
    }
}
