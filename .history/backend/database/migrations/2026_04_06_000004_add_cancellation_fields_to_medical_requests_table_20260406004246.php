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
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            $table->string('cancelled_by_role', 20)->nullable()->after('cancellation_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_requests', function (Blueprint $table) {
            $table->dropColumn(['cancelled_at', 'cancellation_reason', 'cancelled_by_role']);
        });
    }
};
