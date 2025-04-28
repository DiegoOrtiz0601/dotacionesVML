<?php

namespace App\Http\Controllers\Api;

use App\Models\Empresa;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EmpresaController extends Controller
{
    public function index()
    {
        return response()->json(Empresa::all(), 200);
    }

    public function store(Request $request)
    {
        $item = Empresa::create($request->all());
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Empresa::findOrFail($id);
        $item->update($request->all());
        return response()->json($item, 200);
    }

    public function destroy($id)
    {
        $item = Empresa::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}