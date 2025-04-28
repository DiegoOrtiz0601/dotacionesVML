<?php

namespace App\Http\Controllers\Api;

use App\Models\Solicitante;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SolicitanteController extends Controller
{
    public function index()
    {
        return response()->json(Solicitante::all(), 200);
    }

    public function store(Request $request)
    {
        $item = Solicitante::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Solicitante::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $item = Solicitante::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = Solicitante::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
    public function porSede($sedeId)
    {
        return response()->json(Solicitante::where('sede_id', $sedeId)->get(), 200);
    }
}