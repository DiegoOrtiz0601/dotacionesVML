<?php

namespace App\Http\Controllers;

use App\Models\TblSolicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TblSolicitudController extends Controller
{
    // 🔍 Obtener todas las solicitudes
    public function index()
    {
        return response()->json(TblSolicitud::all());
    }

    // 📝 Crear nueva solicitud
    public function store(Request $request)
    {
        $data = $request->all();

        // ✅ Validación de campos requeridos y existencia en otras tablas
        $validated = Validator::make($data, [
            'idUsuario' => 'required|integer|exists:tbl_usuarios_sistema,idUsuario',
            'idEmpresa' => 'required|integer|exists:tbl_empresa,IdEmpresa',
            'idSede'    => 'required|integer|exists:tbl_sedes,IdSede',
        ]);

        if ($validated->fails()) {
            Log::error('❌ Validación fallida en store solicitud', [
                'errores' => $validated->errors(),
                'payload' => $data
            ]);
            return response()->json(['errors' => $validated->errors()], 422);
        }

        // ✅ Crear nueva solicitud
        $registro = new TblSolicitud();
        $registro->idUsuario = $data['idUsuario'];
        $registro->idEmpresa = $data['idEmpresa'];
        $registro->idSede = $data['idSede'];
        $registro->fechaSolicitud = now();
        $registro->estadoSolicitud = 'En revisión';
        $registro->save(); // Se genera el ID

        // ✅ Generar número visual de solicitud tipo DOT-0001
        $registro->idSolicitud = 'DOT-' . str_pad($registro->id, 4, '0', STR_PAD_LEFT);
        $registro->save();

        // ✅ Respuesta con el ID real y el número visible
        return response()->json([
            'id' => $registro->id,
            'idSolicitud' => $registro->idSolicitud
        ], 201);
    }

    // 📌 Obtener una solicitud específica
    public function show($id)
    {
        return response()->json(TblSolicitud::findOrFail($id));
    }

    // ✏️ Actualizar solicitud
    public function update(Request $request, $id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->update($request->all());

        return response()->json($registro);
    }

    // 🗑️ Eliminar solicitud
    public function destroy($id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->delete();

        return response()->json(null, 204);
    }

    // ⚙️ Generar número de solicitud visual sin crear aún
    public function generarNumeroSolicitud()
    {
        // ✅ Obtener último ID real (autoincremental)
        $ultimoId = DB::table('tbl_solicitudes')->max('id');
        $nuevoId = is_null($ultimoId) ? 1 : $ultimoId + 1;
        $codigo = 'DOT-' . str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

        return response()->json([
            'numeroSolicitud' => $codigo,
            'idSolicitud'     => $nuevoId
        ]);
    }
}
