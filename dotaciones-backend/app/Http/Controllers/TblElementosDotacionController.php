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

       $elementos = DB::table('tbl_elementos')
    ->where('IdEmpresa', $idEmpresa)
    ->where('IdCargo', $idCargo)
    ->where('estadoElemento', 1)
    ->select(
        DB::raw('MIN(idElemento) as idElemento'),
        'nombreElemento',
        DB::raw('STRING_AGG(talla, \', \') AS tallas')
    )
    ->groupBy('nombreElemento')
    ->get();


        return response()->json($elementos);
    }
}
