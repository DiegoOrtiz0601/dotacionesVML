<?php

namespace App\Http\Controllers\Api;

use App\Models\Talla;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TallaController extends Controller
{
    public function index()
    {
        return response()->json(Talla::all(), 200);
    }
}