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
        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->string('account_status')->default('active')->after('is_online');
            $table->timestamp('suspended_until')->nullable()->after('account_status');
            $table->text('status_reason')->nullable()->after('suspended_until');
            $table->timestamp('status_changed_at')->nullable()->after('status_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->dropColumn(['account_status', 'suspended_until', 'status_reason', 'status_changed_at']);
        });
    }
};
