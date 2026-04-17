<?php

namespace App\Http\Controllers;

use App\Services\RewardSettingsService;
use Illuminate\Http\Request;

class NurseRewardsController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'nurse') {
            return response()->json(['message' => 'Only nurses can access rewards'], 403);
        }

        $profile = $user->nurseProfile;

        if (!$profile) {
            return response()->json(['message' => 'Nurse profile not found'], 404);
        }

        $settings = RewardSettingsService::toArray();
        $pointsPerToken = max(1, (int) ($settings['points_per_token'] ?? 100));
        $estimatedTokens = round(((int) $profile->reward_points_balance) / $pointsPerToken, 6);

        return response()->json([
            'rewards' => [
                'points_balance' => (int) $profile->reward_points_balance,
                'points_lifetime' => (int) $profile->reward_points_lifetime,
                'points_withdrawn' => (int) $profile->reward_points_withdrawn,
                'estimated_tokens' => $estimatedTokens,
            ],
            'wallet' => [
                'network' => config('rewards.network', 'solana'),
                'spl_wallet_address' => $profile->spl_wallet_address,
                'is_connected' => !empty($profile->spl_wallet_address),
            ],
            'withdrawal' => [
                'is_live' => (bool) config('rewards.token_launched', false),
                'message' => config('rewards.token_launched', false)
                    ? 'Token withdrawals are enabled.'
                    : 'Withdrawals will be available after token launch.',
            ],
            'conversion' => [
                'points_per_token' => $pointsPerToken,
                'token_symbol' => (string) ($settings['token_symbol'] ?? 'ONC'),
            ],
            'severity_rates' => $settings['points_by_severity'] ?? [
                'RED' => 1200,
                'AMBER' => 800,
                'GREEN' => 500,
            ],
        ]);
    }

    public function connectWallet(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'nurse') {
            return response()->json(['message' => 'Only nurses can connect wallets'], 403);
        }

        $profile = $user->nurseProfile;

        if (!$profile) {
            return response()->json(['message' => 'Nurse profile not found'], 404);
        }

        $validated = $request->validate([
            'spl_wallet_address' => [
                'required',
                'string',
                'min:32',
                'max:64',
                'regex:/^[1-9A-HJ-NP-Za-km-z]+$/',
            ],
        ]);

        $profile->update([
            'spl_wallet_address' => $validated['spl_wallet_address'],
        ]);

        return response()->json([
            'message' => 'SPL wallet connected successfully.',
            'wallet' => [
                'network' => config('rewards.network', 'solana'),
                'spl_wallet_address' => $profile->spl_wallet_address,
                'is_connected' => true,
            ],
        ]);
    }

    public function withdraw(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'nurse') {
            return response()->json(['message' => 'Only nurses can withdraw rewards'], 403);
        }

        if (!config('rewards.token_launched', false)) {
            return response()->json([
                'message' => 'Withdrawals are not enabled yet. Points continue to accumulate automatically.',
            ], 422);
        }

        $profile = $user->nurseProfile;

        if (!$profile) {
            return response()->json(['message' => 'Nurse profile not found'], 404);
        }

        $validated = $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        if (empty($profile->spl_wallet_address)) {
            return response()->json(['message' => 'Connect an SPL wallet first.'], 422);
        }

        $points = (int) $validated['points'];

        if ((int) $profile->reward_points_balance < $points) {
            return response()->json(['message' => 'Insufficient reward points balance.'], 422);
        }

        $profile->reward_points_balance = (int) $profile->reward_points_balance - $points;
        $profile->reward_points_withdrawn = (int) $profile->reward_points_withdrawn + $points;
        $profile->save();

        return response()->json([
            'message' => 'Withdrawal request accepted. On-chain transfer integration pending.',
            'withdrawal' => [
                'network' => config('rewards.network', 'solana'),
                'points' => $points,
                'wallet' => $profile->spl_wallet_address,
                'status' => 'queued',
            ],
            'rewards' => [
                'points_balance' => (int) $profile->reward_points_balance,
                'points_lifetime' => (int) $profile->reward_points_lifetime,
                'points_withdrawn' => (int) $profile->reward_points_withdrawn,
            ],
        ]);
    }
}
