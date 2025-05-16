<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LogEvidenciaService
{
    /**
     * Registrar una entrada de auditoría en la tabla tbl_log_evidencias.
     *
     * @param string $accion             Tipo de acción: 'CREAR_CARPETA', 'GUARDAR_ARCHIVO', etc.
     * @param string $mensaje            Detalle del evento.
     * @param int|null $idSolicitud      ID de la solicitud relacionada (opcional).
     * @param string|null $documento     Documento del empleado relacionado (opcional).
     * @param string|null $usuario       Usuario responsable del evento (opcional).
     * @return void
     */
    public static function registrar($accion, $mensaje, $idSolicitud = null, $documento = null, $usuario = null)
    {
        try {
            DB::table('tbl_log_evidencias')->insert([
                'idSolicitud' => $idSolicitud,
                'documentoEmpleado' => $documento,
                'accion' => $accion,
                'mensaje' => $mensaje,
                'usuario' => $usuario ?? 'sistema',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error al registrar log en BD: " . $e->getMessage(), [
                'accion' => $accion,
                'mensaje' => $mensaje,
                'idSolicitud' => $idSolicitud,
                'documento' => $documento,
                'usuario' => $usuario
            ]);
        }
    }
}
