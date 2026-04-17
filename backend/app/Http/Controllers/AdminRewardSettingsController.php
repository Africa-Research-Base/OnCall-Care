<?php

namespace App\Http\Controllers;

use App\Services\RewardSettingsService;
use Illuminate\Http\Request;

class AdminRewardSettingsController extends Controller
{
    public function show()
    {
        return response()->json([
            'settings' => RewardSettingsService::toArray(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'points_by_severity' => 'required|array',
            'points_by_severity.RED' => 'required|integer|min:1|max:1000000',
            'points_by_severity.AMBER' => 'required|integer|min:1|max:1000000',
            'points_by_severity.GREEN' => 'required|integer|min:1|max:1000000',
            'points_per_token' => 'required|integer|min:1|max:100000000',
            'token_symbol' => 'required|string|min:1|max:16',
        ]);

        $settings = RewardSettingsService::getSettings();

        $settings->update([
            'red_points' => (int) $validated['points_by_severity']['RED'],
            'amber_points' => (int) $validated['points_by_severity']['AMBER'],
            'green_points' => (int) $validated['points_by_severity']['GREEN'],
            'points_per_token' => (int) $validated['points_per_token'],
            'token_symbol' => strtoupper(trim((string) $validated['token_symbol'])),
        ]);

        return response()->json([
            'message' => 'Reward settings updated successfully.',
            'settings' => RewardSettingsService::toArray(),
        ]);
    }
}
