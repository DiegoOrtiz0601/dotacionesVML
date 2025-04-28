<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\UsuarioSistema;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'contrasena' => 'required|string',
        ]);

        $user = UsuarioSistema::where('usuario', $request->usuario)->first();

        if (! $user || ! Hash::check($request->contrasena, $user->contrasena)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if (! $user->estado) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'usuario' => $user
        ]);
    }
    public function cambiarContrasena(Request $request)
{
    $request->validate([
        'nueva_contrasena' => 'required|string|min:6|confirmed',
    ]);

    $usuario = $request->user();
    $usuario->contrasena = Hash::make($request->nueva_contrasena);
    $usuario->save();

    return response()->json(['message' => 'Contraseña actualizada correctamente']);
}
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}