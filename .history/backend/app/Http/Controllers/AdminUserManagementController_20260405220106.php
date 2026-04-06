<?php

namespace App\Http\Controllers;

use App\Models\MedicalRequest;
use App\Models\NurseProfile;
use App\Models\User;
use Illuminate\Http\Request;

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
        $profile = $user->nurseProfile()->firstOrCreate(
            ['user_id' => $user->id],
            ['is_online' => false]
        );

        $profile->update([
            'is_verified' => true,
        ]);

        $user->update([
            'role' => 'nurse',
        ]);

        return response()->json([
            'message' => 'User promoted to nurse successfully.',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function rejectNurse(Request $request, User $user)
    {
        $profile = $user->nurseProfile;

        if ($profile) {
            $profile->update([
                'is_verified' => false,
                'is_online' => false,
            ]);
        }

        if ($user->role === 'nurse') {
            $user->update([
                'role' => 'patient',
            ]);
        }

        return response()->json([
            'message' => 'Nurse application rejected.',
            'user' => $user->fresh()->load('nurseProfile'),
        ]);
    }

    public function makeAdmin(User $user)
    {
        $user->update([
            'role' => 'admin',
        ]);

        return response()->json([
            'message' => 'User role updated to admin.',
            'user' => $user,
        ]);
    }
}
