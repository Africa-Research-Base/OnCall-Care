<?php

namespace App\Http\Controllers;

use App\Models\MedicalRequest;
use App\Models\User;
use Illuminate\Http\Request;

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

        if ($user->nurseProfile->account_status !== 'active') {
            return response()->json([
                'message' => 'Your account is currently restricted by admin.',
                'account_status' => $user->nurseProfile->account_status,
                'reason' => $user->nurseProfile->status_reason,
                'suspended_until' => $user->nurseProfile->suspended_until,
            ], 403);
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

        $request->validate([
            'status' => 'required|in:arrived,completed',
        ]);

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

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $medicalRequest = MedicalRequest::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|min:3|max:1000',
        ]);

        if ($medicalRequest->patient_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (in_array($medicalRequest->status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Request cannot be cancelled at this stage.',
                'status' => $medicalRequest->status,
            ], 422);
        }

        $medicalRequest->status = 'cancelled';
        $medicalRequest->cancelled_at = now();
        $medicalRequest->cancellation_reason = $validated['reason'];
        $medicalRequest->cancelled_by_role = $user->role ?? 'patient';
        $medicalRequest->save();

        return response()->json([
            'message' => 'Request cancelled successfully.',
            'request' => $medicalRequest,
        ]);
    }

    public function getPendingRequests(Request $request)
    {
        $user = $request->user();
        $nurseProfile = $user->nurseProfile;

        if (!$nurseProfile || !$nurseProfile->is_online || !$nurseProfile->is_verified || $nurseProfile->account_status !== 'active') {
            return response()->json([]);
        }

        // Find pending requests that are not yet assigned
        // In a real app, we would match based on the 'MatchingService' logic
        // For prototype, we just return the latest pending request
        $pendingRequest = MedicalRequest::with('patient')
            ->where('status', 'pending')
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
            'cancellation_reason' => $medicalRequest->cancellation_reason,
            'cancelled_at' => $medicalRequest->cancelled_at,
            'cancelled_by_role' => $medicalRequest->cancelled_by_role,
        ];

        if ($medicalRequest->nurse_id) {
            $nurseUser = User::with('nurseProfile')->find($medicalRequest->nurse_id);

            if ($nurseUser) {
                $nurseProfile = $nurseUser->nurseProfile;
                $etaMinutes = null;
                $nurseLat = is_numeric($nurseUser->lat) ? (float) $nurseUser->lat : null;
                $nurseLng = is_numeric($nurseUser->lng) ? (float) $nurseUser->lng : null;
                $pickupLat = is_numeric($medicalRequest->pickup_lat) ? (float) $medicalRequest->pickup_lat : null;
                $pickupLng = is_numeric($medicalRequest->pickup_lng) ? (float) $medicalRequest->pickup_lng : null;

                if ($nurseLat !== null && $nurseLng !== null && $pickupLat !== null && $pickupLng !== null) {
                    $earthRadiusKm = 6371;
                    $latFrom = deg2rad($nurseLat);
                    $lonFrom = deg2rad($nurseLng);
                    $latTo = deg2rad($pickupLat);
                    $lonTo = deg2rad($pickupLng);

                    $latDelta = $latTo - $latFrom;
                    $lonDelta = $lonTo - $lonFrom;

                    $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
                    $distanceKm = $earthRadiusKm * $angle;

                    // Approximate city response speed at 30km/h.
                    $etaMinutes = (int) max(1, round(($distanceKm / 30) * 60));
                }

                $response['nurse'] = [
                    'name' => $nurseUser->name,
                    'phone' => $nurseUser->phone,
                    'vehicle' => $nurseProfile?->transport_mode,
                    'verification_level' => $nurseProfile?->verification_level,
                    'account_status' => $nurseProfile?->account_status,
                    'lat' => $nurseLat,
                    'lng' => $nurseLng,
                    'eta' => $etaMinutes ? "{$etaMinutes} min" : null,
                ];
            }
        }

        return response()->json($response);
    }
}
