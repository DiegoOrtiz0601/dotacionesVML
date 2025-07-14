<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TblElementosDotacionController extends Controller
{
    public function obtenerElementos(Request $request)
    {
        $startTime = microtime(true);
        
        $idEmpresa = $request->input('idEmpresa');
        $idCargo = $request->input('idCargo');

        Log::info('🚀 Iniciando consulta de elementos de dotación', [
            'idEmpresa' => $idEmpresa,
            'idCargo' => $idCargo
        ]);

        if (!$idEmpresa || !$idCargo) {
            return response()->json(['message' => 'Faltan parámetros requeridos'], 400);
        }

        // Consulta optimizada con GROUP_CONCAT en SQL
        $elementos = DB::select("
            SELECT 
                MIN(idElemento) as idElemento,
                nombreElemento,
                STRING_AGG(talla, ', ') as tallas
            FROM tbl_elementos 
            WHERE IdEmpresa = ? 
                AND IdCargo = ? 
                AND estadoElemento = 1
            GROUP BY nombreElemento
            ORDER BY nombreElemento
        ", [$idEmpresa, $idCargo]);

        $endTime = microtime(true);
        $executionTime = round(($endTime - $startTime) * 1000, 2);
        
        Log::info('✅ Consulta de elementos completada', [
            'tiempo_ejecucion_ms' => $executionTime,
            'cantidad_elementos' => count($elementos),
            'idEmpresa' => $idEmpresa,
            'idCargo' => $idCargo
        ]);

        return response()->json($elementos);
    }
}
