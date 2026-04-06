<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NurseController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'license_number' => 'required|string|max:50',
            'transport_mode' => ['nullable', Rule::in(['Car', 'Motorcycle', 'Bicycle', 'Walk'])],
            'competence_areas' => 'nullable|array|max:10',
            'competence_areas.*' => 'string|max:100',
            'experience_years' => 'nullable|integer|min:0|max:60',
            'license_photo_url' => 'nullable|url|max:2048',
        ]);

        $user = $request->user();

        $profile = $user->nurseProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'license_number' => $request->license_number,
                'license_photo_url' => $request->license_photo_url,
                'transport_mode' => $request->transport_mode,
                'competence_areas' => $request->competence_areas,
                'experience_years' => $request->experience_years ?? 0,
                'is_verified' => false,
                'is_online' => false,
            ]
        );

        return response()->json([
            'message' => 'Nurse application submitted and pending review.',
            'application_status' => 'pending',
            'profile' => $profile,
        ]);
    }

    public function applicationStatus(Request $request)
    {
        $profile = $request->user()->nurseProfile;

        if (!$profile || !$profile->license_number) {
            return response()->json([
                'application_status' => 'not_submitted',
            ]);
        }

        return response()->json([
            'application_status' => $profile->is_verified ? 'approved' : 'pending',
            'profile' => $profile,
        ]);
    }

    public function toggleOnline(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'nurse') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $profile = $user->nurseProfile;
        
        // Ensure profile exists (it should if registered correctly)
        if (!$profile) {
             // Create if missing for some reason
             $profile = $user->nurseProfile()->create();
        }

        if (!$profile->is_verified) {
            return response()->json(['message' => 'Your nurse application is pending admin approval.'], 403);
        }

        if ($profile->account_status !== 'active') {
            return response()->json([
                'message' => 'Your nurse account is currently restricted by admin.',
                'account_status' => $profile->account_status,
                'reason' => $profile->status_reason,
                'suspended_until' => $profile->suspended_until,
            ], 403);
        }

        $profile->update([
            'is_online' => !$profile->is_online
        ]);

        return response()->json(['is_online' => $profile->is_online]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $request->user()->update([
            'lat' => $request->lat,
            'lng' => $request->lng,
        ]);

        // TODO: If on active job, broadcast location to patient

        return response()->json(['message' => 'Location updated']);
    }
}
