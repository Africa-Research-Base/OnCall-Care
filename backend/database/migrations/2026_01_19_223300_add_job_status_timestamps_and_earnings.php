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
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('completed_at')->nullable();
        });

        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->decimal('earnings', 10, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_requests', function (Blueprint $table) {
            $table->dropColumn(['arrived_at', 'completed_at']);
        });

        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->dropColumn('earnings');
        });
    }
};
