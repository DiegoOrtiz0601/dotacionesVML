<?php

namespace App\Http\Controllers\Api;

use App\Models\ElementoDotacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ElementoDotacionController extends Controller
{
    public function index()
    {
        return response()->json(ElementoDotacion::all(), 200);
    }
    public function tallas($elementoId)
    {
        $elemento = ElementoDotacion::findOrFail($elementoId);
        return response()->json($elemento->tallas, 200);
    }
}