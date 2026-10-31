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
        Schema::create('aspirations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('category', 100);
            $table->text('content');
            $table->string('author_name', 100);
            $table->string('author_nim', 50)->nullable();
            $table->string('author_class', 50)->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('status', 30)->default('baru');
            $table->boolean('is_ksm_agenda')->default(false);
            $table->string('ksm_docket_number', 50)->nullable();
            $table->string('ksm_pleno_schedule')->nullable();
            $table->unsignedInteger('votes_count')->default(0);
            $table->timestamps();

            $table->index('created_at');
            $table->index('votes_count');
        });

        Schema::create('aspiration_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aspiration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('voter_key', 120);
            $table->timestamps();

            $table->unique(['aspiration_id', 'voter_key']);
        });

        Schema::create('aspiration_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aspiration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name', 100);
            $table->string('author_nim', 50)->nullable();
            $table->string('author_role', 100)->nullable();
            $table->boolean('is_official')->default(false);
            $table->text('content');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aspiration_comments');
        Schema::dropIfExists('aspiration_votes');
        Schema::dropIfExists('aspirations');
    }
};
