<?php

namespace App\Http\Controllers;

use App\Models\TblCiudad;
use Illuminate\Http\Request;

class TblCiudadController extends Controller
{
    public function index()
    {
        return response()->json(TblCiudad::all());
    }

    public function store(Request $request)
    {
        $registro = TblCiudad::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblCiudad::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblCiudad::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblCiudad::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
