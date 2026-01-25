@extends('layouts.admin')

@section('title', 'Nurse Management')

@section('content')
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
         <div class="p-4 border-b border-gray-200 flex justify-between">
            <h3 class="font-bold text-gray-700">Registered Nurses</h3>
            <button class="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600">
                <i class="fas fa-plus"></i> Invite Nurse
            </button>
        </div>
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                    <th class="p-4">ID</th>
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
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="p-4 font-bold">#{{ $nurse->id }}</td>
                    <td class="p-4">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 font-bold text-slate-600">
                                {{ substr($nurse->user->name ?? 'N', 0, 1) }}
                            </div>
                            <div>
                                <div class="font-bold">{{ $nurse->user->name ?? 'Unknown' }}</div>
                                <div class="text-xs text-gray-400">{{ $nurse->user->email ?? '' }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4">{{ $nurse->years_experience }} Years</td>
                    <td class="p-4 font-mono text-xs bg-gray-50 p-1 rounded inline-block">{{ $nurse->license_number }}</td>
                    <td class="p-4">
                        <i class="fas fa-car text-gray-400 mr-1"></i> {{ $nurse->transport_mode }}
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-xs font-bold
                            {{ $nurse->verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500' }}
                        ">
                            {{ ucfirst($nurse->verification_status) }}
                        </span>
                    </td>
                    <td class="p-4 flex gap-2">
                        <button class="text-blue-500 hover:text-blue-700" title="Edit"><i class="fas fa-edit"></i></button>
                        @if($nurse->verification_status !== 'verified')
                            <button class="text-green-500 hover:text-green-700" title="Verify"><i class="fas fa-check-circle"></i></button>
                        @endif
                        <button class="text-red-500 hover:text-red-700" title="Ban"><i class="fas fa-ban"></i></button>
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
