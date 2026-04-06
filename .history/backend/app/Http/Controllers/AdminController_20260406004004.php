<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MedicalRequest;
use App\Notifications\NurseAccountActionNotification;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_nurses' => User::where('role', 'nurse')->count(),
            'active_jobs' => MedicalRequest::whereIn('status', ['accepted', 'arrived', 'treating'])->count(),
            // Mock revenue calculation: 5000 per completed job
            'revenue' => MedicalRequest::where('status', 'completed')->count() * 5000
        ];

        $recentRequests = MedicalRequest::with('patient', 'nurseProfile.user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentRequests'));
    }

    public function activities()
    {
        $activities = MedicalRequest::with('patient', 'nurseProfile.user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.activities', compact('activities'));
    }

    public function nurses()
    {
        $nurses = User::query()
            ->with('nurseProfile')
            ->where(function ($query) {
                $query->where('role', 'nurse')
                    ->orWhereHas('nurseProfile');
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        return view('admin.nurses', compact('nurses'));
    }

    public function showNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        return view('admin.nurse-show', [
            'nurse' => $user->load('nurseProfile'),
        ]);
    }

    public function editNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        return view('admin.nurse-edit', [
            'nurse' => $user->load('nurseProfile'),
        ]);
    }

    public function updateNurse(Request $request, User $user)
    {
        $this->ensureNurseTarget($user);

        $validatedUser = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:20',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        $validatedProfile = $request->validate([
            'license_number' => 'sometimes|nullable|string|max:50',
            'license_photo_url' => 'sometimes|nullable|url|max:2048',
            'transport_mode' => ['sometimes', 'nullable', Rule::in(['Car', 'Motorcycle', 'Bicycle', 'Walk'])],
            'competence_areas' => 'sometimes|nullable|string|max:1000',
            'experience_years' => 'sometimes|nullable|integer|min:0|max:60',
            'verification_level' => 'sometimes|integer|min:1|max:3',
        ]);

        if (!empty($validatedUser)) {
            $user->update($validatedUser);
        }

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        if (array_key_exists('competence_areas', $validatedProfile) && $validatedProfile['competence_areas'] !== null) {
            $validatedProfile['competence_areas'] = collect(explode(',', $validatedProfile['competence_areas']))
                ->map(fn ($item) => trim($item))
                ->filter()
                ->values()
                ->all();
        }
        if (!empty($validatedProfile)) {
            $profile->update($validatedProfile);
        }

        $this->notifyNurse(
            $user,
            'nurse_profile_updated',
            'Nurse profile updated',
            'Your profile details were updated by admin.'
        );

        return redirect()
            ->route('admin.nurses.show', $user)
            ->with('status', 'Nurse details updated successfully.');
    }

    public function verifyNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        $profile = $user->nurseProfile()->firstOrCreate(
            ['user_id' => $user->id],
            ['is_online' => false]
        );

        $profile->update([
            'is_verified' => true,
            'account_status' => 'active',
            'suspended_until' => null,
            'status_reason' => null,
            'status_changed_at' => now(),
        ]);

        if ($user->role !== 'nurse') {
            $user->update(['role' => 'nurse']);
        }

        $this->notifyNurse(
            $user,
            'nurse_verified',
            'Nurse account verified',
            'Your nurse account has been verified by admin. You can now go online and accept requests.'
        );

        return back()->with('status', 'Nurse verified successfully.');
    }

    public function rejectNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        $profile = $user->nurseProfile;

        if ($profile) {
            $profile->update([
                'is_verified' => false,
                'is_online' => false,
                'status_changed_at' => now(),
            ]);
        }

        if ($user->role === 'nurse') {
            $user->update([
                'role' => 'patient',
            ]);
        }

        $this->notifyNurse(
            $user,
            'nurse_rejected',
            'Nurse application rejected',
            'Your nurse application was declined by admin. Please update your details and reapply.'
        );

        return back()->with('status', 'Nurse application declined.');
    }

    public function suspendNurse(Request $request, User $user)
    {
        $this->ensureNurseTarget($user);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
            'until' => 'nullable|date|after:now',
        ]);

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'account_status' => 'suspended',
            'suspended_until' => $validated['until'] ?? null,
            'status_reason' => $validated['reason'] ?? null,
            'status_changed_at' => now(),
            'is_online' => false,
        ]);

        $this->notifyNurse(
            $user,
            'nurse_suspended',
            'Nurse account suspended',
            'Your nurse account has been suspended by admin.',
            [
                'reason' => $validated['reason'] ?? null,
                'until' => $validated['until'] ?? null,
            ]
        );

        return back()->with('status', 'Nurse suspended successfully.');
    }

    public function banNurse(Request $request, User $user)
    {
        $this->ensureNurseTarget($user);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'account_status' => 'banned',
            'suspended_until' => null,
            'status_reason' => $validated['reason'] ?? null,
            'status_changed_at' => now(),
            'is_online' => false,
        ]);

        $this->notifyNurse(
            $user,
            'nurse_banned',
            'Nurse account banned',
            'Your nurse account has been banned by admin.',
            [
                'reason' => $validated['reason'] ?? null,
            ]
        );

        return back()->with('status', 'Nurse banned successfully.');
    }

    public function activateNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'account_status' => 'active',
            'suspended_until' => null,
            'status_reason' => null,
            'status_changed_at' => now(),
        ]);

        if ($user->role !== 'nurse') {
            $user->update(['role' => 'nurse']);
        }

        $this->notifyNurse(
            $user,
            'nurse_activated',
            'Nurse account activated',
            'Your nurse account has been reactivated by admin.'
        );

        return back()->with('status', 'Nurse activated successfully.');
    }

    public function deleteNurse(User $user)
    {
        $this->ensureNurseTarget($user);

        $this->notifyNurse(
            $user,
            'nurse_deleted',
            'Nurse account removed',
            'Your nurse account has been deleted by admin.'
        );

        $user->delete();

        return redirect()
            ->route('admin.nurses')
            ->with('status', 'Nurse deleted successfully.');
    }

    private function ensureNurseTarget(User $user): void
    {
        abort_unless($user->role === 'nurse' || $user->nurseProfile !== null, 422, 'Target user is not a nurse.');
    }

    private function notifyNurse(User $user, string $type, string $title, string $message, array $meta = []): void
    {
        $user->notify(new NurseAccountActionNotification($type, $title, $message, $meta));
    }
}
