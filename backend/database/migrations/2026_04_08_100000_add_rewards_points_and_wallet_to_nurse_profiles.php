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
            $table->unsignedBigInteger('reward_points_balance')->default(0)->after('earnings');
            $table->unsignedBigInteger('reward_points_lifetime')->default(0)->after('reward_points_balance');
            $table->unsignedBigInteger('reward_points_withdrawn')->default(0)->after('reward_points_lifetime');
            $table->string('spl_wallet_address', 64)->nullable()->after('reward_points_withdrawn');
        });

        Schema::table('medical_requests', function (Blueprint $table) {
            $table->unsignedInteger('reward_points_awarded')->default(0)->after('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_requests', function (Blueprint $table) {
            $table->dropColumn('reward_points_awarded');
        });

        Schema::table('nurse_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'reward_points_balance',
                'reward_points_lifetime',
                'reward_points_withdrawn',
                'spl_wallet_address',
            ]);
        });
    }
};
