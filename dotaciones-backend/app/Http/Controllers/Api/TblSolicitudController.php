<?php

namespace App\Http\Controllers\Api;

use App\Models\TblSolicitud;
use Illuminate\Http\Request;

class TblSolicitudController extends Controller
{
    public function index()
    {
        return response()->json(TblSolicitud::all());
    }

    public function store(Request $request)
    {
        $registro = TblSolicitud::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblSolicitud::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblSolicitud::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
