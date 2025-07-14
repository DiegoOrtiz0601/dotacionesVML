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
        Log::info('🚀 MÉTODO historialSolicitudes EJECUTADO');
        
        $documento = $request->query('documento') ?? $request->query('documentoEmpleado');

        Log::info('📥 Consultando historial para documento:', ['documento' => $documento]);

        // Mostrar todos los documentos existentes para debug
        $todosDocumentos = DB::table('tbl_detalle_solicitud_empleado')
            ->select('documentoEmpleado')
            ->distinct()
            ->get()
            ->pluck('documentoEmpleado')
            ->toArray();

        Log::info('📋 Todos los documentos existentes:', ['documentos' => $todosDocumentos]);

        if (!$documento) {
            Log::warning('❌ Documento no proporcionado en historialSolicitudes');
            return response()->json([
                'error' => 'El documento del empleado es requerido'
            ], 400);
        }

        // Paso 1: Verificar si existen registros básicos para el documento
        $registrosBasicos = DB::table('tbl_detalle_solicitud_empleado')
            ->where('documentoEmpleado', $documento)
            ->get();

        Log::info('🔍 Registros básicos encontrados:', [
            'documento' => $documento,
            'cantidad' => $registrosBasicos->count(),
            'registros' => $registrosBasicos->toArray()
        ]);

        // Verificar si hay registros con LIKE para casos de espacios o caracteres especiales
        $registrosLike = DB::table('tbl_detalle_solicitud_empleado')
            ->where('documentoEmpleado', 'LIKE', '%' . $documento . '%')
            ->get();

        Log::info('🔍 Registros con LIKE encontrados:', [
            'documento' => $documento,
            'cantidad' => $registrosLike->count(),
            'registros' => $registrosLike->toArray()
        ]);

        // Paso 2: Consulta paso a paso para depurar
        try {
            // Primero, verificar qué registros básicos tenemos
            $registrosBasicos = DB::table('tbl_detalle_solicitud_empleado')
                ->where('documentoEmpleado', $documento)
                ->select('*')
                ->get();

            Log::info('🔍 Registros básicos (todos los campos):', [
                'cantidad' => $registrosBasicos->count(),
                'registros' => $registrosBasicos->toArray()
            ]);

            // Verificar si existen las solicitudes relacionadas
            $idSolicitudes = $registrosBasicos->pluck('idSolicitud')->unique();
            Log::info('🔍 IDs de solicitudes encontrados:', ['ids' => $idSolicitudes->toArray()]);

            if ($idSolicitudes->isNotEmpty()) {
                $solicitudes = DB::table('tbl_solicitudes')
                    ->whereIn('id', $idSolicitudes)
                    ->get();

                Log::info('🔍 Solicitudes encontradas:', [
                    'cantidad' => $solicitudes->count(),
                    'solicitudes' => $solicitudes->toArray()
                ]);

                // Verificar empresas y sedes
                $idEmpresas = $solicitudes->pluck('idEmpresa')->unique()->filter();
                $idSedes = $solicitudes->pluck('idSede')->unique()->filter();

                if ($idEmpresas->isNotEmpty()) {
                    $empresas = DB::table('tbl_empresa')
                        ->whereIn('IdEmpresa', $idEmpresas)
                        ->get();
                    Log::info('🔍 Empresas encontradas:', ['empresas' => $empresas->toArray()]);
                }

                if ($idSedes->isNotEmpty()) {
                    $sedes = DB::table('tbl_sedes')
                        ->whereIn('IdSede', $idSedes)
                        ->get();
                    Log::info('🔍 Sedes encontradas:', ['sedes' => $sedes->toArray()]);
                }
            }

            // Ahora hacer la consulta completa con LEFT JOINs
            $historialCompleto = DB::table('tbl_detalle_solicitud_empleado as dse')
                ->leftJoin('tbl_tipo_solicitud as ts', 'dse.IdTipoSolicitud', '=', 'ts.IdTipoSolicitud')
                ->leftJoin('tbl_solicitudes as s', 'dse.idSolicitud', '=', 's.id')
                ->leftJoin('tbl_empresa as e', 's.idEmpresa', '=', 'e.IdEmpresa')
                ->leftJoin('tbl_sedes as sed', 's.idSede', '=', 'sed.IdSede')
                ->where('dse.documentoEmpleado', 'LIKE', '%' . $documento . '%')
                ->select(
                    'dse.idDetalleSolicitud',
                    'dse.nombreEmpleado',
                    'dse.documentoEmpleado',
                    'dse.EstadoSolicitudEmpleado',
                    'dse.created_at as fechaSolicitud',
                    'dse.fechaActualizacionSolicitud',
                    'dse.idSolicitud',
                    'dse.IdTipoSolicitud',
                    'ts.NombreTipo as tipoSolicitud',
                    's.codigoSolicitud',
                    's.fechaSolicitud as fechaSolicitudPrincipal',
                    's.idEmpresa',
                    's.idSede',
                    'e.NombreEmpresa',
                    'sed.NombreSede'
                )
                ->orderByDesc('dse.created_at')
                ->limit(10)
                ->get();

            Log::info('✅ Historial completo con LEFT JOINs:', [
                'documento' => $documento,
                'cantidad' => $historialCompleto->count(),
                'resultados' => $historialCompleto->toArray()
            ]);

            // Para cada registro, obtener los elementos solicitados
            foreach ($historialCompleto as $registro) {
                try {
                    $elementos = DB::table('tbl_detalle_solicitud_elemento as dse')
                        ->leftJoin('tbl_elementos as e', 'dse.idElemento', '=', 'e.idElemento')
                        ->where('dse.idDetalleSolicitud', $registro->idDetalleSolicitud)
                        ->select(
                            'e.nombreElemento',
                            'dse.Cantidad as cantidad'
                        )
                        ->get();

                    $registro->elementos = $elementos;
                } catch (\Exception $e) {
                    Log::warning('⚠️ Error obteniendo elementos para detalle ' . $registro->idDetalleSolicitud . ': ' . $e->getMessage());
                    $registro->elementos = collect([]);
                }
            }

            return response()->json($historialCompleto);

        } catch (\Exception $e) {
            Log::error('❌ Error en consulta con JOINs:', [
                'error' => $e->getMessage(),
                'documento' => $documento
            ]);
        }

        // Fallback: devolver array vacío si no hay registros
        if ($registrosBasicos->isEmpty()) {
            Log::warning('⚠️ No se encontraron registros para el documento');
            return response()->json([]);
        }

        Log::warning('⚠️ Usando fallback con registros básicos');
        return response()->json($registrosBasicos);
    }
}
