@extends('layouts.admin')

@section('title', 'Activity Logs')

@section('content')
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-4 border-b border-gray-200">
            <h3 class="font-bold text-gray-700">All Medical Requests</h3>
        </div>
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                    <th class="p-4">ID</th>
                    <th class="p-4">Patient</th>
                    <th class="p-4">Nurse</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Symptoms</th>
                    <th class="p-4">Severity</th>
                    <th class="p-4">Time</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody class="text-sm text-gray-700">
                @foreach($activities as $act)
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="p-4 font-bold">#{{ $act->id }}</td>
                    <td class="p-4">
                        <div class="font-bold">{{ $act->patient->name ?? 'Unknown' }}</div>
                        <div class="text-xs text-gray-400">{{ $act->patient->email ?? '' }}</div>
                    </td>
                    <td class="p-4">
                       @if($act->nurseProfile)
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                <span class="font-bold">{{ $act->nurseProfile->user->name }}</span>
                            </div>
                        @else
                            <span class="text-gray-400 italic">Unassigned</span>
                        @endif
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-xs font-bold border
                            {{ $act->status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : '' }}
                            {{ $act->status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : '' }}
                            {{ $act->status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' : '' }}
                            {{ $act->status === 'accepted' ? 'bg-blue-50 border-blue-200 text-blue-700' : '' }}
                        ">
                            {{ ucfirst($act->status) }}
                        </span>
                    </td>
                    <td class="p-4 truncate max-w-xs text-xs">
                        {{ is_string($act->symptoms) ? implode(', ', json_decode($act->symptoms, true) ?? []) : 'N/A' }}
                    </td>
                    <td class="p-4">
                        <span class="font-bold
                             {{ $act->severity === 'RED' ? 'text-red-600' : '' }}
                             {{ $act->severity === 'AMBER' ? 'text-orange-500' : '' }}
                             {{ $act->severity === 'GREEN' ? 'text-green-500' : '' }}
                        ">
                            {{ $act->severity }}
                        </span>
                    </td>
                    <td class="p-4 text-gray-500">{{ $act->created_at->format('M d, H:i') }}</td>
                    <td class="p-4">
                        <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <div class="p-4">
            {{ $activities->links() }}
        </div>
    </div>
@endsection
