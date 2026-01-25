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
        Schema::create('medical_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users');
            $table->foreignId('nurse_id')->nullable()->constrained('users');
            $table->string('status')->default('pending');
            $table->json('symptoms');
            $table->string('severity')->default('medium');
            $table->decimal('pickup_lat', 10, 8);
            $table->decimal('pickup_lng', 11, 8);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_requests');
    }
};
