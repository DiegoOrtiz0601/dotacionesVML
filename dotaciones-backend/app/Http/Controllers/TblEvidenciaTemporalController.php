<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TblEvidenciaTemporalController extends Controller
{
    public function guardarEvidencia(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idSolicitud' => 'required|integer',
            'documentoEmpleado' => 'required|string',
            'nombreEmpresa' => 'required|string',
            'archivo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120' // 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errores' => $validator->errors()], 422);
        }

        $idSolicitud = $request->idSolicitud;
        $documento = $request->documentoEmpleado;
        $empresa = preg_replace('/[^A-Za-z0-9_\-]/', '_', $request->nombreEmpresa);
        $archivo = $request->file('archivo');

        // Estructura: public/EMPRESA/DOCUMENTO/evidencias/
        $rutaBase = "public/$empresa/$documento/evidencias";

        if (!Storage::exists($rutaBase)) {
            Storage::makeDirectory($rutaBase, 0755, true);
        }

        $nombreArchivo = $idSolicitud . '_' . now()->format('Ymd_His') . '.' . $archivo->getClientOriginalExtension();
        $rutaCompleta = "$rutaBase/$nombreArchivo";

        Storage::put($rutaCompleta, file_get_contents($archivo));

        // Guardar en DB
        DB::table('tbl_evidencias_temporales')->insert([
            'idSolicitud' => $idSolicitud,
            'documentoEmpleado' => $documento,
            'rutaArchivo' => $rutaCompleta,
            'nombreArchivoOriginal' => $archivo->getClientOriginalName(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['mensaje' => '📁 Evidencia guardada correctamente', 'ruta' => $rutaCompleta], 201);
    }
}
