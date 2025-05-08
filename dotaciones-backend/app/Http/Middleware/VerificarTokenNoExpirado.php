<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerificarTokenNoExpirado
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        $token = $user?->currentAccessToken();
        if (!$token) {
            return response()->json(['message' => 'Token no encontrado'], 401);
        }

        if ($token->expires_at && now()->greaterThan($token->expires_at)) {
            $token->delete(); // elimina token expirado
            return response()->json(['message' => 'Token expirado'], 401);
        }

        return $next($request);
    }
}
