<?php

namespace App\Http\Controllers;

use App\Models\MedicalRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequestController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'symptoms' => 'required|array',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
        ]);

        $user = $request->user();
        
        // Calculate Triage Level
        $triageLevel = \App\Services\TriageService::calculateSeverity(
            $request->symptoms,
            $request->age_group,
            $request->boolean('is_conscious', true),
            $request->history_notes
        );

        // Create Request
        $medicalRequest = MedicalRequest::create([
            'patient_id' => $user->id,
            'status' => 'pending',
            'symptoms' => json_encode($request->symptoms),
            'severity' => $triageLevel,
            'triage_level' => $triageLevel,
            'age_group' => $request->age_group,
            'is_conscious' => $request->boolean('is_conscious', true),
            'history_notes' => $request->history_notes,
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
        ]);

        // Find Matching Nurses
        $matchedNurses = \App\Services\MatchingService::findNurses(
            $request->pickup_lat,
            $request->pickup_lng,
            $triageLevel
        );

        // Broadcast Job Alert
        event(new \App\Events\JobAlert($medicalRequest, $triageLevel));

        return response()->json([
            'message' => 'Request created', 
            'request' => $medicalRequest,
            'triage' => $triageLevel,
            'nearby_nurses_count' => $matchedNurses->count(),
            'matched_nurses' => $matchedNurses // Returning for debugging/demo
        ]);
    }

    public function accept(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'nurse') {
            return response()->json(['message' => 'Only nurses can accept requests'], 403);
        }

        if (!$user->nurseProfile || !$user->nurseProfile->is_verified) {
            return response()->json(['message' => 'Verified nurse account required'], 403);
        }

        $medicalRequest = MedicalRequest::findOrFail($id);
        
        if ($medicalRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already taken'], 400);
        }

        $medicalRequest->nurse_id = $user->id;
        $medicalRequest->status = 'accepted';
        $medicalRequest->save();

        return response()->json(['message' => 'Request accepted', 'request' => $medicalRequest]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $medicalRequest = MedicalRequest::findOrFail($id);

        if ($medicalRequest->nurse_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $status = $request->status; // 'arrived' or 'completed'

        if ($status === 'arrived') {
            $medicalRequest->status = 'arrived';
            $medicalRequest->arrived_at = now();
        } elseif ($status === 'completed') {
            $medicalRequest->status = 'completed';
            $medicalRequest->completed_at = now();
            
            // Add earnings (Mock calculation)
            $nurseProfile = $user->nurseProfile;
            if ($nurseProfile) {
                $nurseProfile->earnings += 5000; // Flat rate 5k
                $nurseProfile->save();
            }
        }

        $medicalRequest->save();

        return response()->json(['message' => 'Status updated', 'status' => $status]);
    }

    public function getPendingRequests(Request $request)
    {
        $user = $request->user();
        $nurseProfile = $user->nurseProfile;

        if (!$nurseProfile || !$nurseProfile->is_online || !$nurseProfile->is_verified) {
            return response()->json([]);
        }

        // Find pending requests that are not yet assigned
        // In a real app, we would match based on the 'MatchingService' logic
        // For prototype, we just return the latest pending request
        $pendingRequest = MedicalRequest::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($pendingRequest) {
            return response()->json([$pendingRequest]);
        }

        return response()->json([]);
    }
    
    public function show(Request $request, $id)
    {
        $medicalRequest = MedicalRequest::with('nurseProfile')->findOrFail($id);
        
        $response = [
            'request' => $medicalRequest,
            'status' => $medicalRequest->status,
        ];

        if ($medicalRequest->nurse_id) {
            $nurseUser = User::find($medicalRequest->nurse_id);
            $nurseProfile = $nurseUser->nurseProfile; 
            
            // In a real app we might join these better
            $response['nurse'] = [
                'name' => $nurseUser->name,
                'phone' => '123-456-7890', // Mock Phone if not in DB
                'vehicle' => $nurseProfile->transport_mode ?? 'Vehicle',
                'rating' => 5.0, // Mock rating if not implemented
                'lat' => $nurseUser->lat,
                'lng' => $nurseUser->lng
            ];
        }

        return response()->json($response);
    }
}
