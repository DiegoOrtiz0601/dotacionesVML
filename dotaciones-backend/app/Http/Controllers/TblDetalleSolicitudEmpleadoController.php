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
    $validated = $request->validate([
        'idSolicitud'             => 'required|exists:tbl_solicitudes,idSolicitud',
        'nombresEmpleado'         => 'required|string|max:100',
        'documentoEmpleado'       => 'required|string|max:20',
        'idCargo'                 => 'required|exists:tbl_cargos,idCargo',
        'IdTipoSolicitud'         => 'required|exists:tbl_tipo_solicitud,IdTipoSolicitud',
        'observaciones'           => 'nullable|string|max:255',
        'EstadoSolicitudEmpleado' => 'required|string|max:50',
    ]);

    $registro = TblDetalleSolicitudEmpleado::create($validated);

    return response()->json([
        'message' => 'Detalle guardado exitosamente',
        'idDetalleSolicitud' => $registro->idDetalleSolicitud
    ], 201);
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
