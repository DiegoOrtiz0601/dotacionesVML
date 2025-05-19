<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EntregaPDFController extends Controller
{
    public function generar(Request $request)
    {
        // Paso 1: Leer JSON crudo
        $raw = $request->getContent();
        Log::info('🧾 Paso 1 - RAW JSON recibido:', ['content' => $raw]);

        // Paso 2: Decodificar
        $wrapper = json_decode($raw, true);
        $datos = json_decode($wrapper['content'] ?? '{}', true);
        Log::info('📌 Paso 2 - Datos decodificados:', $datos);

        // Paso 3: Validación manual
        $validator = Validator::make($datos, [
            'empresa' => 'required|string',
            'sede' => 'required|string',
            'nit' => 'required|string',
            'empleado' => 'required|array',
            'firma' => 'nullable|string',
            'numeroSolicitud' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::warning('❌ Paso 4 - Validación fallida', $validator->errors()->toArray());
            return response()->json([
                'error' => 'Validación fallida',
                'detalles' => $validator->errors(),
            ], 422);
        }

        // Paso 4: Preparar datos para el PDF
        $datos['fecha'] = now()->format('Y-m-d');
        $datos['logo'] = $datos['logo'] ?? null;

        // Paso 5: Generar PDF
        $pdf = Pdf::loadView('pdf.entrega_dotacion', $datos);
        $contenidoPDF = $pdf->output();

        if (empty($contenidoPDF)) {
            Log::error('⚠️ PDF vacío o inválido');
            return response()->json(['error' => 'No se pudo generar el PDF. Contenido vacío.'], 500);
        }

        // Paso 6: Guardar en disco
        $documento = $datos['empleado']['documento'];
        $empresaNombre = Str::slug($datos['empresa']);
        $ruta = "Entregas/{$empresaNombre}/{$documento}";
        $nombreArchivo = "Entrega_{$datos['numeroSolicitud']}_{$documento}.pdf";
        $pathCompleto = "{$ruta}/{$nombreArchivo}";

        Storage::disk('public')->makeDirectory($ruta);
        Storage::disk('public')->put($pathCompleto, $contenidoPDF);

        // Paso 7: Marcar como entregado y guardar ruta y fecha
        DB::table('tbl_detalle_solicitud_empleado')
            ->where('idDetalleSolicitud', '=', $datos['empleado']['idDetalleSolicitud'])
            ->update([
                'EstadoSolicitudEmpleado' => 'Entregado',
                'rutaArchivoSolicitudEmpleado' => $pathCompleto,
                'fechaActualizacionSolicitud' => now()
            ]);

        // Paso 8: Guardar historial
        $elementos = DB::table('tbl_detalle_solicitud_elemento')
            ->where('idDetalleSolicitud', $datos['empleado']['idDetalleSolicitud'])
            ->select('idDetalleSolicitudElementos as idElementoDetalle', 'Cantidad')
            ->get();

        foreach ($elementos as $elemento) {
            DB::table('tbl_historial_aprobacion_elemento')->insert([
                'idElementoDetalle' => $elemento->idElementoDetalle,
                'cantidadAnterior' => $elemento->Cantidad,
                'cantidadNueva' => $elemento->Cantidad,
                'estadoAnterior' => 'Aprobado',
                'estadoNuevo' => 'Entregado',
                'observacion' => 'Entrega final confirmada con firma',
                'usuarioResponsable' => auth()->user()->NombreUsuario ?? 'sistema',
                'fechaCambio' => now()
            ]);
        }

        // Paso 9: Verificar cierre de solicitud
        $idSolicitud = DB::table('tbl_detalle_solicitud_empleado')
            ->where('idDetalleSolicitud', '=', $datos['empleado']['idDetalleSolicitud'])
            ->value('idSolicitud');

        $pendientes = DB::table('tbl_detalle_solicitud_empleado')
            ->where('idSolicitud', $idSolicitud)
            ->where('EstadoSolicitudEmpleado', '!=', 'Entregado')
            ->count();

        if ($pendientes === 0) {
            DB::table('tbl_solicitudes')
                ->where('id', $idSolicitud)
                ->update(['estadoSolicitud' => 'Cerrada']);
        }

        Log::info('✅ PDF generado y proceso completado exitosamente.', ['archivo' => $pathCompleto]);

        return response()->json([
            'mensaje' => 'Entrega registrada y PDF generado correctamente.',
            'archivo' => $pathCompleto,
        ]);
    }
}
