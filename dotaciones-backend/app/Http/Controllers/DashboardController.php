<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $usuario = $request->user();
            
            if (!$usuario) {
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            Log::info('Dashboard stats requested by user: ' . ($usuario->idUsuario ?? 'unknown'));

            // Obtener estadísticas básicas con manejo de errores individual
            $stats = [
                'solicitudes' => $this->getSolicitudesStats($usuario),
                'empleados' => $this->getEmpleadosStats($usuario),
                'empresas' => $this->getEmpresasStats($usuario),
                'elementos' => $this->getElementosStats($usuario),
                'entregas' => $this->getEntregasStats($usuario),
                'recientes' => $this->getSolicitudesRecientes($usuario)
            ];

            Log::info('Dashboard stats generated successfully');

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo estadísticas del dashboard: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getSolicitudesStats($usuario)
    {
        try {
            $query = DB::table('tbl_solicitudes as s');
            
            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            $total = $query->count();
            
            // Obtener estadísticas por estado
            $estados = $query->select('estadoSolicitud', DB::raw('count(*) as cantidad'))
                ->groupBy('estadoSolicitud')
                ->get();

            $pendientes = $estados->where('estadoSolicitud', 'En revisión')->first()->cantidad ?? 0;
            $aprobadas = ($estados->where('estadoSolicitud', 'Aprobado')->first()->cantidad ?? 0) + 
                        ($estados->where('estadoSolicitud', 'Aprobado Parcial')->first()->cantidad ?? 0);
            $rechazadas = $estados->where('estadoSolicitud', 'Rechazado')->first()->cantidad ?? 0;

            return [
                'total' => $total,
                'pendientes' => $pendientes,
                'aprobadas' => $aprobadas,
                'rechazadas' => $rechazadas,
                'porEstado' => $estados
            ];
        } catch (\Exception $e) {
            Log::error('Error en getSolicitudesStats: ' . $e->getMessage());
            return [
                'total' => 0,
                'pendientes' => 0,
                'aprobadas' => 0,
                'rechazadas' => 0,
                'porEstado' => []
            ];
        }
    }

    private function getEmpleadosStats($usuario)
    {
        try {
            $query = DB::table('tbl_detalle_solicitud_empleado as dse')
                ->join('tbl_solicitudes as s', 's.id', '=', 'dse.idSolicitud');

            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            // Contar empleados únicos
            $total = $query->distinct()->count('dse.documentoEmpleado');
            
            // Crear una nueva query para las estadísticas por estado
            $estadosQuery = DB::table('tbl_detalle_solicitud_empleado as dse')
                ->join('tbl_solicitudes as s', 's.id', '=', 'dse.idSolicitud');

            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $estadosQuery->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            $estados = $estadosQuery->select('dse.EstadoSolicitudEmpleado', DB::raw('count(*) as cantidad'))
                ->groupBy('dse.EstadoSolicitudEmpleado')
                ->get();

            $pendientes = $estados->where('EstadoSolicitudEmpleado', 'Pendiente')->first()->cantidad ?? 0;
            $aprobados = $estados->where('EstadoSolicitudEmpleado', 'Aprobado')->first()->cantidad ?? 0;
            $entregados = $estados->where('EstadoSolicitudEmpleado', 'Entregado')->first()->cantidad ?? 0;
            $rechazados = $estados->where('EstadoSolicitudEmpleado', 'Rechazado')->first()->cantidad ?? 0;

            return [
                'total' => $total,
                'pendientes' => $pendientes,
                'aprobados' => $aprobados,
                'entregados' => $entregados,
                'rechazados' => $rechazados
            ];
        } catch (\Exception $e) {
            Log::error('Error en getEmpleadosStats: ' . $e->getMessage());
            return [
                'total' => 0,
                'pendientes' => 0,
                'aprobados' => 0,
                'entregados' => 0,
                'rechazados' => 0
            ];
        }
    }

    private function getEmpresasStats($usuario)
    {
        try {
            $query = DB::table('tbl_empresa as e');
            
            // Si es usuario común, filtrar por sus empresas asignadas
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', 'e.IdEmpresa', '=', 'uec.IdEmpresa')
                      ->where('uec.IdUsuario', $usuario->idUsuario)
                      ->distinct();
            }

            $total = $query->count();

            // Empleados por empresa
            $empleadosPorEmpresa = DB::table('tbl_detalle_solicitud_empleado as dse')
                ->join('tbl_solicitudes as s', 's.id', '=', 'dse.idSolicitud')
                ->join('tbl_empresa as e', 'e.IdEmpresa', '=', 's.idEmpresa');

            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $empleadosPorEmpresa->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            $empleadosPorEmpresa = $empleadosPorEmpresa->select(
                    'e.NombreEmpresa as nombre',
                    DB::raw('count(distinct dse.documentoEmpleado) as empleados')
                )
                ->groupBy('e.IdEmpresa', 'e.NombreEmpresa')
                ->orderByDesc('empleados')
                ->limit(8)
                ->get();

            return [
                'total' => $total,
                'empleadosPorEmpresa' => $empleadosPorEmpresa
            ];
        } catch (\Exception $e) {
            Log::error('Error en getEmpresasStats: ' . $e->getMessage());
            return [
                'total' => 0,
                'empleadosPorEmpresa' => []
            ];
        }
    }

    private function getElementosStats($usuario)
    {
        try {
            $query = DB::table('tbl_detalle_solicitud_elemento as dse')
                ->join('tbl_detalle_solicitud_empleado as dsa', 'dse.idDetalleSolicitud', '=', 'dsa.idDetalleSolicitud')
                ->join('tbl_solicitudes as s', 's.id', '=', 'dsa.idSolicitud')
                ->join('tbl_elementos as e', 'e.idElemento', '=', 'dse.idElemento');

            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            $totalSolicitados = $query->sum('dse.cantidad');
            
            // Elementos más solicitados
            $masSolicitados = $query->select(
                    'e.nombreElemento as nombre',
                    DB::raw('sum(dse.cantidad) as cantidad')
                )
                ->groupBy('e.idElemento', 'e.nombreElemento')
                ->orderByDesc('cantidad')
                ->limit(8)
                ->get();

            return [
                'totalSolicitados' => $totalSolicitados,
                'masSolicitados' => $masSolicitados
            ];
        } catch (\Exception $e) {
            Log::error('Error en getElementosStats: ' . $e->getMessage());
            return [
                'totalSolicitados' => 0,
                'masSolicitados' => []
            ];
        }
    }

    private function getEntregasStats($usuario)
    {
        try {
            $query = DB::table('tbl_detalle_solicitud_empleado as dse')
                ->join('tbl_solicitudes as s', 's.id', '=', 'dse.idSolicitud')
                ->where('dse.EstadoSolicitudEmpleado', 'Entregado');

            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            $totalEntregas = $query->count();
            
            // Entregas por mes (últimos 6 meses)
            $entregasPorMes = $query->select(
                    DB::raw('DATE_FORMAT(dse.fechaActualizacionSolicitud, "%Y-%m") as mes'),
                    DB::raw('count(*) as cantidad')
                )
                ->where('dse.fechaActualizacionSolicitud', '>=', now()->subMonths(6))
                ->groupBy('mes')
                ->orderBy('mes')
                ->get();

            return [
                'totalEntregas' => $totalEntregas,
                'entregasPorMes' => $entregasPorMes
            ];
        } catch (\Exception $e) {
            Log::error('Error en getEntregasStats: ' . $e->getMessage());
            return [
                'totalEntregas' => 0,
                'entregasPorMes' => []
            ];
        }
    }

    private function getSolicitudesRecientes($usuario)
    {
        try {
            $query = DB::table('tbl_solicitudes as s')
                ->join('tbl_empresa as e', 'e.IdEmpresa', '=', 's.idEmpresa')
                ->join('tbl_sedes as sed', 'sed.IdSede', '=', 's.idSede')
                ->select(
                    's.id',
                    's.idSolicitud as codigoSolicitud',
                    's.estadoSolicitud',
                    's.created_at',
                    'e.NombreEmpresa',
                    'sed.NombreSede'
                )
                ->orderByDesc('s.created_at')
                ->limit(10);

            // Si es usuario común, filtrar por sus empresas/sedes
            if (strtolower($usuario->RolUsuario ?? '') === 'usuario') {
                $query->join('tbl_usuario_empresa_sede_cargos as uec', function($join) use ($usuario) {
                    $join->on('s.idEmpresa', '=', 'uec.IdEmpresa')
                         ->on('s.idSede', '=', 'uec.IdSede')
                         ->where('uec.IdUsuario', $usuario->idUsuario);
                });
            }

            return $query->get();
        } catch (\Exception $e) {
            Log::error('Error en getSolicitudesRecientes: ' . $e->getMessage());
            return [];
        }
    }
} 