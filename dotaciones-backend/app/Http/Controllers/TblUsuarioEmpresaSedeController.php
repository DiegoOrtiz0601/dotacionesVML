<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TblUsuarioEmpresaSedeController extends Controller
{
    public function getEmpresasYSedes(Request $request)
{
    $usuario = $request->user();

    if (!$usuario) {
        return response()->json(['message' => 'Usuario no autenticado'], 401);
    }

    $asignaciones = DB::table('tbl_usuario_empresa_sede_cargos')
        ->join('tbl_empresa', 'tbl_usuario_empresa_sede_cargos.IdEmpresa', '=', 'tbl_empresa.IdEmpresa')
        ->join('tbl_sedes', 'tbl_usuario_empresa_sede_cargos.IdSede', '=', 'tbl_sedes.IdSede')
        ->where('tbl_usuario_empresa_sede_cargos.IdUsuario', $usuario->idUsuario)
        ->select(
            'tbl_empresa.IdEmpresa',
            'tbl_empresa.NombreEmpresa',
            'tbl_empresa.ruta_logo',
            'tbl_sedes.IdSede',
            'tbl_sedes.NombreSede'
        )
        ->get();

    if ($asignaciones->isEmpty()) {
        return response()->json([
            'empresas' => [],
            'sedes' => [],
            'usuario' => null
        ]);
    }

    $empresas = $asignaciones->map(function ($item) {
        return [
            'IdEmpresa' => $item->IdEmpresa,
            'NombreEmpresa' => $item->NombreEmpresa,
            'ruta_logo' => $item->ruta_logo,
        ];
    })->unique('IdEmpresa')->values();

    $sedes = $asignaciones->map(function ($item) {
        return [
            'IdSede' => $item->IdSede,
            'NombreSede' => $item->NombreSede,
            'IdEmpresa' => $item->IdEmpresa
        ];
    })->unique('IdSede')->values();

    \Log::info('📦 Sedes generadas:', $sedes->toArray());

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
    
        // Cargar solo los cargos de la empresa seleccionada
        $cargos = DB::table('tbl_cargo')
            ->where('IdEmpresa', $idEmpresa)
            ->select('IdCargo', 'NombreCargo')
            ->get();
    
        return response()->json($cargos);
    }
    
}
