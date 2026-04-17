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
        Schema::create('reward_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('red_points')->default(1200);
            $table->unsignedInteger('amber_points')->default(800);
            $table->unsignedInteger('green_points')->default(500);
            $table->unsignedInteger('points_per_token')->default(100);
            $table->string('token_symbol', 16)->default('ONC');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_settings');
    }
};
