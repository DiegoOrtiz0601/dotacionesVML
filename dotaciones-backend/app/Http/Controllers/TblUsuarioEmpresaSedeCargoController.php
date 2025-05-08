<?php

namespace App\Http\Controllers;

use App\Models\TblUsuarioEmpresaSedeCargo;
use Illuminate\Http\Request;

class TblUsuarioEmpresaSedeCargoController extends Controller
{
    public function index()
    {
        return response()->json(TblUsuarioEmpresaSedeCargo::all());
    }

    public function store(Request $request)
    {
        $registro = TblUsuarioEmpresaSedeCargo::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblUsuarioEmpresaSedeCargo::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblUsuarioEmpresaSedeCargo::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblUsuarioEmpresaSedeCargo::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
