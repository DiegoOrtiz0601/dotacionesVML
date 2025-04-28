<?php

namespace App\Http\Controllers;

use App\Models\TblTipoSolicitud;
use Illuminate\Http\Request;

class TblTipoSolicitudController extends Controller
{
    public function index()
    {
        return response()->json(TblTipoSolicitud::all());
    }

    public function store(Request $request)
    {
        $registro = TblTipoSolicitud::create($request->all());
        return response()->json($registro, 201);
    }

    public function show($id)
    {
        return response()->json(TblTipoSolicitud::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $registro = TblTipoSolicitud::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy($id)
    {
        $registro = TblTipoSolicitud::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
