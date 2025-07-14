<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TblSolicitudEmpleadoController extends Controller
{
    // Método para agregar un empleado a una solicitud
    public function agregarEmpleado(Request $request)
    {
       $validated = Validator::make($request->all(), [
    'idSolicitud' => 'required|exists:tbl_solicitudes,id',
    'nombresEmpleado' => 'required|string|max:255',
    'documentoEmpleado' => 'required|string|max:50',
    'idCargo' => 'required|integer|exists:tbl_cargo,IdCargo',
    'idTipoSolicitud' => 'required|integer|exists:tbl_tipo_solicitud,IdTipoSolicitud',
    'observaciones' => 'nullable|string',
]);

if ($validated->fails()) {
    Log::error('❌ Validación fallida en agregarEmpleado', [
        'errores' => $validated->errors(),
        'payload' => $request->all()
    ]);
    return response()->json(['errors' => $validated->errors()], 422);
}
    

        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 422);
        }

        $detalle = DB::table('tbl_detalle_solicitud_empleado')->insertGetId([
            'idSolicitud' => $request->idSolicitud,
            'documentoEmpleado' => $request->documentoEmpleado,
            'nombreEmpleado' => $request->nombresEmpleado,
            'idCargo' => $request->idCargo,
            'idTipoSolicitud' => $request->idTipoSolicitud,
            'observaciones' => $request->observaciones,
            'EstadoSolicitudEmpleado' => 'Pendiente',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Guardar evidencias si se cargaron
        if ($request->hasFile('evidencias')) {
            foreach ($request->file('evidencias') as $archivo) {
                $path = $archivo->store('evidencias_temporales', 'public');

                DB::table('tbl_evidencias_temporales')->insert([
                    'idDetalleSolicitud' => $detalle,
                    'nombreArchivo' => $archivo->getClientOriginalName(),
                    'rutaArchivo' => $path,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Empleado agregado correctamente',
            'idDetalleSolicitud' => $detalle
        ]);
    }

    // Endpoint para consultar historial por documento
    public function historialSolicitudes(Request $request)
    {
        $documento = $request->query('documento') ?? $request->query('documentoEmpleado');

        Log::info('📥 Consultando historial para documento:', ['documento' => $documento]);

        if (!$documento) {
            Log::warning('❌ Documento no proporcionado en historialSolicitudes');
            return response()->json([
                'error' => 'El documento del empleado es requerido'
            ], 400);
        }

        // Consulta original con JOINs
        $historial = DB::table('tbl_detalle_solicitud_empleado as dse')
            ->join('tbl_tipo_solicitud as ts', 'dse.idTipoSolicitud', '=', 'ts.IdTipoSolicitud')
            ->join('tbl_solicitudes as s', 'dse.idSolicitud', '=', 's.id')
            ->join('tbl_empresa as e', 's.idEmpresa', '=', 'e.IdEmpresa')
            ->join('tbl_sedes as sed', 's.idSede', '=', 'sed.IdSede')
            ->where('dse.documentoEmpleado', $documento)
            ->select(
                'dse.idDetalleSolicitud',
                'dse.nombreEmpleado',
                'dse.documentoEmpleado',
                'dse.EstadoSolicitudEmpleado',
                'dse.created_at',
                'ts.NombreTipo as tipoSolicitud',
                's.idSolicitud as codigoSolicitud',
                'e.NombreEmpresa',
                'sed.NombreSede'
            )
            ->orderByDesc('dse.created_at')
            ->limit(10)
            ->get();

        // Si no hay resultados, consulta solo la tabla base
        if ($historial->isEmpty()) {
            Log::warning('⚠️ No se encontraron resultados con JOINs, probando consulta simple.');
            $historial = DB::table('tbl_detalle_solicitud_empleado')
                ->where('documentoEmpleado', $documento)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();
        }

        Log::info('✅ Historial encontrado:', [
            'documento' => $documento,
            'cantidad' => $historial->count(),
            'resultados' => $historial->toArray()
        ]);

        return response()->json($historial);
    }
}
