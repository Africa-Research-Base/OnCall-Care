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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('role');
            $table->string('blood_group')->nullable()->after('phone');
            $table->text('allergies')->nullable()->after('blood_group');
            $table->text('medical_conditions')->nullable()->after('allergies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'blood_group', 'allergies', 'medical_conditions']);
        });
    }
};
