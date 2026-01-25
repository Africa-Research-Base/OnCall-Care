<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


use App\Models\User;
use App\Models\MedicalRequest;
use App\Models\NurseProfile;

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
        $nurses = NurseProfile::with('user')->paginate(20);
        return view('admin.nurses', compact('nurses'));
    }
}
