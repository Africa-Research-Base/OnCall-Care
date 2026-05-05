<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use App\Models\NurseProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class NurseManagementController extends Controller
{
    /**
     * Create a new nurse with default password
     */
    public function createNurse(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string',
            'contact' => 'nullable|string',
            'hospital_id' => 'required|exists:hospitals,id',
            'license_number' => 'required|string',
            'license_photo_url' => 'nullable|string',
            'experience_years' => 'nullable|integer',
            'competence_areas' => 'nullable|array',
        ]);

        // Create user with default password
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'contact' => $validated['contact'] ?? $validated['phone'],
            'hospital_id' => $validated['hospital_id'],
            'password' => Hash::make('password123'),
            'role' => 'nurse',
        ]);

        // Create nurse profile
        $nurseProfile = NurseProfile::create([
            'user_id' => $user->id,
            'hospital_id' => $validated['hospital_id'],
            'license_number' => $validated['license_number'],
            'license_photo_url' => $validated['license_photo_url'],
            'experience_years' => $validated['experience_years'] ?? 0,
            'competence_areas' => $validated['competence_areas'] ?? [],
            'is_verified' => false,
            'account_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Nurse created successfully with password: password123',
            'user' => $user,
            'nurse_profile' => $nurseProfile,
        ], 201);
    }

    /**
     * Update nurse details
     */
    public function updateNurse(Request $request, User $user)
    {
        $this->authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'contact' => 'sometimes|string',
            'hospital_id' => 'sometimes|exists:hospitals,id',
            'license_number' => 'sometimes|string',
            'experience_years' => 'sometimes|integer',
            'competence_areas' => 'sometimes|array',
            'is_verified' => 'sometimes|boolean',
        ]);

        if (isset($validated['name']) || isset($validated['phone']) || 
            isset($validated['contact']) || isset($validated['hospital_id'])) {
            $user->update($validated);
        }

        if ($user->nurseProfile) {
            $profileData = collect($validated)
                ->only(['hospital_id', 'license_number', 'experience_years', 'competence_areas', 'is_verified'])
                ->toArray();

            $user->nurseProfile->update($profileData);
        }

        return response()->json([
            'message' => 'Nurse updated successfully',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    /**
     * Verify a nurse
     */
    public function verifyNurse(Request $request, User $user)
    {
        $this->authorize('isAdmin');

        if ($user->nurseProfile) {
            $user->nurseProfile->update([
                'is_verified' => true,
                'account_status' => 'active',
                'status_changed_at' => now(),
            ]);

            $user->update(['role' => 'nurse']);
        }

        return response()->json([
            'message' => 'Nurse verified successfully',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    /**
     * Get all nurses for a hospital
     */
    public function getNursesByHospital(Hospital $hospital)
    {
        $nurses = $hospital->nurseProfiles()
            ->with('user')
            ->paginate(20);

        return response()->json($nurses);
    }

    /**
     * Get all hospitals
     */
    public function getHospitals(Request $request)
    {
        $query = Hospital::query();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        }

        if ($request->filled('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Create a hospital
     */
    public function createHospital(Request $request)
    {
        $this->authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:hospitals',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'document_url' => 'nullable|string',
        ]);

        $hospital = Hospital::create($validated);

        return response()->json([
            'message' => 'Hospital created successfully',
            'hospital' => $hospital,
        ], 201);
    }

    /**
     * Update a hospital
     */
    public function updateHospital(Request $request, Hospital $hospital)
    {
        $this->authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:hospitals,email,' . $hospital->id,
            'phone' => 'sometimes|string',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'state' => 'sometimes|string',
            'country' => 'sometimes|string',
            'postal_code' => 'sometimes|string',
            'document_url' => 'sometimes|string',
        ]);

        $hospital->update($validated);

        return response()->json([
            'message' => 'Hospital updated successfully',
            'hospital' => $hospital,
        ]);
    }

    /**
     * Verify a hospital
     */
    public function verifyHospital(Request $request, Hospital $hospital)
    {
        $this->authorize('isAdmin');

        $hospital->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Hospital verified successfully',
            'hospital' => $hospital,
        ]);
    }
}
