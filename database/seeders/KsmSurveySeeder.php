<?php

namespace Database\Seeders;

use App\Models\KsmSurvey;
use Illuminate\Database\Seeder;

class KsmSurveySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (KsmSurvey::count() > 0) {
            return;
        }

        $sampleSurveys = [
            [
                'respondent_name' => 'Fajar Nugraha',
                'respondent_nim' => '230414001',
                'semester_course' => 'Web Framework',
                'interested_fields' => ['Web Development', 'Artificial Intelligence', 'DevOps'],
                'activity_types' => ['Workshop', 'Project bersama'],
                'learning_method' => 'Praktik langsung membuat project',
                'interest_scale' => 4,
                'preferred_days' => ['Jumat', 'Sabtu'],
                'preferred_time' => 'Sore',
                'feedback' => 'Mohon diagendakan studi kasus pembuatan website fullstack Laravel + React.',
            ],
            [
                'respondent_name' => 'Dewi Safitri',
                'respondent_nim' => '240414015',
                'semester_course' => 'Infrastruktur Teknologi Informasi',
                'interested_fields' => ['Cloud Computing', 'Cyber Security', 'DevOps'],
                'activity_types' => ['Mentoring', 'Workshop'],
                'learning_method' => 'Kombinasi teori dan praktik',
                'interest_scale' => 4,
                'preferred_days' => ['Sabtu'],
                'preferred_time' => 'Pagi',
                'feedback' => 'Bagus jika KSM mengundang alumni yang sudah berkarir di bidang DevOps & Cloud.',
            ],
            [
                'respondent_name' => 'Rizky Ramadhan',
                'respondent_nim' => '230414088',
                'semester_course' => 'Jaringan Komputer',
                'interested_fields' => ['Cyber Security', 'Internet of Things (IoT)'],
                'activity_types' => ['Kelas rutin', 'Sharing Session'],
                'learning_method' => 'Lebih banyak praktik',
                'interest_scale' => 3,
                'preferred_days' => ['Rabu', 'Jumat'],
                'preferred_time' => 'Malam',
                'feedback' => 'Sesi hands-on konfigurasi router dan simulasi jaringan di lab.',
            ],
            [
                'respondent_name' => 'Anisa Rahmawati',
                'respondent_nim' => '240414042',
                'semester_course' => 'Web Framework',
                'interested_fields' => ['UI/UX Design', 'Web Development', 'Mobile Development'],
                'activity_types' => ['Workshop', 'Bedah tugas'],
                'learning_method' => 'Praktik langsung membuat project',
                'interest_scale' => 4,
                'preferred_days' => ['Kamis', 'Sabtu'],
                'preferred_time' => 'Siang',
                'feedback' => 'Bikin challenge desain UI mingguan dengan feedback dari mentor.',
            ],
            [
                'respondent_name' => 'Budi Santoso',
                'respondent_nim' => '220414030',
                'semester_course' => 'Web Framework',
                'interested_fields' => ['Data Science', 'Artificial Intelligence'],
                'activity_types' => ['Study Group', 'Project bersama'],
                'learning_method' => 'Studi Kasus',
                'interest_scale' => 3,
                'preferred_days' => ['Senin', 'Kamis'],
                'preferred_time' => 'Sore',
                'feedback' => 'Fokus ke pengolahan dataset lokal dan model NLP sederhana.',
            ],
            [
                'respondent_name' => 'Muhammad Ilham',
                'respondent_nim' => '230414077',
                'semester_course' => 'Infrastruktur Teknologi Informasi',
                'interested_fields' => ['Game Development', 'Mobile Development'],
                'activity_types' => ['Kelas rutin', 'Mentoring'],
                'learning_method' => 'Lebih banyak praktik',
                'interest_scale' => 4,
                'preferred_days' => ['Selasa', 'Sabtu'],
                'preferred_time' => 'Malam',
                'feedback' => 'KSM bisa bikin showcase game indie karya anak IF sebelum wisuda.',
            ],
        ];

        foreach ($sampleSurveys as $survey) {
            KsmSurvey::create($survey);
        }
    }
}
