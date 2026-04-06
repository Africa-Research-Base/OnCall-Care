<?php

namespace App\Services;

use App\Models\User;
use App\Models\NurseProfile;
use Illuminate\Support\Facades\DB;

class MatchingService
{
    /**
     * Find best nurses for a request.
     * 
     * @param float $lat
     * @param float $lng
     * @param string $triageLevel ('RED', 'AMBER', 'GREEN')
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function findNurses($lat, $lng, $triageLevel = 'GREEN', $limit = 1)
    {
        // 1. Determine constraints based on Triage Level
        $maxDistance = match ($triageLevel) {
            'RED' => 10,    // 10 km for critical (expanded range)
            'AMBER' => 15, // 15 km for urgent
            default => 25, // 25 km for standard
        };

        $minVerification = match ($triageLevel) {
            'RED' => 2,    // Needs License/Credentials
            default => 1,  // Identity only is okay for basic
        };

        // 2. Haversine Formula for Distance (in km)
        // 6371 is Earth's radius in km
        $haversine = "(6371 * acos(cos(radians($lat)) 
                     * cos(radians(users.lat)) 
                     * cos(radians(users.lng) - radians($lng)) 
                     + sin(radians($lat)) 
                     * sin(radians(users.lat))))";

        // 3. Query Users who are Nurses, Online, and fall within criteria
        // Ensure we order by distance ASC so the closest is first.
        $nurses = User::select('users.*', DB::raw("{$haversine} as distance"))
            ->join('nurse_profiles', 'users.id', '=', 'nurse_profiles.user_id')
            ->where('users.role', 'nurse')
            ->where('nurse_profiles.is_online', true)
            ->where('nurse_profiles.account_status', 'active')
            ->where('nurse_profiles.verification_level', '>=', $minVerification)
            ->having('distance', '<=', $maxDistance)
            ->orderBy('distance', 'asc') // Closest first
            ->limit($limit) // Limit to the requested number (default 1 for 'closest')
            ->with('nurseProfile') // Eager load profile
            ->get();

        return $nurses;
    }
}
