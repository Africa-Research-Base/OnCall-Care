<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use App\Models\NurseProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AdminHospitalController extends Controller
{
    /**
     * Show dashboard with hospitals and nurses
     */
    public function dashboard(): View
    {
        $hospitals = Hospital::all();
        $totalNurses = NurseProfile::count();
        $verifiedNurses = NurseProfile::where('is_verified', true)->count();
        $pendingNurses = NurseProfile::where('is_verified', false)->count();
        $verifiedHospitals = Hospital::where('is_verified', true)->count();

        return view('admin.dashboard', [
            'hospitals' => $hospitals,
            'totalNurses' => $totalNurses,
            'verifiedNurses' => $verifiedNurses,
            'pendingNurses' => $pendingNurses,
            'verifiedHospitals' => $verifiedHospitals,
        ]);
    }

    /**
     * Show all hospitals
     */
    public function hospitals(): View
    {
        $hospitals = Hospital::withCount('nurseProfiles')->paginate(20);
        return view('admin.hospitals.index', compact('hospitals'));
    }

    /**
     * Show hospital creation form
     */
    public function createHospitalForm(): View
    {
        return view('admin.hospitals.create');
    }

    /**
     * Store new hospital
     */
    public function storeHospital(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:hospitals',
            'email' => 'required|email|unique:hospitals',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'document_url' => 'nullable|url',
        ]);

        Hospital::create($validated);

        return redirect()->route('admin.hospitals')->with('success', 'Hospital created successfully');
    }

    /**
     * Show hospital edit form
     */
    public function editHospitalForm(Hospital $hospital): View
    {
        return view('admin.hospitals.edit', compact('hospital'));
    }

    /**
     * Update hospital
     */
    public function updateHospital(Request $request, Hospital $hospital)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:hospitals,name,' . $hospital->id,
            'email' => 'required|email|unique:hospitals,email,' . $hospital->id,
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'document_url' => 'nullable|url',
        ]);

        $hospital->update($validated);

        return redirect()->route('admin.hospitals')->with('success', 'Hospital updated successfully');
    }

    /**
     * Verify hospital
     */
    public function verifyHospital(Hospital $hospital)
    {
        $hospital->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Hospital verified successfully');
    }

    /**
     * Show nurses for a hospital
     */
    public function hospitalNurses(Hospital $hospital): View
    {
        $nurses = $hospital->nurseProfiles()->with('user')->paginate(20);
        return view('admin.hospitals.nurses', compact('hospital', 'nurses'));
    }

    /**
     * Show all nurses
     */
    public function nurses(): View
    {
        $nurses = NurseProfile::with('user', 'hospital')
            ->orderByDesc('created_at')
            ->paginate(20);

        return view('admin.nurses.index', compact('nurses'));
    }

    /**
     * Show nurse creation form
     */
    public function createNurseForm(): View
    {
        $hospitals = Hospital::all();
        return view('admin.nurses.create', compact('hospitals'));
    }

    /**
     * Store new nurse with default password
     */
    public function storeNurse(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string',
            'contact' => 'nullable|string',
            'hospital_id' => 'required|exists:hospitals,id',
            'license_number' => 'required|string',
            'license_photo_url' => 'nullable|url',
            'experience_years' => 'nullable|integer|min:0',
            'competence_areas' => 'nullable|string',
        ]);

        $contact = $validated['contact'] ?? $validated['phone'];
        $competenceAreas = $validated['competence_areas'] 
            ? explode(',', $validated['competence_areas']) 
            : [];

        // Create user with default password
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'contact' => $contact,
            'hospital_id' => $validated['hospital_id'],
            'password' => Hash::make('password123'),
            'role' => 'nurse',
        ]);

        // Create nurse profile
        NurseProfile::create([
            'user_id' => $user->id,
            'hospital_id' => $validated['hospital_id'],
            'license_number' => $validated['license_number'],
            'license_photo_url' => $validated['license_photo_url'],
            'experience_years' => $validated['experience_years'] ?? 0,
            'competence_areas' => $competenceAreas,
            'is_verified' => false,
            'account_status' => 'pending',
        ]);

        return redirect()->route('admin.nurses')
            ->with('success', 'Nurse created successfully with password: password123');
    }

    /**
     * Show nurse edit form
     */
    public function editNurseForm(NurseProfile $nurse): View
    {
        $hospitals = Hospital::all();
        return view('admin.nurses.edit', compact('nurse', 'hospitals'));
    }

    /**
     * Update nurse
     */
    public function updateNurse(Request $request, NurseProfile $nurse)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $nurse->user_id,
            'phone' => 'sometimes|string',
            'contact' => 'sometimes|string',
            'hospital_id' => 'sometimes|exists:hospitals,id',
            'license_number' => 'sometimes|string',
            'experience_years' => 'sometimes|integer|min:0',
        ]);

        // Update user fields
        if (isset($validated['name']) || isset($validated['email']) || 
            isset($validated['phone']) || isset($validated['contact']) || 
            isset($validated['hospital_id'])) {
            $nurse->user->update($validated);
        }

        // Update nurse profile fields
        $profileData = collect($validated)
            ->only(['hospital_id', 'license_number', 'experience_years'])
            ->toArray();

        if (!empty($profileData)) {
            $nurse->update($profileData);
        }

        return redirect()->route('admin.nurses')
            ->with('success', 'Nurse updated successfully');
    }

    /**
     * Verify nurse
     */
    public function verifyNurse(NurseProfile $nurse)
    {
        $nurse->update([
            'is_verified' => true,
            'account_status' => 'active',
            'status_changed_at' => now(),
        ]);

        $nurse->user->update(['role' => 'nurse']);

        return redirect()->back()->with('success', 'Nurse verified successfully');
    }

    /**
     * Reset nurse password to default
     */
    public function resetNursePassword(NurseProfile $nurse)
    {
        $nurse->user->update([
            'password' => Hash::make('password123'),
        ]);

        return redirect()->back()
            ->with('success', 'Nurse password reset to: password123');
    }

    /**
     * Suspend nurse
     */
    public function suspendNurse(Request $request, NurseProfile $nurse)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
            'days' => 'required|integer|min:1',
        ]);

        $nurse->update([
            'account_status' => 'suspended',
            'status_reason' => $validated['reason'],
            'suspended_until' => now()->addDays($validated['days']),
            'status_changed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Nurse suspended successfully');
    }
}
