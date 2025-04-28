<?php

namespace App\Http\Controllers\Api;

use App\Models\DocumentoEntrega;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DocumentoEntregaController extends Controller
{
    public function index()
    {
        return response()->json(DocumentoEntrega::all(), 200);
    }

    public function store(Request $request)
    {
        $item = DocumentoEntrega::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(DocumentoEntrega::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $item = DocumentoEntrega::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = DocumentoEntrega::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}