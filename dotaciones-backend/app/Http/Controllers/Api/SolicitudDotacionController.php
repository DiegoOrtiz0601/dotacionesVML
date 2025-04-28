<?php

namespace App\Http\Controllers\Api;

use App\Models\SolicitudDotacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SolicitudDotacionController extends Controller
{
    public function index()
    {
        return response()->json(SolicitudDotacion::all(), 200);
    }

    public function store(Request $request)
    {
        $item = SolicitudDotacion::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(SolicitudDotacion::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $item = SolicitudDotacion::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = SolicitudDotacion::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }

}