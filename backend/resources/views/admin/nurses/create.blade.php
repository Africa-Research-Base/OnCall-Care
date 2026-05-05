@extends('layouts.app')

@section('content')
<div class="container mt-4">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2>Create Nurse</h2>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('admin.nurses.manage') }}" class="btn btn-secondary">Back to Nurses</a>
        </div>
    </div>

    <form method="POST" action="{{ route('admin.nurses.manage.store') }}" class="needs-validation">
        @csrf
        
        <div class="card">
            <div class="card-body">
                <div class="alert alert-info">
                    <strong>Note:</strong> All new nurses will be created with password: <code>password123</code>
                </div>

                <div class="mb-3">
                    <label for="name" class="form-label">Full Name *</label>
                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                           id="name" name="name" value="{{ old('name') }}" required>
                    @error('name')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input type="email" class="form-control @error('email') is-invalid @enderror" 
                           id="email" name="email" value="{{ old('email') }}" required>
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="phone" class="form-label">Phone *</label>
                        <input type="tel" class="form-control @error('phone') is-invalid @enderror" 
                               id="phone" name="phone" value="{{ old('phone') }}" required>
                        @error('phone')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="contact" class="form-label">Contact (Optional)</label>
                        <input type="tel" class="form-control @error('contact') is-invalid @enderror" 
                               id="contact" name="contact" value="{{ old('contact') }}">
                        @error('contact')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="mb-3">
                    <label for="hospital_id" class="form-label">Hospital *</label>
                    <select class="form-control @error('hospital_id') is-invalid @enderror" 
                            id="hospital_id" name="hospital_id" required>
                        <option value="">-- Select Hospital --</option>
                        @foreach($hospitals as $hospital)
                            <option value="{{ $hospital->id }}" @selected(old('hospital_id') == $hospital->id)>
                                {{ $hospital->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('hospital_id')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="license_number" class="form-label">License Number *</label>
                    <input type="text" class="form-control @error('license_number') is-invalid @enderror" 
                           id="license_number" name="license_number" value="{{ old('license_number') }}" required>
                    @error('license_number')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="license_photo_url" class="form-label">License Photo URL</label>
                    <input type="url" class="form-control @error('license_photo_url') is-invalid @enderror" 
                           id="license_photo_url" name="license_photo_url" value="{{ old('license_photo_url') }}">
                    @error('license_photo_url')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="experience_years" class="form-label">Years of Experience</label>
                    <input type="number" class="form-control @error('experience_years') is-invalid @enderror" 
                           id="experience_years" name="experience_years" value="{{ old('experience_years', 0) }}" min="0">
                    @error('experience_years')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="competence_areas" class="form-label">Competence Areas (comma-separated)</label>
                    <textarea class="form-control @error('competence_areas') is-invalid @enderror" 
                              id="competence_areas" name="competence_areas" rows="3" 
                              placeholder="e.g., nursing, patient_care, emergency">{{ old('competence_areas') }}</textarea>
                    @error('competence_areas')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>
            <div class="card-footer">
                <button type="submit" class="btn btn-primary">Create Nurse</button>
                <a href="{{ route('admin.nurses.manage') }}" class="btn btn-secondary">Cancel</a>
            </div>
        </div>
    </form>
</div>
@endsection
