<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Address;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->addresses()->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        $address = $request->user()->addresses()->create($validated);

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address)
    {
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }
}
