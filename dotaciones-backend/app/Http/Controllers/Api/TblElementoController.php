<?php

namespace App\Http\Controllers\Api;

use App\Models\TblElemento;
use Illuminate\Http\Request;

class TblElementoController extends Controller
{
    public function index()
    {
        return response()->json(TblElemento::all());
    }

    public function store(Request $request)
    {
        $registro = TblElemento::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblElemento::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblElemento::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblElemento::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
