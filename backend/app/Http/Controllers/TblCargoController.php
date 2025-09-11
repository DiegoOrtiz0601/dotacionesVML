<?php

namespace App\Http\Controllers;

use App\Models\TblCargo;
use Illuminate\Http\Request;

class TblCargoController extends Controller
{
    public function index()
    {
        return response()->json(TblCargo::all());
    }

    public function store(Request $request)
    {
        $registro = TblCargo::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblCargo::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblCargo::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblCargo::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
