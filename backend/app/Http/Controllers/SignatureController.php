<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\QRSignatureService;
use App\Models\SignToken;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SignatureController extends Controller
{
    protected $qrSignatureService;

    public function __construct(QRSignatureService $qrSignatureService)
    {
        $this->qrSignatureService = $qrSignatureService;
    }

    /**
     * Generar token de firma y QR
     * POST /api/signature/generate-token
     */
    public function generateToken(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'document_id' => 'required|string',
                'document_type' => 'string|in:entrega,solicitud,otro',
                'document_data' => 'required|array',
                'expiration_minutes' => 'integer|min:1|max:60'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Datos de validación incorrectos',
                    'details' => $validator->errors()
                ], 422);
            }

            $documentData = $request->all();
            $expirationMinutes = $request->get('expiration_minutes', 5);

            $result = $this->qrSignatureService->generateSignatureToken($documentData, $expirationMinutes);

            if ($result['success']) {
                return response()->json($result, 200);
            } else {
                return response()->json($result, 500);
            }

        } catch (\Exception $e) {
            Log::error('Error en generateToken', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar página de firma móvil
     * GET /firma/{token}
     */
    public function showSignaturePage(string $token)
    {
        try {
            $signToken = SignToken::where('token', $token)->first();

            if (!$signToken) {
                return view('signature.error', [
                    'message' => 'Token no encontrado'
                ]);
            }

            if ($signToken->isExpired()) {
                $signToken->update(['status' => 'expired']);
                return view('signature.error', [
                    'message' => 'Token expirado'
                ]);
            }

            if ($signToken->isSigned()) {
                return view('signature.success', [
                    'message' => 'Documento ya firmado',
                    'signed_at' => $signToken->signed_at
                ]);
            }

            return view('signature.mobile', [
                'token' => $token,
                'document_data' => $signToken->document_data,
                'expires_at' => $signToken->expires_at
            ]);

        } catch (\Exception $e) {
            Log::error('Error en showSignaturePage', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);

            return view('signature.error', [
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    /**
     * Procesar firma desde móvil
     * POST /firma/{token}
     */
    public function processSignature(Request $request, string $token)
    {
        try {
            $validator = Validator::make($request->all(), [
                'signature' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Firma requerida'
                ], 422);
            }

            $signatureData = $request->input('signature');
            $ip = $request->ip();
            $userAgent = $request->userAgent();

            $result = $this->qrSignatureService->processSignature($token, $signatureData, $ip, $userAgent);

            if ($result['success']) {
                return response()->json($result, 200);
            } else {
                return response()->json($result, 400);
            }

        } catch (\Exception $e) {
            Log::error('Error en processSignature', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error procesando firma',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estado del token
     * GET /api/signature/status/{token}
     */
    public function getTokenStatus(string $token)
    {
        try {
            $result = $this->qrSignatureService->getTokenStatus($token);

            if ($result['success']) {
                return response()->json($result, 200);
            } else {
                return response()->json($result, 404);
            }

        } catch (\Exception $e) {
            Log::error('Error en getTokenStatus', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error obteniendo estado',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener firma por token
     * GET /api/signature/get/{token}
     */
    public function getSignature(string $token)
    {
        try {
            $signToken = SignToken::where('token', $token)->first();

            if (!$signToken) {
                return response()->json([
                    'success' => false,
                    'error' => 'Token no encontrado'
                ], 404);
            }

            if (!$signToken->isSigned()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Documento no firmado'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'signature_data' => $signToken->signature_data,
                'signature_path' => $signToken->signature_path,
                'signed_at' => $signToken->signed_at->toISOString(),
                'signer_ip' => $signToken->signer_ip,
                'signer_user_agent' => $signToken->signer_user_agent
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en getSignature', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error obteniendo firma',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar tokens expirados
     * POST /api/signature/cleanup
     */
    public function cleanupExpiredTokens()
    {
        try {
            $count = $this->qrSignatureService->cleanupExpiredTokens();

            return response()->json([
                'success' => true,
                'message' => "Se limpiaron {$count} tokens expirados",
                'count' => $count
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en cleanupExpiredTokens', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error limpiando tokens',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}