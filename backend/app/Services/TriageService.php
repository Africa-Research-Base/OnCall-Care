<?php

namespace App\Services;

class TriageService
{
    /**
     * Calculate triage level based on inputs.
     * Returns: 'RED' (Critical), 'AMBER' (Urgent), 'GREEN' (Standard)
     */
    public static function calculateSeverity($symptoms, $ageGroup, $isConscious, $history)
    {
        // 1. Critical Override: Unconscious is always RED
        if (!$isConscious) {
            return 'RED';
        }

        // Normalize inputs
        $symptoms = collect($symptoms); // Assumes array of strings e.g. ['Breathing Difficulty']

        // 2. RED Criteria (Immediate Life Threat)
        if (
            $symptoms->contains('Breathing Difficulty') ||
            $symptoms->contains('Severe Bleeding') ||
            $symptoms->contains('Chest Pain') ||
            ($symptoms->contains('Allergic Reaction') && $symptoms->contains('Breathing Difficulty'))
        ) {
            return 'RED';
        }

        // Pediatric Red Flag: Child/Infant + High Fever or Breathing
        if (in_array($ageGroup, ['Child', 'Infant']) && $symptoms->contains('Breathing Difficulty')) {
            return 'RED';
        }

        // 3. AMBER Criteria (Urgent but stable)
        if (
            $symptoms->contains('High Fever') ||
            $symptoms->contains('Broken Bone') ||
            ($ageGroup === 'Child' && $symptoms->contains('Vomiting'))
        ) {
            return 'AMBER';
        }

        // 4. Default to GREEN (Standard)
        return 'GREEN';
    }

    /**
     * Get search radius in kilometers based on severity.
     */
    public static function getSearchRadius($triageLevel)
    {
        return match ($triageLevel) {
            'RED' => 5,   // Critical: 5km (Need closest)
            'AMBER' => 10, // Urgent: 10km
            default => 20, // Green: 20km
        };
    }
}
