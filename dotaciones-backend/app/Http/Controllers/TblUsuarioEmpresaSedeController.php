<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TblUsuarioEmpresaSedeController extends Controller
{
    public function getEmpresasYSedes(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        // ✅ Consulta optimizada: solo campos necesarios
        $asignaciones = DB::table('tbl_usuario_empresa_sede_cargos as uec')
            ->join('tbl_empresa as emp', 'uec.IdEmpresa', '=', 'emp.IdEmpresa')
            ->join('tbl_sedes as sed', 'uec.IdSede', '=', 'sed.IdSede')
            ->where('uec.IdUsuario', $usuario->idUsuario)
            ->select(
                'emp.IdEmpresa',
                'emp.NombreEmpresa',
                'emp.ruta_logo',
                'sed.IdSede',
                'sed.NombreSede'
            )
            ->get();

        if ($asignaciones->isEmpty()) {
            return response()->json([
                'empresas' => [],
                'sedes' => [],
                'usuario' => null
            ]);
        }

        // ✅ Consolidación sin doble map
        $empresas = [];
        $sedes = [];
        $empresaIds = [];
        $sedeIds = [];

        foreach ($asignaciones as $item) {
            if (!in_array($item->IdEmpresa, $empresaIds)) {
                $empresas[] = [
                    'IdEmpresa' => $item->IdEmpresa,
                    'NombreEmpresa' => $item->NombreEmpresa,
                    'ruta_logo' => $item->ruta_logo,
                ];
                $empresaIds[] = $item->IdEmpresa;
            }

            if (!in_array($item->IdSede, $sedeIds)) {
                $sedes[] = [
                    'IdSede' => $item->IdSede,
                    'NombreSede' => $item->NombreSede,
                    'IdEmpresa' => $item->IdEmpresa
                ];
                $sedeIds[] = $item->IdSede;
            }
        }

        Log::info("📦 Sedes generadas para usuario {$usuario->idUsuario}", ['total_sedes' => count($sedes)]);

        return response()->json([
            'empresas' => $empresas,
            'sedes' => $sedes,
            'usuario' => [
                'nombre' => $usuario->NombreCompleto ?? $usuario->name ?? '',
                'correo' => $usuario->email ?? '',
                'documento' => $usuario->documento ?? ''
            ]
        ]);
    }

    public function getCargosPorEmpresaYSede(Request $request)
    {
        $idEmpresa = $request->input('idEmpresa');

        $cargos = DB::table('tbl_cargo')
            ->where('IdEmpresa', $idEmpresa)
            ->select('IdCargo', 'NombreCargo')
            ->get();

        return response()->json($cargos);
    }
}
