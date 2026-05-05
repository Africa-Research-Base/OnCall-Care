@extends('layouts.app')

@section('content')
<div class="container mt-4">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2>Nurses at {{ $hospital->name }}</h2>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('admin.hospitals') }}" class="btn btn-secondary">Back to Hospitals</a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card mb-4">
        <div class="card-header">
            <strong>Hospital Information</strong>
        </div>
        <div class="card-body">
            <p><strong>Email:</strong> {{ $hospital->email }}</p>
            <p><strong>Phone:</strong> {{ $hospital->phone }}</p>
            <p><strong>Address:</strong> {{ $hospital->address }}, {{ $hospital->city }}, {{ $hospital->state }}, {{ $hospital->country }}</p>
            <p><strong>Status:</strong> 
                @if($hospital->is_verified)
                    <span class="badge bg-success">Verified</span>
                @else
                    <span class="badge bg-warning">Pending</span>
                @endif
            </p>
        </div>
    </div>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Contact</th>
                        <th>License</th>
                        <th>Verified</th>
                        <th>Experience</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($nurses as $nurse)
                        <tr>
                            <td>{{ $nurse->user->name }}</td>
                            <td>{{ $nurse->user->email }}</td>
                            <td>{{ $nurse->user->phone }}</td>
                            <td>{{ $nurse->user->contact ?? 'N/A' }}</td>
                            <td>{{ $nurse->license_number ?? 'N/A' }}</td>
                            <td>
                                @if($nurse->is_verified)
                                    <span class="badge bg-success">Yes</span>
                                @else
                                    <span class="badge bg-warning">No</span>
                                @endif
                            </td>
                            <td>{{ $nurse->experience_years ?? 0 }} years</td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    @if(!$nurse->is_verified)
                                        <form method="POST" action="{{ route('admin.nurses.manage.verify', $nurse) }}" style="display:inline;">
                                            @csrf
                                            <button type="submit" class="btn btn-success btn-sm">Verify</button>
                                        </form>
                                    @endif
                                    <a href="{{ route('admin.nurses.manage.edit', $nurse) }}" class="btn btn-warning">Edit</a>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-4">No nurses found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">
        {{ $nurses->links() }}
    </div>
</div>
@endsection
