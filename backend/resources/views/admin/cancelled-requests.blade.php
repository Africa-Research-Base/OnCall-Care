@extends('layouts.admin')

@section('title', 'Cancelled Requests')

@section('content')
<div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 border-b border-gray-200">
        <h3 class="font-bold text-gray-700">Cancelled Medical Requests</h3>
        <p class="text-xs text-gray-500 mt-1">Patient cancellations with reason and timeline.</p>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                    <th class="p-4">Request</th>
                    <th class="p-4">Patient</th>
                    <th class="p-4">Nurse</th>
                    <th class="p-4">Cancelled By</th>
                    <th class="p-4">Reason</th>
                    <th class="p-4">Cancelled At</th>
                </tr>
            </thead>
            <tbody class="text-sm text-gray-700">
                @forelse($requests as $request)
                <tr class="border-b hover:bg-gray-50 transition align-top">
                    <td class="p-4 font-bold">#{{ $request->id }}</td>
                    <td class="p-4">
                        <div class="font-bold">{{ $request->patient->name ?? 'Unknown' }}</div>
                        <div class="text-xs text-gray-400">{{ $request->patient->email ?? '' }}</div>
                    </td>
                    <td class="p-4">
                        @if($request->nurseProfile && $request->nurseProfile->user)
                        <div class="font-bold">{{ $request->nurseProfile->user->name }}</div>
                        <div class="text-xs text-gray-400">{{ $request->nurseProfile->transport_mode ?? 'N/A' }}</div>
                        @else
                        <span class="text-gray-400 italic">Unassigned</span>
                        @endif
                    </td>
                    <td class="p-4">
                        <span
                            class="px-2 py-1 rounded-full text-xs font-bold border bg-red-50 border-red-200 text-red-700">
                            {{ ucfirst($request->cancelled_by_role ?? 'unknown') }}
                        </span>
                    </td>
                    <td class="p-4 max-w-xs">
                        <p class="text-sm text-gray-800 whitespace-pre-line wrap-break-word">
                            {{ $request->cancellation_reason ?: 'No reason provided' }}
                        </p>
                    </td>
                    <td class="p-4 text-gray-500">
                        {{ optional($request->cancelled_at)->format('M d, Y H:i') ?? 'N/A' }}
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="p-6 text-center text-sm text-gray-500">No cancelled requests yet.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4">
        {{ $requests->links() }}
    </div>
</div>
@endsection