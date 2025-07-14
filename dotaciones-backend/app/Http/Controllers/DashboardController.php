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

            // Obtener estadísticas básicas
            $stats = [
                'solicitudes' => $this->getSolicitudesStats($usuario),
                'empleados' => $this->getEmpleadosStats($usuario),
                'empresas' => $this->getEmpresasStats($usuario),
                'elementos' => $this->getElementosStats($usuario),
                'entregas' => $this->getEntregasStats($usuario),
                'recientes' => $this->getSolicitudesRecientes($usuario)
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo estadísticas del dashboard: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    private function getSolicitudesStats($usuario)
    {
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
        
        $porEstado = $query->select('estadoSolicitud', DB::raw('count(*) as cantidad'))
            ->groupBy('estadoSolicitud')
            ->get()
            ->keyBy('estadoSolicitud');

        return [
            'total' => $total,
            'pendientes' => $porEstado['En revisión']->cantidad ?? 0,
            'aprobadas' => ($porEstado['Aprobado']->cantidad ?? 0) + ($porEstado['Aprobado Parcial']->cantidad ?? 0),
            'rechazadas' => $porEstado['Rechazado']->cantidad ?? 0,
            'porEstado' => $porEstado->values()
        ];
    }

    private function getEmpleadosStats($usuario)
    {
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

        $total = $query->distinct('dse.documentoEmpleado')->count('dse.documentoEmpleado');
        
        $porEstado = $query->select('dse.EstadoSolicitudEmpleado', DB::raw('count(*) as cantidad'))
            ->groupBy('dse.EstadoSolicitudEmpleado')
            ->get()
            ->keyBy('EstadoSolicitudEmpleado');

        return [
            'total' => $total,
            'pendientes' => $porEstado['Pendiente']->cantidad ?? 0,
            'aprobados' => $porEstado['Aprobado']->cantidad ?? 0,
            'entregados' => $porEstado['Entregado']->cantidad ?? 0,
            'rechazados' => $porEstado['Rechazado']->cantidad ?? 0
        ];
    }

    private function getEmpresasStats($usuario)
    {
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
    }

    private function getElementosStats($usuario)
    {
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
    }

    private function getEntregasStats($usuario)
    {
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
    }

    private function getSolicitudesRecientes($usuario)
    {
        $query = DB::table('tbl_solicitudes as s')
            ->join('tbl_empresa as e', 'e.IdEmpresa', '=', 's.idEmpresa')
            ->join('tbl_sedes as sed', 'sed.IdSede', '=', 's.idSede')
            ->select(
                's.id',
                's.codigoSolicitud',
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
    }
} 