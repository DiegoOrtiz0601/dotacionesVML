<?php

namespace App\Http\Controllers\Api;

use App\Models\DetalleSolicitudDotacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DetalleSolicitudDotacionController extends Controller
{
    public function index()
    {
        return response()->json(DetalleSolicitudDotacion::all(), 200);
    }

    public function store(Request $request)
    {
        $item = DetalleSolicitudDotacion::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(DetalleSolicitudDotacion::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $item = DetalleSolicitudDotacion::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = DetalleSolicitudDotacion::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
    public function porSolicitud($id)
    {
        return response()->json(DetalleSolicitudDotacion::where('id_solicitud', $id)->get(), 200);
    }
}