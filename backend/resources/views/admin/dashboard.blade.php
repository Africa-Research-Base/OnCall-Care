@extends('layouts.admin')

@section('title', 'Dashboard Overview')

@section('content')
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-500 text-sm">Total Users</p>
                    <h3 class="text-3xl font-bold text-gray-800">{{ $stats['total_users'] }}</h3>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                    <i class="fas fa-users text-blue-500 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-500 text-sm">Nurses</p>
                    <h3 class="text-3xl font-bold text-gray-800">{{ $stats['total_nurses'] }}</h3>
                </div>
                <div class="bg-green-100 p-3 rounded-full">
                    <i class="fas fa-user-nurse text-green-500 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-500 text-sm">Active Jobs</p>
                    <h3 class="text-3xl font-bold text-gray-800">{{ $stats['active_jobs'] }}</h3>
                </div>
                <div class="bg-yellow-100 p-3 rounded-full">
                    <i class="fas fa-ambulance text-yellow-500 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-500 text-sm">Revenue (Est)</p>
                    <h3 class="text-3xl font-bold text-gray-800">₦{{ number_format($stats['revenue']) }}</h3>
                </div>
                <div class="bg-purple-100 p-3 rounded-full">
                    <i class="fas fa-wallet text-purple-500 text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-700">Recent Requests</h3>
            <a href="{{ route('admin.activities') }}" class="text-sm text-blue-500 hover:underline">View All</a>
        </div>
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-50 text-gray-600 uppercase text-xs">
                    <th class="p-4">ID</th>
                    <th class="p-4">Patient</th>
                    <th class="p-4">Symptoms</th>
                    <th class="p-4">Nurse</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Date</th>
                </tr>
            </thead>
            <tbody class="text-sm text-gray-700">
                @foreach($recentRequests as $req)
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="p-4 font-bold">#{{ $req->id }}</td>
                    <td class="p-4">{{ $req->patient->name ?? 'Unknown' }}</td>
                    <td class="p-4 truncate max-w-xs">
                        {{ is_string($req->symptoms) ? implode(', ', json_decode($req->symptoms, true) ?? []) : 'N/A' }}
                    </td>
                    <td class="p-4">
                        @if($req->nurseProfile)
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                {{ $req->nurseProfile->user->name }}
                            </span>
                        @else
                            <span class="text-gray-400 italic">Finding Nurse...</span>
                        @endif
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-bold
                            {{ $req->status === 'completed' ? 'bg-green-100 text-green-700' : '' }}
                            {{ $req->status === 'pending' ? 'bg-yellow-100 text-yellow-700' : '' }}
                            {{ $req->status === 'cancelled' ? 'bg-red-100 text-red-700' : '' }}
                            {{ $req->status === 'accepted' ? 'bg-blue-100 text-blue-700' : '' }}
                        ">
                            {{ ucfirst($req->status) }}
                        </span>
                    </td>
                    <td class="p-4 text-gray-500">{{ $req->created_at->diffForHumans() }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
