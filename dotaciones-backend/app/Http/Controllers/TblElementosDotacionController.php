<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TblElementosDotacionController extends Controller
{
    public function obtenerElementos(Request $request)
    {
        $idEmpresa = $request->input('idEmpresa');
        $idCargo = $request->input('idCargo');

        if (!$idEmpresa || !$idCargo) {
            return response()->json(['message' => 'Faltan parámetros requeridos'], 400);
        }

        // Consulta optimizada con índices
        $elementos = DB::table('tbl_elementos')
            ->where('IdEmpresa', $idEmpresa)
            ->where('IdCargo', $idCargo)
            ->where('estadoElemento', 1)
            ->select(
                'idElemento',
                'nombreElemento',
                'talla'
            )
            ->orderBy('nombreElemento')
            ->orderBy('talla')
            ->get()
            ->groupBy('nombreElemento')
            ->map(function ($items) {
                return [
                    'idElemento' => $items->first()->idElemento,
                    'nombreElemento' => $items->first()->nombreElemento,
                    'tallas' => $items->pluck('talla')->implode(', ')
                ];
            })
            ->values();

        return response()->json($elementos);
    }
}
