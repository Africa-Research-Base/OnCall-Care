<?php

namespace App\Http\Controllers;

use App\Models\AdminActionLog;
use App\Models\MedicalRequest;
use App\Models\NurseProfile;
use App\Models\User;
use App\Notifications\NurseAccountActionNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserManagementController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'stats' => [
                'total_users' => User::count(),
                'total_nurses' => User::where('role', 'nurse')->count(),
                'pending_nurse_applications' => NurseProfile::whereNotNull('license_number')
                    ->where('is_verified', false)
                    ->count(),
                'active_jobs' => MedicalRequest::whereIn('status', ['accepted', 'arrived', 'treating'])->count(),
                'completed_jobs' => MedicalRequest::where('status', 'completed')->count(),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query()->with('nurseProfile')->orderByDesc('created_at');

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function pendingNurseApplications()
    {
        $applications = NurseProfile::with('user')
            ->whereNotNull('license_number')
            ->where('is_verified', false)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($applications);
    }

    public function approveNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

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

        $user->update([
            'role' => 'nurse',
        ]);

        $this->notifyNurse(
            $user,
            'nurse_verified',
            'Nurse account verified',
            'Your nurse account has been verified by admin. You can now go online and accept requests.'
        );

        $this->logAdminAction($request, 'nurse_verified', $user, null, [
            'account_status' => 'active',
        ]);

        return response()->json([
            'message' => 'User promoted to nurse successfully.',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function rejectNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

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
            'Your nurse application was rejected by admin. Please update your details and reapply.'
        );

        $this->logAdminAction($request, 'nurse_rejected', $user);

        return response()->json([
            'message' => 'Nurse application rejected.',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function makeAdmin(Request $request, User $user)
    {
        $user->update([
            'role' => 'admin',
        ]);

        $this->logAdminAction($request, 'user_made_admin', $user);

        return response()->json([
            'message' => 'User role updated to admin.',
            'user' => $user,
        ]);
    }

    public function nurses(Request $request)
    {
        $query = User::query()
            ->with('nurseProfile')
            ->where('role', 'nurse')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('account_status')) {
            $query->whereHas('nurseProfile', function ($q) use ($request) {
                $q->where('account_status', $request->string('account_status'));
            });
        }

        return response()->json($query->paginate(20));
    }

    public function showNurse(User $user)
    {
        $this->ensureNurseProfileTarget($user);

        return response()->json([
            'nurse' => $user->load('nurseProfile'),
        ]);
    }

    public function updateNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

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
            'competence_areas' => 'sometimes|nullable|array|max:10',
            'competence_areas.*' => 'string|max:100',
            'experience_years' => 'sometimes|nullable|integer|min:0|max:60',
            'verification_level' => 'sometimes|integer|min:1|max:3',
        ]);

        if (!empty($validatedUser)) {
            $user->update($validatedUser);
        }

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        if (!empty($validatedProfile)) {
            $profile->update($validatedProfile);
        }

        $this->notifyNurse(
            $user,
            'nurse_profile_updated',
            'Nurse profile updated',
            'Your profile details were updated by admin.'
        );

        $this->logAdminAction($request, 'nurse_profile_updated', $user, null, [
            'fields_updated' => array_merge(array_keys($validatedUser), array_keys($validatedProfile)),
        ]);

        return response()->json([
            'message' => 'Nurse details updated successfully.',
            'nurse' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function suspendNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

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

        $this->logAdminAction($request, 'nurse_suspended', $user, $validated['reason'] ?? null, [
            'until' => $validated['until'] ?? null,
        ]);

        return response()->json([
            'message' => 'Nurse account suspended successfully.',
            'nurse' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function banNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

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

        $this->logAdminAction($request, 'nurse_banned', $user, $validated['reason'] ?? null);

        return response()->json([
            'message' => 'Nurse account banned successfully.',
            'nurse' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function activateNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

        $profile = $user->nurseProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'account_status' => 'active',
            'suspended_until' => null,
            'status_reason' => null,
            'status_changed_at' => now(),
        ]);

        $this->notifyNurse(
            $user,
            'nurse_activated',
            'Nurse account activated',
            'Your nurse account has been reactivated by admin.'
        );

        $this->logAdminAction($request, 'nurse_activated', $user);

        return response()->json([
            'message' => 'Nurse account activated successfully.',
            'nurse' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function deleteNurse(Request $request, User $user)
    {
        $this->ensureNurseProfileTarget($user);

        $targetId = $user->id;

        $this->notifyNurse(
            $user,
            'nurse_deleted',
            'Nurse account removed',
            'Your nurse account has been deleted by admin.'
        );

        $user->delete();

        $this->logAdminAction($request, 'nurse_deleted', null, null, [
            'target_user_id' => $targetId,
        ]);

        return response()->json([
            'message' => 'Nurse deleted successfully.',
        ]);
    }

    public function auditLogs(Request $request)
    {
        $query = AdminActionLog::query()
            ->with(['admin:id,name,email', 'targetUser:id,name,email'])
            ->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }

        if ($request->filled('target_user_id')) {
            $query->where('target_user_id', $request->integer('target_user_id'));
        }

        return response()->json($query->paginate(30));
    }

    private function ensureNurseProfileTarget(User $user): void
    {
        $isNurse = $user->role === 'nurse' || $user->nurseProfile !== null;

        abort_unless($isNurse, 422, 'Target user is not a nurse.');
    }

    private function notifyNurse(User $user, string $type, string $title, string $message, array $meta = []): void
    {
        $user->notify(new NurseAccountActionNotification($type, $title, $message, $meta));
    }

    private function logAdminAction(Request $request, string $action, ?User $targetUser = null, ?string $reason = null, array $meta = []): void
    {
        /** @var \App\Models\User $admin */
        $admin = $request->user();

        AdminActionLog::create([
            'admin_id' => $admin->id,
            'target_user_id' => $targetUser?->id ?? ($meta['target_user_id'] ?? null),
            'action' => $action,
            'entity_type' => $targetUser ? User::class : null,
            'entity_id' => $targetUser?->id,
            'reason' => $reason,
            'meta' => $meta,
        ]);
    }
}
