<?php

namespace App\Http\Controllers\Api;

use App\Models\TblEmpresa;
use Illuminate\Http\Request;

class TblEmpresaController extends Controller
{
    public function index()
    {
        return response()->json(TblEmpresa::all());
    }

    public function store(Request $request)
    {
        $registro = TblEmpresa::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblEmpresa::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblEmpresa::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblEmpresa::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
