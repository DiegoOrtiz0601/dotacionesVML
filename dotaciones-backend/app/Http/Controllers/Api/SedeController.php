<?php

namespace App\Http\Controllers\Api;

use App\Models\Sede;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SedeController extends Controller
{
    public function index()
    {
        return response()->json(Sede::all(), 200);
    }

    public function store(Request $request)
    {
        $item = Sede::create($request->all());
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Sede::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = Sede::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
    public function porEmpresa($empresaId)
    {
        return response()->json(Sede::where('empresa_id', $empresaId)->get(), 200);
    }
}