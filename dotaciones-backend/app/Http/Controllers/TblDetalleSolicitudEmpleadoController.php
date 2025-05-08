<?php

namespace App\Http\Controllers;

use App\Models\TblDetalleSolicitudEmpleado;
use Illuminate\Http\Request;

class TblDetalleSolicitudEmpleadoController extends Controller
{
    public function index()
    {
        return response()->json(TblDetalleSolicitudEmpleado::all());
    }

    public function store(Request $request)
    {
        $registro = TblDetalleSolicitudEmpleado::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblDetalleSolicitudEmpleado::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblDetalleSolicitudEmpleado::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblDetalleSolicitudEmpleado::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
