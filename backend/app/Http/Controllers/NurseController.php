<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NurseController extends Controller
{
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
