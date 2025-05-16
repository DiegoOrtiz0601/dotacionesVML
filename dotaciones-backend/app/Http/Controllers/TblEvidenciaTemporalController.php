<?php

namespace App\Http\Controllers;

use App\Traits\UsaLogEvidencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TblEvidenciaTemporalController extends Controller
{
    use UsaLogEvidencia;

    public function guardarEvidencia(Request $request)
    {
        // Validación inicial
        $validator = Validator::make($request->all(), [
            'idSolicitud' => 'required|integer',
            'documentoEmpleado' => 'required|string',
            'nombreEmpresa' => 'required|string',
            'archivo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ]);

        if ($validator->fails()) {
            $errores = $validator->errors()->toArray();
            Log::error('❌ Validación fallida al guardar evidencia', $errores);
            $this->registrarLogEvidencia('VALIDACION_FALLIDA', json_encode($errores));
            return response()->json(['errores' => $validator->errors()], 422);
        }

        // Parámetros
        $idSolicitud = $request->idSolicitud;
        $documento = $request->documentoEmpleado;
        $empresa = preg_replace('/[^A-Za-z0-9_\-]/', '_', $request->nombreEmpresa);
        $archivo = $request->file('archivo');
        $disk = Storage::disk('public');

        // Rutas
        $carpetaEmpresa = "evidencias/$empresa";
        $carpetaDocumento = "$carpetaEmpresa/$documento";

        // Crear carpeta empresa si no existe
        if (!$disk->exists($carpetaEmpresa)) {
            $creado = $disk->makeDirectory($carpetaEmpresa, 0755, true);
            $mensaje = $creado ? '✅ Carpeta empresa creada' : '❌ Error al crear carpeta empresa';
            Log::info("$mensaje: $carpetaEmpresa");
            $this->registrarLogEvidencia('CREAR_CARPETA', "$mensaje: $carpetaEmpresa", $idSolicitud, $documento);
        }

        // Crear carpeta documento si no existe
        if (!$disk->exists($carpetaDocumento)) {
            $creado = $disk->makeDirectory($carpetaDocumento, 0755, true);
            $mensaje = $creado ? '✅ Carpeta documento creada' : '❌ Error al crear carpeta documento';
            Log::info("$mensaje: $carpetaDocumento");
            $this->registrarLogEvidencia('CREAR_CARPETA', "$mensaje: $carpetaDocumento", $idSolicitud, $documento);
        }

        // Generar nombre y ruta final del archivo
        $nombreArchivo = $idSolicitud . '_' . now()->format('Ymd_His') . '.' . $archivo->getClientOriginalExtension();
        $rutaArchivo = "$carpetaDocumento/$nombreArchivo";

        try {
            $disk->put($rutaArchivo, file_get_contents($archivo));
            Log::info("📄 Archivo '{$nombreArchivo}' guardado en '$rutaArchivo'");
            $this->registrarLogEvidencia('GUARDAR_ARCHIVO', "Archivo guardado en $rutaArchivo", $idSolicitud, $documento);
        } catch (\Exception $e) {
            $error = $e->getMessage();
            Log::error("❌ Error al guardar el archivo: $error", ['ruta' => $rutaArchivo]);
            $this->registrarLogEvidencia('ERROR_GUARDAR', $error, $idSolicitud, $documento);
            return response()->json(['error' => 'No se pudo guardar el archivo.'], 500);
        }

        // Registrar evidencia
        DB::table('tbl_evidencias_temporales')->insert([
            'idSolicitud' => $idSolicitud,
            'documentoEmpleado' => $documento,
            'rutaArchivo' => $rutaArchivo,
            'nombreArchivoOriginal' => $archivo->getClientOriginalName(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $url = Storage::url($rutaArchivo);

        return response()->json([
            'mensaje' => '📁 Evidencia guardada correctamente',
            'ruta' => $rutaArchivo,
            'url' => $url
        ], 201);
    }
}
