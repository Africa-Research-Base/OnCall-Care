@extends('layouts.app')

@section('content')
<div class="container mt-4">
    <div class="row mb-4">
        <div class="col-md-8">
            <h2>Hospitals</h2>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('admin.hospitals.create') }}" class="btn btn-primary">Add Hospital</a>
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
                        <th>City</th>
                        <th>Verified</th>
                        <th>Nurses</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($hospitals as $hospital)
                        <tr>
                            <td>{{ $hospital->name }}</td>
                            <td>{{ $hospital->email }}</td>
                            <td>{{ $hospital->phone }}</td>
                            <td>{{ $hospital->city }}</td>
                            <td>
                                @if($hospital->is_verified)
                                    <span class="badge bg-success">Verified</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </td>
                            <td>{{ $hospital->nurse_profiles_count }}</td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="{{ route('admin.hospitals.nurses', $hospital) }}" class="btn btn-info">View Nurses</a>
                                    <a href="{{ route('admin.hospitals.edit', $hospital) }}" class="btn btn-warning">Edit</a>
                                    @if(!$hospital->is_verified)
                                        <form method="POST" action="{{ route('admin.hospitals.verify', $hospital) }}" style="display:inline;">
                                            @csrf
                                            <button type="submit" class="btn btn-success btn-sm">Verify</button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center py-4">No hospitals found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">
        {{ $hospitals->links() }}
    </div>
</div>
@endsection
