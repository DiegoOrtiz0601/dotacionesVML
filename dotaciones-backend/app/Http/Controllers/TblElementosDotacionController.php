<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ElementosDotacionController extends Controller
{
    public function obtenerElementos(Request $request)
    {
        $idSolicitud = $request->input('idSolicitud');

        if (!$idSolicitud) {
            return response()->json(['message' => 'Falta idSolicitud'], 400);
        }

        // Buscar los datos de empresa y cargo de los empleados en esa solicitud
        $datosEmpleado = DB::table('tbl_detalle_solicitud_empleado')
            ->where('idSolicitud', $idSolicitud)
            ->select('idCargo', 'IdEmpresa')
            ->first();

        if (!$datosEmpleado) {
            return response()->json(['message' => 'No se encontraron datos del empleado para esta solicitud'], 404);
        }

        $elementos = DB::table('tbl_elementos')
            ->where('IdCargo', $datosEmpleado->idCargo)
            ->where('IdEmpresa', $datosEmpleado->IdEmpresa)
            ->where('estadoElemento', 1)
            ->select('idElemento', 'nombreElemento', 'talla')
            ->get();

        return response()->json($elementos);
    }
}
