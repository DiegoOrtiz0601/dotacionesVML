<?php

namespace App\Traits;

use App\Services\LogEvidenciaService;

trait UsaLogEvidencia
{
    /**
     * Registrar una entrada en la tabla tbl_log_evidencias.
     *
     * @param string $accion      Tipo de evento: CREAR_CARPETA, GUARDAR_ARCHIVO, ERROR, etc.
     * @param string $mensaje     Mensaje descriptivo del evento.
     * @param int|null $idSolicitud      ID de la solicitud (opcional).
     * @param string|null $documento     Documento del empleado (opcional).
     * @param string|null $usuario       Usuario responsable (opcional).
     * @return void
     */
    public function registrarLogEvidencia(string $accion, string $mensaje, $idSolicitud = null, $documento = null, $usuario = null)
    {
        LogEvidenciaService::registrar($accion, $mensaje, $idSolicitud, $documento, $usuario);
    }
}
