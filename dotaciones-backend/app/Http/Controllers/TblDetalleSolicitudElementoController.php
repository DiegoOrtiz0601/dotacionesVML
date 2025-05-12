<?php

namespace App\Http\Controllers;

use App\Models\TblDetalleSolicitudElemento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TblDetalleSolicitudElementoController extends Controller
{
    public function index()
    {
        return response()->json(TblDetalleSolicitudElemento::all());
    }

    public function store(Request $request)
{
    Log::info('📩 Payload recibido en detalle-solicitud-elemento', $request->all());

    $request->validate([
        'idDetalleSolicitud' => 'required|exists:tbl_detalle_solicitud_empleado,idDetalleSolicitud',
        'idElemento' => 'required|exists:tbl_elementos,idElemento',
        'TallaElemento' => 'required|string|max:20',
        'Cantidad' => 'required|integer|min:1',
    ]);

    $registro = TblDetalleSolicitudElemento::create([
        'idDetalleSolicitud' => $request->idDetalleSolicitud,
        'idElemento' => $request->idElemento,
        'TallaElemento' => $request->TallaElemento,
        'Cantidad' => $request->Cantidad
    ]);

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
