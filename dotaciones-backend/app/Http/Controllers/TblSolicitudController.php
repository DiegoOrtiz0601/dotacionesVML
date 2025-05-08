<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\TblSolicitud;
use Illuminate\Http\Request;

class TblSolicitudController extends Controller
{
    public function index()
    {
        return response()->json(TblSolicitud::all());
    }

    public function store(Request $request)
    {
        $registro = TblSolicitud::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblSolicitud::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
    

public function generarNumeroSolicitud()
{
    $ultimo = DB::table('tbl_solicitudes')->max('idSolicitud') ?? 0;
    $nuevoNumero = $ultimo + 1;
    $codigo = 'DOT-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT); // Ejemplo: DOT-0001

    return response()->json([
        'numeroSolicitud' => $codigo,
        'idSolicitud' => $nuevoNumero
    ]);
}

}
