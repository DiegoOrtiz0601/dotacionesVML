<?php

namespace App\Http\Controllers;

use App\Models\TblSolicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TblSolicitudController extends Controller
{
    // Obtener todas las solicitudes
    public function index()
    {
        return response()->json(TblSolicitud::all());
    }

    // Crear nueva solicitud
  public function store(Request $request)
{
    $data = $request->all();

    // ✅ Validamos los campos obligatorios y que existan en sus respectivas tablas
    $validated = \Validator::make($data, [
        'idUsuario' => 'required|integer|exists:tbl_usuarios_sistema,idUsuario',
        'idEmpresa' => 'required|integer|exists:tbl_empresa,IdEmpresa',
        'idSede'    => 'required|integer|exists:tbl_sedes,IdSede',
    ]);

    // ❌ Si la validación falla, retornamos errores con status 422
    if ($validated->fails()) {
        \Log::error('❌ Validación fallida en store solicitud', [
            'errores' => $validated->errors(),
            'payload' => $data
        ]);
        return response()->json(['errors' => $validated->errors()], 422);
    }

    // ✅ Paso 1: Creamos el registro sin idSolicitud todavía (porque no lo conocemos aún)
    $registro = new TblSolicitud();
    $registro->idUsuario = $data['idUsuario'];
    $registro->idEmpresa = $data['idEmpresa'];
    $registro->idSede = $data['idSede'];
    $registro->fechaSolicitud = now();
    $registro->estadoSolicitud = 'En revisión';
    $registro->save(); // 🚀 Aquí Laravel genera automáticamente el ID (PK autoincremental)

    // ✅ Paso 2: Ahora que ya tenemos el ID generado, generamos el número de solicitud lógico
    $registro->idSolicitud = 'DOT-' . str_pad($registro->id, 4, '0', STR_PAD_LEFT);
    $registro->save(); // ✅ Guardamos ahora el campo lógico con formato

    // ✅ Paso 3: Devolvemos ambos valores (id PK y idSolicitud lógico) al frontend
    return response()->json([
        'id' => $registro->id, // clave primaria real
        'idSolicitud' => $registro->idSolicitud, // número visible (DOT-000X)
    ], 201);
}



    // Mostrar una solicitud por ID
    public function show($id)
    {
        return response()->json(TblSolicitud::findOrFail($id));
    }

    // Actualizar una solicitud
    public function update(Request $request, $id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->update($request->all());

        return response()->json($registro);
    }

    // Eliminar una solicitud
    public function destroy($id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->delete();

        return response()->json(null, 204);
    }

    // 🔁 Esta función queda obsoleta si se genera número en store()
    // Pero la dejamos por si necesitas usarla desde el frontend
   public function generarNumeroSolicitud()
{
    $ultimoRaw = DB::table('tbl_solicitudes')
        ->selectRaw("MAX(CAST(SUBSTRING(idSolicitud, 5, LEN(idSolicitud)) AS INT)) as maxId")
        ->first();

    $ultimo = is_null($ultimoRaw->maxId) ? 0 : (int)$ultimoRaw->maxId; // <- este manejo es correcto y se queda
    $nuevoNumero = $ultimo + 1;
    $codigo = 'DOT-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT);

    return response()->json([
        'numeroSolicitud' => $codigo,
        'idSolicitud'     => $nuevoNumero
    ]);
}
}
