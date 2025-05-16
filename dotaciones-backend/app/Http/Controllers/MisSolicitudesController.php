<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MisSolicitudesController extends Controller
{
    // ================================================
    // 📄 Obtener todas las solicitudes del usuario autenticado
    // ================================================
    public function index(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $query = DB::table('tbl_solicitudes as s')
            ->where('s.idUsuario', $usuario->idUsuario)
            ->join('tbl_empresa as e', 's.IdEmpresa', '=', 'e.IdEmpresa')
            ->join('tbl_sedes as se', 's.IdSede', '=', 'se.IdSede')
            ->select(
                's.id',
                's.codigoSolicitud as codigoSolicitud', // usa el campo generado
                's.estadoSolicitud',
                's.created_at',
                's.updated_at',
                'e.IdEmpresa',
                'e.NombreEmpresa',
                'se.IdSede',
                'se.NombreSede'
            );

        // 🔍 Filtros por empresa y sede con nombres correctos de columnas
        if ($request->has('idEmpresa')) {
            $query->where('s.IdEmpresa', $request->input('idEmpresa'));
        }

        if ($request->has('idSede')) {
            $query->where('s.IdSede', $request->input('idSede'));
        }

        $solicitudes = $query->orderByDesc('s.created_at')->get();

        return response()->json($solicitudes);
    }

    // ================================================
    // 👁️ Mostrar el detalle completo de una solicitud específica
    // ================================================
    public function show($id)
    {
        $solicitud = DB::table('tbl_solicitudes as s')
            ->join('tbl_empresa as e', 's.IdEmpresa', '=', 'e.IdEmpresa')
            ->join('tbl_sedes as se', 's.IdSede', '=', 'se.IdSede')
            ->where('s.id', $id)
            ->select(
                's.id as id',
                's.codigoSolicitud as codigoSolicitud',
                's.estadoSolicitud',
                's.created_at',
                's.updated_at',
                'e.IdEmpresa',
                'e.NombreEmpresa',
                'se.IdSede',
                'se.NombreSede'
            )
            ->first();

        if (!$solicitud) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        $detalle = DB::table('tbl_detalle_solicitud_empleado as d')
            ->where('d.idSolicitud', $id)
            ->leftJoin('tbl_cargo as c', 'd.idCargo', '=', 'c.IdCargo')
            ->select(
                'd.idDetalleSolicitud',
                'd.nombreEmpleado',
                'd.documentoEmpleado',
                'd.IdTipoSolicitud',
                'd.observaciones',
                'c.NombreCargo as cargo'
            )
            ->get();

        // Agregar elementos de dotación a cada empleado
        foreach ($detalle as $empleado) {
            $empleado->elementos = DB::table('tbl_detalle_solicitud_elemento as el')
                ->join('tbl_elementos as e', 'el.idElemento', '=', 'e.idElemento')
                ->where('el.idDetalleSolicitud', $empleado->idDetalleSolicitud)
                ->select(
                    'el.idElemento',
                    'el.TallaElemento as talla',
                    'el.Cantidad as cantidad',
                    'e.nombreElemento'
                )
                ->get();
        }

        return response()->json([
            'solicitud' => [
                'id' => $solicitud->id,
                'codigoSolicitud' => $solicitud->codigoSolicitud,
                'estadoSolicitud' => $solicitud->estadoSolicitud,
                'created_at' => $solicitud->created_at,
                'updated_at' => $solicitud->updated_at
            ],
            'empresa' => [
                'IdEmpresa' => $solicitud->IdEmpresa,
                'NombreEmpresa' => $solicitud->NombreEmpresa
            ],
            'sede' => [
                'IdSede' => $solicitud->IdSede,
                'NombreSede' => $solicitud->NombreSede
            ],
            'detalle' => $detalle
        ]);
    }
}
