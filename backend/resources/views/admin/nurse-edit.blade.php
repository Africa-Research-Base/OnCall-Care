@extends('layouts.admin')

@section('title', 'Edit Nurse')

@section('content')
<div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold text-slate-800 mb-6">Edit Nurse Profile</h3>

    <form method="POST" action="{{ route('admin.nurses.update', $nurse) }}" class="space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="text-sm text-gray-600">Name</label>
                <input name="name" value="{{ old('name', $nurse->name) }}" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Email</label>
                <input name="email" type="email" value="{{ old('email', $nurse->email) }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Phone</label>
                <input name="phone" value="{{ old('phone', $nurse->phone) }}" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Transport Mode</label>
                <select name="transport_mode" class="w-full border rounded px-3 py-2">
                    @php $mode = old('transport_mode', $nurse->nurseProfile?->transport_mode); @endphp
                    @foreach(['Car', 'Motorcycle', 'Bicycle', 'Walk'] as $item)
                    <option value="{{ $item }}" {{ $mode===$item ? 'selected' : '' }}>{{ $item }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="text-sm text-gray-600">License Number</label>
                <input name="license_number" value="{{ old('license_number', $nurse->nurseProfile?->license_number) }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">License Photo URL</label>
                <input name="license_photo_url"
                    value="{{ old('license_photo_url', $nurse->nurseProfile?->license_photo_url) }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Experience Years</label>
                <input type="number" min="0" max="60" name="experience_years"
                    value="{{ old('experience_years', $nurse->nurseProfile?->experience_years) }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Verification Level</label>
                <input type="number" min="1" max="3" name="verification_level"
                    value="{{ old('verification_level', $nurse->nurseProfile?->verification_level ?? 1) }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div class="md:col-span-2">
                <label class="text-sm text-gray-600">Competence Areas (comma separated)</label>
                <input name="competence_areas"
                    value="{{ old('competence_areas', is_array($nurse->nurseProfile?->competence_areas) ? implode(', ', $nurse->nurseProfile->competence_areas) : '') }}"
                    class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Latitude</label>
                <input name="lat" value="{{ old('lat', $nurse->lat) }}" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Longitude</label>
                <input name="lng" value="{{ old('lng', $nurse->lng) }}" class="w-full border rounded px-3 py-2" />
            </div>
        </div>

        @if($errors->any())
        <div class="rounded-md bg-red-100 border border-red-200 text-red-800 px-4 py-3">
            <ul class="list-disc pl-5">
                @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('admin.nurses.show', $nurse) }}"
                class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</a>
            <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save
                Changes</button>
        </div>
    </form>
</div>
@endsection