<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoSolicitud;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TipoSolicitudController extends Controller
{
    public function index()
    {
        return response()->json(TipoSolicitud::all(), 200);
    }
}