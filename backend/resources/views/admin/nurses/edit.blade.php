@extends('layouts.app')

@section('content')
<div class="container mt-4">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2>Edit Nurse: {{ $nurse->user->name }}</h2>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('admin.nurses.manage') }}" class="btn btn-secondary">Back to Nurses</a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="row">
        <div class="col-md-8">
            <form method="POST" action="{{ route('admin.nurses.manage.update', $nurse) }}" class="needs-validation">
                @csrf
                @method('PUT')
                
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>Personal Information</strong>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="name" class="form-label">Full Name</label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                   id="name" name="name" value="{{ old('name', $nurse->user->name) }}">
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                   id="email" name="email" value="{{ old('email', $nurse->user->email) }}">
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="tel" class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" name="phone" value="{{ old('phone', $nurse->user->phone) }}">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-6 mb-3">
                                <label for="contact" class="form-label">Contact</label>
                                <input type="tel" class="form-control @error('contact') is-invalid @enderror" 
                                       id="contact" name="contact" value="{{ old('contact', $nurse->user->contact) }}">
                                @error('contact')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header">
                        <strong>Professional Information</strong>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="hospital_id" class="form-label">Hospital</label>
                            <select class="form-control @error('hospital_id') is-invalid @enderror" 
                                    id="hospital_id" name="hospital_id">
                                @foreach(\App\Models\Hospital::all() as $hospital)
                                    <option value="{{ $hospital->id }}" @selected(old('hospital_id', $nurse->hospital_id) == $hospital->id)>
                                        {{ $hospital->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('hospital_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="license_number" class="form-label">License Number</label>
                            <input type="text" class="form-control @error('license_number') is-invalid @enderror" 
                                   id="license_number" name="license_number" value="{{ old('license_number', $nurse->license_number) }}">
                            @error('license_number')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="experience_years" class="form-label">Years of Experience</label>
                            <input type="number" class="form-control @error('experience_years') is-invalid @enderror" 
                                   id="experience_years" name="experience_years" value="{{ old('experience_years', $nurse->experience_years) }}" min="0">
                            @error('experience_years')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">Update Nurse</button>
                    <a href="{{ route('admin.nurses.manage') }}" class="btn btn-secondary">Cancel</a>
                </div>
            </form>
        </div>

        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-header">
                    <strong>Account Status</strong>
                </div>
                <div class="card-body">
                    <p><strong>Status:</strong>
                        @if($nurse->is_verified)
                            <span class="badge bg-success">Verified</span>
                        @else
                            <span class="badge bg-warning">Pending</span>
                        @endif
                    </p>
                    <p><strong>Account:</strong>
                        <span class="badge bg-{{ $nurse->account_status === 'active' ? 'success' : 'danger' }}">
                            {{ ucfirst($nurse->account_status) }}
                        </span>
                    </p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <strong>Actions</strong>
                </div>
                <div class="card-body">
                    @if(!$nurse->is_verified)
                        <form method="POST" action="{{ route('admin.nurses.manage.verify', $nurse) }}" class="mb-2">
                            @csrf
                            <button type="submit" class="btn btn-success btn-sm w-100">Verify Nurse</button>
                        </form>
                    @endif

                    <form method="POST" action="{{ route('admin.nurses.manage.reset-password', $nurse) }}" class="mb-2">
                        @csrf
                        <button type="submit" class="btn btn-info btn-sm w-100">Reset Password</button>
                    </form>

                    @if($nurse->account_status === 'active')
                        <button type="button" class="btn btn-warning btn-sm w-100" data-bs-toggle="modal" data-bs-target="#suspendModal">
                            Suspend Nurse
                        </button>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Suspend Modal -->
<div class="modal fade" id="suspendModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST" action="{{ route('admin.nurses.manage.suspend', $nurse) }}">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Suspend Nurse</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="reason" class="form-label">Reason *</label>
                        <textarea class="form-control" id="reason" name="reason" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="days" class="form-label">Days to Suspend (1-365) *</label>
                        <input type="number" class="form-control" id="days" name="days" min="1" max="365" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-warning">Suspend</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
