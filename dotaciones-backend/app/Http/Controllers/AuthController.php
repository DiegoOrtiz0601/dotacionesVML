<?php

namespace App\Http\Controllers;

use App\Models\TblUsuarioSistema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'NombreUsuario' => 'required|string',
            'PasswordUsuario' => 'required|string',
        ]);

        $user = TblUsuarioSistema::where('NombreUsuario', $request->NombreUsuario)->first();

        if (!$user || !Hash::check($request->PasswordUsuario, $user->PasswordUsuario)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $token = $user->createToken('dotaciones_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'usuario' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }
}
