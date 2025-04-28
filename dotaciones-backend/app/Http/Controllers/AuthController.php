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
    
        Log::info('Intentando login para: ' . $request->NombreUsuario);
    
        if (!$user) {
            Log::warning('Usuario no encontrado: ' . $request->NombreUsuario);
            return response()->json(['message' => 'Usuario no encontrado'], 401);
        }
    
        if (!Hash::check($request->PasswordUsuario, $user->PasswordUsuario)) {
            Log::warning('Password incorrecto para usuario: ' . $request->NombreUsuario);
            return response()->json(['message' => 'Contraseña incorrecta'], 401);
        }
    
        Log::info('Login exitoso para: ' . $request->NombreUsuario);
    
        $token = $user->createToken('dotaciones_token')->plainTextToken;
    
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
    

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }
}
