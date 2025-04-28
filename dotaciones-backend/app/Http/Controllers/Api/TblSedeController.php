<?php

namespace App\Http\Controllers\Api;

use App\Models\TblSede;
use Illuminate\Http\Request;

class TblSedeController extends Controller
{
    public function index()
    {
        return response()->json(TblSede::all());
    }

    public function store(Request $request)
    {
        $registro = TblSede::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblSede::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblSede::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblSede::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
