<?php

namespace App\Services;

use App\Models\RewardSetting;

class RewardSettingsService
{
    public static function getSettings(): RewardSetting
    {
        return RewardSetting::query()->firstOrCreate([], [
            'red_points' => (int) config('rewards.points_by_severity.red', 1200),
            'amber_points' => (int) config('rewards.points_by_severity.amber', 800),
            'green_points' => (int) config('rewards.points_by_severity.green', 500),
            'points_per_token' => (int) config('rewards.points_per_token', 100),
            'token_symbol' => (string) config('rewards.token_symbol', 'ONC'),
        ]);
    }

    public static function toArray(): array
    {
        $settings = self::getSettings();

        return [
            'points_by_severity' => [
                'RED' => (int) $settings->red_points,
                'AMBER' => (int) $settings->amber_points,
                'GREEN' => (int) $settings->green_points,
            ],
            'points_per_token' => (int) $settings->points_per_token,
            'token_symbol' => (string) $settings->token_symbol,
        ];
    }
}
