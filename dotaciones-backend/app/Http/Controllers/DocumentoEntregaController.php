<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;

class DocumentoEntregaController extends Controller
{
  public function descargar($documento)
{
    $detalle = DB::table('tbl_detalle_solicitud_empleado')
        ->where('documentoEmpleado', $documento)
        ->orderByDesc('idDetalleSolicitud')
        ->first();

    if (!$detalle || !$detalle->rutaArchivoSolicitudEmpleado) {
        return response()->json(['error' => 'Ruta no registrada'], 404);
    }

    $ruta = storage_path('app/public/' . $detalle->rutaArchivoSolicitudEmpleado);

    if (!file_exists($ruta)) {
        return response()->json(['error' => 'Archivo físico no encontrado'], 404);
    }

    return response()->download($ruta, basename($ruta));
}
}
