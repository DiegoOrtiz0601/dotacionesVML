<?php

namespace App\Http\Controllers\Api;

use App\Models\TblDetalleSolicitudElemento;
use Illuminate\Http\Request;

class TblDetalleSolicitudElementoController extends Controller
{
    public function index()
    {
        return response()->json(TblDetalleSolicitudElemento::all());
    }

    public function store(Request $request)
    {
        $registro = TblDetalleSolicitudElemento::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblDetalleSolicitudElemento::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblDetalleSolicitudElemento::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblDetalleSolicitudElemento::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
