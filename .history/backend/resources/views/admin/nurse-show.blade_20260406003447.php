@extends('layouts.admin')

@section('title', 'Nurse Details')

@section('content')
    @if(session('status'))
        <div class="mb-4 rounded-md bg-green-100 border border-green-200 text-green-800 px-4 py-3">
            {{ session('status') }}
        </div>
    @endif

    @php
        $profile = $nurse->nurseProfile;
        $accountStatus = $profile?->account_status ?? 'active';
    @endphp

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-slate-800">Profile Overview</h3>
                <a href="{{ route('admin.nurses.edit', $nurse) }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                    <i class="fas fa-edit mr-1"></i> Edit Nurse
                </a>
            </div>

            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <dt class="text-gray-500">Name</dt>
                    <dd class="font-semibold">{{ $nurse->name }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Email</dt>
                    <dd class="font-semibold">{{ $nurse->email }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Phone</dt>
                    <dd class="font-semibold">{{ $nurse->phone ?? 'N/A' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Role</dt>
                    <dd class="font-semibold">{{ ucfirst($nurse->role) }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">License Number</dt>
                    <dd class="font-semibold">{{ $profile?->license_number ?? 'N/A' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Transport Mode</dt>
                    <dd class="font-semibold">{{ $profile?->transport_mode ?? 'N/A' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Experience</dt>
                    <dd class="font-semibold">{{ $profile?->experience_years ?? 0 }} years</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Verification</dt>
                    <dd class="font-semibold">{{ ($profile?->is_verified) ? 'Verified' : 'Not Verified' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Account Status</dt>
                    <dd class="font-semibold">{{ ucfirst($accountStatus) }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Suspended Until</dt>
                    <dd class="font-semibold">{{ $profile?->suspended_until?->format('Y-m-d H:i') ?? 'N/A' }}</dd>
                </div>
                <div class="md:col-span-2">
                    <dt class="text-gray-500">Competence Areas</dt>
                    <dd class="font-semibold">
                        {{ is_array($profile?->competence_areas) && count($profile->competence_areas) ? implode(', ', $profile->competence_areas) : 'N/A' }}
                    </dd>
                </div>
                <div class="md:col-span-2">
                    <dt class="text-gray-500">Status Reason</dt>
                    <dd class="font-semibold">{{ $profile?->status_reason ?? 'N/A' }}</dd>
                </div>
            </dl>
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div class="space-y-3">
                    <form method="POST" action="{{ route('admin.nurses.verify', $nurse) }}">
                        @csrf
                        <button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" type="submit">Verify Nurse</button>
                    </form>

                    @if(!($profile?->is_verified))
                        <form method="POST" action="{{ route('admin.nurses.reject', $nurse) }}">
                            @csrf
                            <button class="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700" type="submit">Decline Application</button>
                        </form>
                    @endif

                    <form method="POST" action="{{ route('admin.nurses.activate', $nurse) }}">
                        @csrf
                        <button class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700" type="submit">Activate Nurse</button>
                    </form>

                    <form method="POST" action="{{ route('admin.nurses.delete', $nurse) }}" onsubmit="return confirm('Delete this nurse account permanently?')">
                        @csrf
                        @method('DELETE')
                        <button class="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700" type="submit">Delete Nurse</button>
                    </form>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Suspend Nurse</h3>
                <form method="POST" action="{{ route('admin.nurses.suspend', $nurse) }}" class="space-y-3">
                    @csrf
                    <div>
                        <label class="text-sm text-gray-600">Reason</label>
                        <textarea name="reason" class="w-full border rounded px-3 py-2" rows="2" placeholder="Reason for suspension"></textarea>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">Until</label>
                        <input name="until" type="datetime-local" class="w-full border rounded px-3 py-2">
                    </div>
                    <button class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700" type="submit">Suspend Nurse</button>
                </form>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Ban Nurse</h3>
                <form method="POST" action="{{ route('admin.nurses.ban', $nurse) }}" class="space-y-3">
                    @csrf
                    <div>
                        <label class="text-sm text-gray-600">Reason</label>
                        <textarea name="reason" class="w-full border rounded px-3 py-2" rows="2" placeholder="Reason for ban"></textarea>
                    </div>
                    <button class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700" type="submit">Ban Nurse</button>
                </form>
            </div>
        </div>
    </div>
@endsection
