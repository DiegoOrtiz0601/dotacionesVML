<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EntregaSolicitudController extends Controller
{
    public function solicitudesParaEntrega(Request $request)
    {
        try {
            $usuario = auth()->user();

            Log::info('🕵️ Usuario autenticado en solicitudes-entrega', [
                'id' => $usuario?->idUsuario,
                'tipo' => gettype($usuario?->idUsuario)
            ]);

            if (!$usuario || !$usuario->idUsuario) {
                return response()->json(['mensaje' => 'Usuario no autenticado'], 401);
            }

            // 1. Obtener solicitudes con filtros
            $query = DB::table('tbl_solicitudes')
                ->join('tbl_empresa', 'tbl_empresa.IdEmpresa', '=', 'tbl_solicitudes.idEmpresa')
                ->join('tbl_sedes', 'tbl_sedes.IdSede', '=', 'tbl_solicitudes.idSede')
                ->where('tbl_solicitudes.idUsuario', $usuario->idUsuario)
                ->whereIn('tbl_solicitudes.EstadoSolicitud', ['Aprobado', 'Aprobado Parcial']);

            if ($request->filled('idEmpresa')) {
                $query->where('tbl_solicitudes.idEmpresa', $request->idEmpresa);
            }

            if ($request->filled('idSede')) {
                $query->where('tbl_solicitudes.idSede', $request->idSede);
            }

            $solicitudes = $query->select(
                'tbl_solicitudes.id',
                'tbl_solicitudes.codigoSolicitud',
                'tbl_solicitudes.updated_at as fecha_aprobacion',
                'tbl_empresa.NombreEmpresa as empresa',
                'tbl_empresa.ruta_logo',
                'tbl_empresa.NitEmpresa',
                'tbl_sedes.NombreSede as sede',
                'tbl_solicitudes.idUsuario'
            )->get();

            if ($solicitudes->isEmpty()) {
                return response()->json([]);
            }

            $solicitudIds = $solicitudes->pluck('id');

            // 2. Obtener todos los empleados de una sola vez
            $empleadosCompletos = DB::table('tbl_detalle_solicitud_empleado')
                ->join('tbl_tipo_solicitud', 'tbl_tipo_solicitud.IdTipoSolicitud', '=', 'tbl_detalle_solicitud_empleado.idTipoSolicitud')
                ->whereIn('idSolicitud', $solicitudIds)
                ->where('tbl_detalle_solicitud_empleado.EstadoSolicitudEmpleado', '!=', 'Entregado')
                ->select(
                    'tbl_detalle_solicitud_empleado.idSolicitud',
                    'tbl_detalle_solicitud_empleado.idDetalleSolicitud',
                    'tbl_detalle_solicitud_empleado.nombreEmpleado as nombres',
                    'tbl_detalle_solicitud_empleado.documentoEmpleado as documento',
                    'tbl_tipo_solicitud.NombreTipo as tipo_solicitud'
                )
                ->get()
                ->groupBy('idSolicitud');

            // 3. Obtener todos los elementos de una sola vez
            $detalleSolicitudIds = $empleadosCompletos->flatten(1)->pluck('idDetalleSolicitud');
            $elementosCompletos = collect();
            
            if ($detalleSolicitudIds->isNotEmpty()) {
                $elementosCompletos = DB::table('tbl_detalle_solicitud_elemento')
                    ->join('tbl_elementos', 'tbl_elementos.IdElemento', '=', 'tbl_detalle_solicitud_elemento.idElemento')
                    ->whereIn('idDetalleSolicitud', $detalleSolicitudIds)
                    ->select(
                        'tbl_detalle_solicitud_elemento.idDetalleSolicitud',
                        'tbl_detalle_solicitud_elemento.idDetalleSolicitudElementos as idElementoDetalle',
                        'tbl_elementos.nombreElemento as nombre',
                        'tbl_detalle_solicitud_elemento.TallaElemento as talla'
                    )
                    ->get()
                    ->groupBy('idDetalleSolicitud');
            }

            // 4. Obtener todo el historial de aprobación de una sola vez
            $elementoDetalleIds = $elementosCompletos->flatten(1)->pluck('idElementoDetalle');
            $historialCompleto = collect();
            
            if ($elementoDetalleIds->isNotEmpty()) {
                $historialCompleto = DB::table('tbl_historial_aprobacion_elemento')
                    ->whereIn('idElementoDetalle', $elementoDetalleIds)
                    ->select('idElementoDetalle', 'cantidadAnterior', 'cantidadNueva', 'fechaCambio')
                    ->get()
                    ->groupBy('idElementoDetalle')
                    ->map(function ($historiales) {
                        return $historiales->sortByDesc('fechaCambio')->first();
                    });
            }

            // 5. Mapear datos optimizados
            foreach ($solicitudes as $solicitud) {
                $empleados = $empleadosCompletos[$solicitud->id] ?? collect();
                
                foreach ($empleados as $empleado) {
                    $elementosBase = $elementosCompletos[$empleado->idDetalleSolicitud] ?? collect();
                    
                    foreach ($elementosBase as $elemento) {
                        $historial = $historialCompleto[$elemento->idElementoDetalle] ?? null;
                        $elemento->cantidad_anterior = $historial?->cantidadAnterior ?? null;
                        $elemento->cantidad_aprobada = $historial?->cantidadNueva ?? null;
                    }
                    
                    $empleado->elementos = $elementosBase;
                }
                
                $solicitud->empleados = $empleados;
            }

            return response()->json($solicitudes);
        } catch (\Exception $e) {
            Log::error('❌ Error en solicitudesParaEntrega', [
                'mensaje' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['mensaje' => 'Error interno del servidor'], 500);
        }
    }
}
