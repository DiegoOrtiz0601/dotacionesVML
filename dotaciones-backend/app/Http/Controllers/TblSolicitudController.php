<?php

namespace App\Http\Controllers;

use App\Models\TblSolicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\NotificacionSolicitud;

class TblSolicitudController extends Controller
{
    // Descarga un archivo de evidencia desde almacenamiento
    public function descargarEvidencia($empresa, $documento, $archivo)
    {
        $ruta = "public/evidencias/{$empresa}/{$documento}/{$archivo}";

        if (!Storage::exists($ruta)) {
            return response()->json(['error' => 'Archivo no encontrado en el servidor.'], 404);
        }

        return Storage::download($ruta, $archivo);
    }

    // Retorna todas las solicitudes (usado para debug o listado general básico)
    public function index()
    {
        return response()->json(TblSolicitud::all());
    }

    // Crea una nueva solicitud
    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'idUsuario' => 'required|integer|exists:tbl_usuarios_sistema,idUsuario',
            'idEmpresa' => 'required|integer|exists:tbl_empresa,IdEmpresa',
            'idSede'    => 'required|integer|exists:tbl_sedes,IdSede',
        ]);

        if ($validated->fails()) {
            Log::error('❌ Error validando solicitud', ['errores' => $validated->errors()]);
            return response()->json(['errors' => $validated->errors()], 422);
        }

        $solicitud = new TblSolicitud();
        $solicitud->idUsuario = $request->idUsuario;
        $solicitud->idEmpresa = $request->idEmpresa;
        $solicitud->idSede = $request->idSede;
        $solicitud->fechaSolicitud = now();
        $solicitud->estadoSolicitud = 'En revisión';
        $solicitud->save();

        // Generar código único visual
        $solicitud->codigoSolicitud = 'DOT-' . str_pad($solicitud->id, 4, '0', STR_PAD_LEFT);
        $solicitud->save();

        return response()->json([
            'idSolicitud'     => $solicitud->id,
            'codigoSolicitud' => $solicitud->codigoSolicitud
        ], 201);
    }

    // Muestra detalle de una solicitud por ID con historial completo
    public function show($id)
    {
        try {
            // 1. Info básica de solicitud
            $solicitud = DB::table('tbl_solicitudes as s')
                ->leftJoin('tbl_usuarios_sistema as u', 'u.idUsuario', '=', 's.idUsuario')
                ->leftJoin('tbl_empresa as e', 'e.IdEmpresa', '=', 's.idEmpresa')
                ->leftJoin('tbl_sedes as sd', 'sd.IdSede', '=', 's.idSede')
                ->where('s.id', $id)
                ->select(
                    's.id as idSolicitud',
                    's.codigoSolicitud as codigo',
                    's.estadoSolicitud',
                    's.MotivoRechazo',
                    'u.NombresUsuarioAutorizado as nombreSolicitante',
                    'e.NombreEmpresa as empresa',
                    'sd.NombreSede as sede'
                )
                ->first();

            if (!$solicitud) {
                return response()->json(['message' => 'Solicitud no encontrada'], 404);
            }

            // 2. Empleados con tipo de solicitud
            $empleadosRaw = DB::table('tbl_detalle_solicitud_empleado as de')
                ->leftJoin('tbl_tipo_solicitud as ts', 'ts.idTipoSolicitud', '=', 'de.idTipoSolicitud')
                ->where('de.idSolicitud', $id)
                ->select(
                    'de.idDetalleSolicitud',
                    'de.nombreEmpleado',
                    'de.documentoEmpleado',
                    'de.observaciones',
                    'de.rutaArchivoSolicitudEmpleado',
                    'ts.NombreTipo as tipoSolicitud'
                )
                ->get();

            $documentos = $empleadosRaw->pluck('documentoEmpleado');

            // 3. Elementos por documento (optimizado)
            $elementosRaw = DB::table('tbl_detalle_solicitud_elemento as d')
                ->join('tbl_elementos as el', 'el.idElemento', '=', 'd.idElemento')
                ->join('tbl_detalle_solicitud_empleado as de', 'de.idDetalleSolicitud', '=', 'd.idDetalleSolicitud')
                ->where('de.idSolicitud', $id)
                ->select(
                    'd.idDetalleSolicitudElementos as id',
                    'de.documentoEmpleado',
                    'el.nombreElemento',
                    'd.TallaElemento as talla',
                    'd.cantidad as cantidadSolicitada'
                )
                ->get()
                ->groupBy('documentoEmpleado');

            // 4. Evidencias por documento (solo si es necesario)
            $requiereEvidencias = $empleadosRaw->contains(fn($emp) => strtolower($emp->tipoSolicitud ?? '') !== 'solicitud nueva');
            $evidenciasPorDocumento = collect();

            if ($requiereEvidencias) {
                $evidenciasCrudas = DB::table('tbl_evidencias_temporales')
                    ->where('idSolicitud', $id)
                    ->select('nombreArchivoOriginal', 'rutaArchivo', 'documentoEmpleado')
                    ->get();

                $evidenciasPorDocumento = $evidenciasCrudas->map(function ($evi) {
                    $rutaRelativa = $evi->rutaArchivo;
                    return [
                        'documentoEmpleado' => $evi->documentoEmpleado,
                        'nombreArchivo' => $evi->nombreArchivoOriginal,
                        'url' => asset('storage/' . str_replace('storage/', '', $rutaRelativa)),
                        'existe' => true
                    ];
                })->groupBy('documentoEmpleado');
            }

            // 5. Historial optimizado - una sola consulta para todos los documentos
            $historialCompleto = DB::table('tbl_detalle_solicitud_empleado as d')
                ->join('tbl_solicitudes as s', 's.id', '=', 'd.idSolicitud')
                ->whereIn('d.documentoEmpleado', $documentos)
                ->where('d.idSolicitud', '!=', $id)
                ->select(
                    'd.idSolicitud',
                    'd.documentoEmpleado',
                    's.codigoSolicitud',
                    'd.created_at as fecha',
                    DB::raw("CONCAT('Estado: ', s.estadoSolicitud,
                    CASE WHEN d.observaciones IS NOT NULL AND d.observaciones != ''
                         THEN CONCAT(' | Obs: ', d.observaciones) ELSE '' END) as evento")
                )
                ->orderBy('d.created_at')
                ->get()
                ->groupBy('documentoEmpleado');

            // 6. Elementos del historial optimizado - una sola consulta
            $solicitudesHistorial = $historialCompleto->flatten(1)->pluck('idSolicitud')->unique();
            $elementosHistorial = collect();
            
            if ($solicitudesHistorial->isNotEmpty()) {
                $elementosHistorial = DB::table('tbl_detalle_solicitud_elemento as dse')
                    ->join('tbl_elementos as el', 'el.idElemento', '=', 'dse.idElemento')
                    ->join('tbl_detalle_solicitud_empleado as de', 'de.idDetalleSolicitud', '=', 'dse.idDetalleSolicitud')
                    ->whereIn('de.idSolicitud', $solicitudesHistorial)
                    ->whereIn('de.documentoEmpleado', $documentos)
                    ->select(
                        'de.idSolicitud',
                        'de.documentoEmpleado',
                        'el.nombreElemento',
                        'dse.TallaElemento as talla',
                        'dse.cantidad'
                    )
                    ->get()
                    ->groupBy(function ($item) {
                        return $item->idSolicitud . '_' . $item->documentoEmpleado;
                    });
            }

            // 7. Mapear empleados con historial, elementos, evidencias
            $empleados = $empleadosRaw->map(function ($emp) use ($elementosRaw, $evidenciasPorDocumento, $historialCompleto, $elementosHistorial) {
                $historialEmpleado = $historialCompleto[$emp->documentoEmpleado] ?? collect();
                
                // Agregar elementos al historial
                $historialConElementos = $historialEmpleado->map(function ($item) use ($elementosHistorial) {
                    $key = $item->idSolicitud . '_' . $item->documentoEmpleado;
                    $item->elementos = $elementosHistorial[$key] ?? collect();
                    return $item;
                });

                return [
                    'nombreEmpleado' => $emp->nombreEmpleado,
                    'documentoEmpleado' => $emp->documentoEmpleado,
                    'tipoSolicitud' => $emp->tipoSolicitud ?? 'No definido',
                    'observaciones' => $emp->observaciones,
                    'rutaArchivoSolicitudEmpleado' => $emp->rutaArchivoSolicitudEmpleado,
                    'evidencias' => $evidenciasPorDocumento[$emp->documentoEmpleado] ?? [],
                    'elementos' => $elementosRaw[$emp->documentoEmpleado]->map(function ($el) {
                        return [
                            'id' => $el->id,
                            'nombreElemento' => $el->nombreElemento,
                            'talla' => $el->talla,
                            'cantidadSolicitada' => $el->cantidadSolicitada
                        ];
                    })->values(),
                    'historial' => $historialConElementos->isEmpty()
                        ? [[
                            'fecha' => now()->format('Y-m-d H:i'),
                            'evento' => 'No hay solicitudes antiguas para este empleado.',
                            'codigoSolicitud' => null,
                            'elementos' => []
                        ]]
                        : $historialConElementos->values()
                ];
            });

            return response()->json([
                ...(array) $solicitud,
                'empleados' => $empleados
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error interno en show(): " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error interno del servidor.'], 500);
        }
    }

    // Actualiza datos básicos de la solicitud
    public function update(Request $request, $id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    // Elimina la solicitud
    public function destroy($id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }

    // Genera un número/código visual para nueva solicitud
    public function generarNumeroSolicitud()
    {
        $startTime = microtime(true);
        
        Log::info('🚀 Generando número de solicitud');
        
        try {
            $ultimoId = DB::table('tbl_solicitudes')->max('id');
            $nuevoId = is_null($ultimoId) ? 1 : $ultimoId + 1;
            $codigo = 'DOT-' . str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);
            
            Log::info('✅ Número de solicitud generado', [
                'numero' => $codigo,
                'id' => $nuevoId,
                'tiempo_ms' => $executionTime
            ]);

            return response()->json([
                'numeroSolicitud' => $codigo,
                'idSolicitud'     => $nuevoId
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error generando número de solicitud', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Error generando número de solicitud'
            ], 500);
        }
    }

    // Retorna solicitudes para Talento Humano con filtros
    public function indexGestionar(Request $request)
    {
        $query = DB::table('tbl_solicitudes as s')
            ->join('tbl_usuarios_sistema as u', 's.idUsuario', '=', 'u.idUsuario')
            ->join('tbl_empresa as e', 's.idEmpresa', '=', 'e.IdEmpresa')
            ->join('tbl_sedes as sd', 's.idSede', '=', 'sd.IdSede')
            ->select(
                's.id as idSolicitud',
                's.codigoSolicitud as codigo',
                'u.NombresUsuarioAutorizado as nombreSolicitante',
                'e.NombreEmpresa as empresa',
                'e.NitEmpresa as Nit',
                'sd.NombreSede as sede',
                's.estadoSolicitud as estado'
            )
            ->where('s.estadoSolicitud', 'En revisión'); // 🔒 Solo solicitudes en revisión

        // Aplicar filtro por empresa (opcional)
        if ($request->filled('empresa')) {
            $query->where('s.idEmpresa', $request->empresa);
        }

        // Aplicar filtro por sede (opcional)
        if ($request->filled('sede')) {
            $query->where('s.idSede', $request->sede);
        }

        // Paginación de resultados
        return response()->json(
            $query->orderBy('s.created_at', 'desc')->paginate(10)
        );
    }



    // Actualiza cantidades de elementos (solo permite disminuir)
    public function actualizarElementos(Request $request, $id)
    {
        $data = $request->input('elementos');

        if (!is_array($data) || count($data) === 0) {
            return response()->json(['message' => 'No se enviaron elementos para actualizar.'], 422);
        }

        $errores = [];

        foreach ($data as $item) {
            $registro = DB::table('tbl_detalle_solicitud_elemento')->where('id', $item['id'])->first();

            if (!$registro) {
                $errores[] = "Elemento con ID {$item['id']} no encontrado.";
                continue;
            }

            if ($item['cantidad'] > $registro->cantidad) {
                $errores[] = "No se puede aumentar la cantidad del elemento ID {$item['id']}.";
                continue;
            }

            DB::table('tbl_detalle_solicitud_elemento')
                ->where('id', $item['id'])
                ->update(['cantidad' => $item['cantidad']]);
        }

        if (count($errores)) {
            return response()->json([
                'message' => 'Algunos elementos no se pudieron actualizar.',
                'errores' => $errores
            ], 400);
        }

        DB::table('tbl_historial_solicitudes')->insert([
            'idSolicitud' => $id,
            'evento' => 'Cantidades modificadas por Talento Humano',
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Elementos actualizados correctamente.']);
    }
    public function aprobar(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            // Recuperar solicitud con relaciones (empresa, sede, usuario)
            $solicitud = TblSolicitud::with(['empresa', 'sede', 'usuario'])->find($id);
            if (!$solicitud) {
                return response()->json(['message' => 'Solicitud no encontrada'], 404);
            }

            $empleados = $request->input('empleados', []);
            $estadoGlobal = 'Aprobado';

            foreach ($empleados as $emp) {
                $estadoEmpleado = 'Aprobado';
                $elementos = $emp['elementos'] ?? [];

                foreach ($elementos as $el) {
                    DB::table('tbl_detalle_solicitud_elemento')
                        ->where('idDetalleSolicitudElementos', $el['id'])
                        ->update([
                            'cantidad' => $el['cantidad'],
                            'ObservacionElemento' => $el['observacionElemento'] ?? null,
                            'updated_at' => now()
                        ]);

                    DB::table('tbl_historial_aprobacion_elemento')->insert([
                        'idElementoDetalle'   => $el['id'],
                        'cantidadAnterior'    => $el['cantidadSolicitada'],
                        'cantidadNueva'       => $el['cantidad'],
                        'estadoAnterior'      => 'Solicitado',
                        'estadoNuevo'         => $el['cantidad'] === 0
                            ? 'Rechazado'
                            : ($el['cantidad'] < $el['cantidadSolicitada']
                                ? 'Aprobado Parcial'
                                : 'Aprobado'),
                        'observacion'         => $el['observacionElemento'],
                        'usuarioResponsable'  => auth()->user()->NombreUsuario ?? 'Sistema',
                        'fechaCambio'         => now(),
                    ]);

                    if ($el['cantidad'] === 0) {
                        $estadoEmpleado = 'Rechazado';
                        $estadoGlobal = 'Aprobado Parcial';
                    } elseif ($el['cantidad'] < $el['cantidadSolicitada']) {
                        if ($estadoEmpleado !== 'Rechazado') {
                            $estadoEmpleado = 'Aprobado Parcial';
                        }
                        if ($estadoGlobal === 'Aprobado') {
                            $estadoGlobal = 'Aprobado Parcial';
                        }
                    }
                }

                DB::table('tbl_detalle_solicitud_empleado')
                    ->where('idSolicitud', $id)
                    ->where('documentoEmpleado', $emp['documentoEmpleado'])
                    ->update([
                        'EstadoSolicitudEmpleado' => $estadoEmpleado,
                        'updated_at' => now()
                    ]);
            }

            if (collect($empleados)->every(fn($e) =>
            $e['elementos'] && collect($e['elementos'])->every(fn($el) => $el['cantidad'] === 0))) {
                $estadoGlobal = 'Rechazado';
            }

            $solicitud->estadoSolicitud = $estadoGlobal;
            $solicitud->save();

            // Preparar empleados para el correo
            $empleadosMail = collect($empleados)->map(function ($emp) {
                return [
                    'nombreEmpleado' => $emp['nombreEmpleado'] ?? 'No definido',
                    'documentoEmpleado' => $emp['documentoEmpleado'] ?? 'N/A',
                    'elementos' => collect($emp['elementos'])->map(function ($el) {
                        return [
                            'nombreElemento' => $el['nombreElemento'] ?? '-',
                            'talla' => $el['talla'] ?? '-',
                            'cantidadSolicitada' => $el['cantidadSolicitada'] ?? 0,
                            'cantidad' => $el['cantidad'] ?? 0,
                            'observacion' => $el['observacionElemento'] ?? '-',
                        ];
                    })->toArray()
                ];
            })->toArray();

            $correoCompras = $request->input('correoCompras');
            $usuarioCreador = $solicitud->usuario;

            Mail::to($correoCompras)->send(new NotificacionSolicitud($solicitud, $empleadosMail, 'compras'));
            if ($usuarioCreador && $usuarioCreador->CorreoUsuario) {
                Mail::to($usuarioCreador->CorreoUsuario)->send(new NotificacionSolicitud($solicitud, $empleadosMail, 'usuario'));
            }

            DB::commit();
            return response()->json(['message' => 'Solicitud procesada correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error al aprobar solicitud', ['exception' => $e->getMessage()]);
            return response()->json(['message' => 'Error interno del servidor.'], 500);
        }
    }
    public function rechazar(Request $request, $id)
{
    $request->validate([
        'motivo' => 'required|string|max:255',
    ]);

    DB::beginTransaction();
    try {
        // Rechazar solicitud general
        DB::table('tbl_solicitudes')
            ->where('id', $id)
            ->update([
                'estadoSolicitud' => 'Rechazado',
                'MotivoRechazo' => $request->motivo,
                'updated_at' => now(),
            ]);

        // Rechazar cada empleado
        DB::table('tbl_detalle_solicitud_empleado')
            ->where('idSolicitud', $id)
            ->update([
                'EstadoSolicitudEmpleado' => 'Rechazado',
                'updated_at' => now(),
            ]);

        DB::commit();
        return response()->json(['message' => 'Solicitud rechazada exitosamente']);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("❌ Error al rechazar solicitud: " . $e->getMessage());
        return response()->json(['message' => 'Error al rechazar solicitud'], 500);
    }
}

    // Procesar solicitud completa en batch (optimizado)
    public function procesarSolicitudCompleta(Request $request)
    {
        $startTime = microtime(true);
        
        Log::info('🚀 Iniciando procesamiento de solicitud completa en batch');
        
        $validated = Validator::make($request->all(), [
            'idUsuario' => 'required|integer|exists:tbl_usuarios_sistema,idUsuario',
            'idEmpresa' => 'required|integer|exists:tbl_empresa,IdEmpresa',
            'idSede' => 'required|integer|exists:tbl_sedes,IdSede',
            'empleados' => 'required|array|min:1',
            'empleados.*.nombresEmpleado' => 'required|string|max:255',
            'empleados.*.documentoEmpleado' => 'required|string|max:50',
            'empleados.*.idCargo' => 'required|integer|exists:tbl_cargo,IdCargo',
            'empleados.*.IdTipoSolicitud' => 'required|integer|exists:tbl_tipo_solicitud,IdTipoSolicitud',
            'empleados.*.observaciones' => 'nullable|string',
            'empleados.*.elementos' => 'required|array|min:1',
            'empleados.*.elementos.*.idElemento' => 'required|integer|exists:tbl_elementos,idElemento',
            'empleados.*.elementos.*.talla' => 'required|string|max:50',
            'empleados.*.elementos.*.cantidad' => 'required|integer|min:1',
        ]);

        if ($validated->fails()) {
            Log::error('❌ Validación fallida en procesarSolicitudCompleta', [
                'errores' => $validated->errors()
            ]);
            return response()->json(['errors' => $validated->errors()], 422);
        }

        DB::beginTransaction();
        
        try {
            // 1. Crear solicitud principal
            $solicitud = new TblSolicitud();
            $solicitud->idUsuario = $request->idUsuario;
            $solicitud->idEmpresa = $request->idEmpresa;
            $solicitud->idSede = $request->idSede;
            $solicitud->fechaSolicitud = now();
            $solicitud->estadoSolicitud = 'En revisión';
            $solicitud->save();

            // Generar código único
            $solicitud->codigoSolicitud = 'DOT-' . str_pad($solicitud->id, 4, '0', STR_PAD_LEFT);
            $solicitud->save();

            Log::info('✅ Solicitud principal creada', [
                'idSolicitud' => $solicitud->id,
                'codigoSolicitud' => $solicitud->codigoSolicitud
            ]);

            // 2. Procesar empleados y elementos en batch
            $empleadosData = [];
            $elementosData = [];

            foreach ($request->empleados as $empleado) {
                // Insertar empleado
                $idDetalleSolicitud = DB::table('tbl_detalle_solicitud_empleado')->insertGetId([
                    'idSolicitud' => $solicitud->id,
                    'documentoEmpleado' => $empleado['documentoEmpleado'],
                    'nombreEmpleado' => $empleado['nombresEmpleado'],
                    'idCargo' => $empleado['idCargo'],
                    'idTipoSolicitud' => $empleado['IdTipoSolicitud'],
                    'observaciones' => $empleado['observaciones'] ?? '',
                    'EstadoSolicitudEmpleado' => 'Pendiente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $empleadosData[] = [
                    'idDetalleSolicitud' => $idDetalleSolicitud,
                    'empleado' => $empleado
                ];

                // Preparar elementos para inserción en batch
                foreach ($empleado['elementos'] as $elemento) {
                    $elementosData[] = [
                        'idDetalleSolicitud' => $idDetalleSolicitud,
                        'idElemento' => $elemento['idElemento'],
                        'TallaElemento' => $elemento['talla'],
                        'Cantidad' => $elemento['cantidad'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // 3. Insertar elementos en batch
            if (!empty($elementosData)) {
                DB::table('tbl_detalle_solicitud_elemento')->insert($elementosData);
                Log::info('✅ Elementos insertados en batch', ['cantidad' => count($elementosData)]);
            }

            DB::commit();

            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);

            Log::info('✅ Solicitud completa procesada exitosamente', [
                'idSolicitud' => $solicitud->id,
                'codigoSolicitud' => $solicitud->codigoSolicitud,
                'empleados' => count($empleadosData),
                'elementos' => count($elementosData),
                'tiempo_ms' => $executionTime
            ]);

            return response()->json([
                'idSolicitud' => $solicitud->id,
                'codigoSolicitud' => $solicitud->codigoSolicitud,
                'empleados' => count($empleadosData),
                'elementos' => count($elementosData),
                'tiempo_ms' => $executionTime
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error procesando solicitud completa', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error interno del servidor al procesar la solicitud.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
