@extends('layouts.app')

@section('content')
<div class="container mt-4">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2>Nurses Management</h2>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('admin.nurses.manage.create') }}" class="btn btn-primary">Add Nurse</a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Contact</th>
                        <th>Hospital</th>
                        <th>License</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($nurses as $nurse)
                        <tr>
                            <td><strong>{{ $nurse->user->name }}</strong></td>
                            <td>{{ $nurse->user->email }}</td>
                            <td>{{ $nurse->user->phone }}</td>
                            <td>{{ $nurse->user->contact ?? 'N/A' }}</td>
                            <td>
                                @if($nurse->hospital)
                                    <a href="{{ route('admin.hospitals.nurses', $nurse->hospital) }}">
                                        {{ $nurse->hospital->name }}
                                    </a>
                                @else
                                    <span class="text-muted">N/A</span>
                                @endif
                            </td>
                            <td>{{ $nurse->license_number ?? 'N/A' }}</td>
                            <td>
                                @if($nurse->is_verified)
                                    <span class="badge bg-success">Verified</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    @if(!$nurse->is_verified)
                                        <form method="POST" action="{{ route('admin.nurses.manage.verify', $nurse) }}" style="display:inline;">
                                            @csrf
                                            <button type="submit" class="btn btn-success btn-sm" title="Verify">✓</button>
                                        </form>
                                    @endif
                                    <a href="{{ route('admin.nurses.manage.edit', $nurse) }}" class="btn btn-warning btn-sm" title="Edit">✎</a>
                                    <form method="POST" action="{{ route('admin.nurses.manage.reset-password', $nurse) }}" style="display:inline;">
                                        @csrf
                                        <button type="submit" class="btn btn-info btn-sm" title="Reset Password">🔑</button>
                                    </form>
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
