<?php

namespace App\Http\Controllers\Api;

use App\Models\TblTallaElemento;
use Illuminate\Http\Request;

class TblTallaElementoController extends Controller
{
    public function index()
    {
        return response()->json(TblTallaElemento::all());
    }

    public function store(Request $request)
    {
        $registro = TblTallaElemento::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblTallaElemento::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblTallaElemento::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblTallaElemento::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
