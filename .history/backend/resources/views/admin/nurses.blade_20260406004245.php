@extends('layouts.admin')

@section('title', 'Nurse Management')

@section('content')
@if(session('status'))
<div class="mb-4 rounded-md bg-green-100 border border-green-200 text-green-800 px-4 py-3">
    {{ session('status') }}
</div>
@endif

<div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="font-bold text-gray-700">Registered Nurses</h3>
        <span class="text-sm text-gray-500">{{ $nurses->total() }} records</span>
    </div>
    <table class="w-full text-left border-collapse">
        <thead>
            <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                <th class="p-4">User</th>
                <th class="p-4">Nurse Name</th>
                <th class="p-4">Experience</th>
                <th class="p-4">License</th>
                <th class="p-4">Vehicle</th>
                <th class="p-4">Status</th>
                <th class="p-4">Actions</th>
            </tr>
        </thead>
        <tbody class="text-sm text-gray-700">
            @foreach($nurses as $nurse)
            @php
            $profile = $nurse->nurseProfile;
            $accountStatus = $profile?->account_status ?? 'active';
            @endphp
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4 font-bold">#{{ $nurse->id }}</td>
                <td class="p-4">
                    <div class="flex items-center">
                        <div
                            class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 font-bold text-slate-600">
                            {{ substr($nurse->name ?? 'N', 0, 1) }}
                        </div>
                        <div>
                            <div class="font-bold">{{ $nurse->name ?? 'Unknown' }}</div>
                            <div class="text-xs text-gray-400">{{ $nurse->email ?? '' }}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4">{{ $profile?->experience_years ?? 0 }} Years</td>
                <td class="p-4 font-mono text-xs bg-gray-50 rounded inline-block">{{ $profile?->license_number ?? 'N/A'
                    }}</td>
                <td class="p-4">
                    <i class="fas fa-car text-gray-400 mr-1"></i> {{ $profile?->transport_mode ?? 'N/A' }}
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-xs font-bold
                            {{ $accountStatus === 'active' ? 'bg-green-100 text-green-700' : ($accountStatus === 'suspended' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') }}
                        ">
                        {{ ucfirst($accountStatus) }}
                    </span>
                    @if($profile?->is_verified)
                    <span
                        class="ml-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Verified</span>
                    @endif
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <a href="{{ route('admin.nurses.show', $nurse) }}" class="text-slate-600 hover:text-slate-800"
                            title="View"><i class="fas fa-eye"></i></a>
                        <a href="{{ route('admin.nurses.edit', $nurse) }}" class="text-blue-500 hover:text-blue-700"
                            title="Edit"><i class="fas fa-edit"></i></a>

                        @if(!($profile?->is_verified))
                        <form method="POST" action="{{ route('admin.nurses.verify', $nurse) }}">
                            @csrf
                            <button class="text-green-500 hover:text-green-700" title="Verify" type="submit"><i
                                    class="fas fa-check-circle"></i></button>
                        </form>

                        <form method="POST" action="{{ route('admin.nurses.reject', $nurse) }}">
                            @csrf
                            <button class="text-orange-500 hover:text-orange-700" title="Decline" type="submit"><i
                                    class="fas fa-times-circle"></i></button>
                        </form>
                        @endif

                        @if($accountStatus !== 'active')
                        <form method="POST" action="{{ route('admin.nurses.activate', $nurse) }}">
                            @csrf
                            <button class="text-emerald-500 hover:text-emerald-700" title="Activate" type="submit"><i
                                    class="fas fa-user-check"></i></button>
                        </form>
                        @endif

                        @if($accountStatus !== 'banned')
                        <form method="POST" action="{{ route('admin.nurses.ban', $nurse) }}">
                            @csrf
                            <input type="hidden" name="reason" value="Banned from admin web panel">
                            <button class="text-red-500 hover:text-red-700" title="Ban" type="submit"><i
                                    class="fas fa-ban"></i></button>
                        </form>
                        @endif

                        <form method="POST" action="{{ route('admin.nurses.delete', $nurse) }}"
                            onsubmit="return confirm('Delete this nurse account permanently?')">
                            @csrf
                            @method('DELETE')
                            <button class="text-rose-600 hover:text-rose-800" title="Delete" type="submit"><i
                                    class="fas fa-trash"></i></button>
                        </form>
                    </div>
                    @if($profile?->status_reason)
                    <div class="text-xs text-gray-500 mt-2">Reason: {{ $profile->status_reason }}</div>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="p-4">
        {{ $nurses->links() }}
    </div>
</div>
@endsection