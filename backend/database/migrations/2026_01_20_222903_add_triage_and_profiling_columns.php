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
        Schema::table('medical_requests', function (Blueprint $table) {
            $table->string('triage_level')->nullable(); // Red, Amber, Green
            $table->string('age_group')->nullable(); // Adult, Child, Infant
            $table->boolean('is_conscious')->default(true);
            $table->text('history_notes')->nullable();
        });

        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->integer('verification_level')->default(1); // 1=Identity, 2=License, 3=Vetted
            $table->string('transport_mode')->nullable(); // Car, Bike, Walk
            $table->json('competence_areas')->nullable(); // ['Trauma', 'Pediatrics']
            $table->integer('experience_years')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_requests', function (Blueprint $table) {
            $table->dropColumn(['triage_level', 'age_group', 'is_conscious', 'history_notes']);
        });

        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->dropColumn(['verification_level', 'transport_mode', 'competence_areas', 'experience_years']);
        });
    }
};
