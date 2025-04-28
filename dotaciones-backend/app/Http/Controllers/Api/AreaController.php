<?php

namespace App\Http\Controllers\Api;

use App\Models\Area;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AreaController extends Controller
{
    public function index()
    {
        return response()->json(Area::all(), 200);
    }

    public function store(Request $request)
    {
        $item = Area::create($request->all());
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Area::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = Area::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
    public function porSede($sedeId)
    {
        return response()->json(Area::where('sede_id', $sedeId)->get(), 200);
    }
}