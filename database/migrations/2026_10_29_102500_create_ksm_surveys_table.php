<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ksm_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('respondent_name');
            $table->string('respondent_nim')->nullable();
            $table->string('semester_course'); // Matkul semester 3
            $table->json('interested_fields'); // Bidang yang ingin dipelajari (maks 3)
            $table->json('activity_types'); // Bentuk kegiatan (maks 2)
            $table->string('learning_method'); // Metode belajar
            $table->unsignedTinyInteger('interest_scale'); // 1 - 4
            $table->json('preferred_days'); // Hari (maks 2)
            $table->string('preferred_time'); // Pagi / Siang / Sore / Malam
            $table->text('feedback')->nullable(); // Saran atau ide lain
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ksm_surveys');
    }
};
