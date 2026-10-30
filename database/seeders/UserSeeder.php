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
        // 1. Akun Utama Super Admin
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

        // 2. Akun Dummy Admin 1
        User::updateOrCreate(
            ['email' => 'admin1@fellow.lpkia.ac.id'],
            [
                'name' => 'Admin Dummy 1',
                'nim' => '250414001',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 3. Akun Dummy Admin 2
        User::updateOrCreate(
            ['email' => 'admin2@fellow.lpkia.ac.id'],
            [
                'name' => 'Admin Dummy 2',
                'nim' => '250414002',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
