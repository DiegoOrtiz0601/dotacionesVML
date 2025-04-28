<?php

namespace App\Http\Controllers\Api;

use App\Models\Ciudad;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CiudadController extends Controller
{
    public function index()
    {
        return response()->json(Ciudad::all(), 200);
    }

    public function store(Request $request)
    {
        $item = Ciudad::create($request->all());
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Ciudad::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = Ciudad::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}