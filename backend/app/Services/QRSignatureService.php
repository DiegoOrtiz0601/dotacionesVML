<?php

namespace App\Services;

use App\Models\SignToken;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class QRSignatureService
{
    /**
     * Generar token de firma y QR
     */
    public function generateSignatureToken(array $documentData, int $expirationMinutes = 5): array
    {
        try {
            // Crear token de firma
            $signToken = SignToken::create([
                'token' => SignToken::generateToken(),
                'document_id' => $documentData['document_id'] ?? null,
                'document_type' => $documentData['document_type'] ?? 'entrega',
                'document_data' => $documentData,
                'expires_at' => Carbon::now()->addMinutes($expirationMinutes),
                'status' => 'pending'
            ]);
            
            // Generar QR code
            $qrCodeData = $this->generateQRCode($signToken->getSignatureUrl());
            
            return [
                'success' => true,
                'token' => $signToken->token,
                'qr_code' => $qrCodeData,
                'signature_url' => $signToken->getSignatureUrl(),
                'expires_at' => $signToken->expires_at->toISOString(),
                'expires_in_minutes' => $expirationMinutes
            ];
            
        } catch (\Exception $e) {
            Log::error('Error generando token de firma QR', [
                'error' => $e->getMessage(),
                'document_data' => $documentData
            ]);
            
            return [
                'success' => false,
                'error' => 'Error generando token de firma',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Generar QR Code
     */
    public function generateQRCode(string $url): string
    {
        try {
            // Usar API externa para generar QR (más simple y confiable)
            $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
            $params = http_build_query([
                'size' => '300x300',
                'data' => $url,
                'format' => 'png'
            ]);
            
            $qrImageUrl = $qrApiUrl . '?' . $params;
            
            // Obtener la imagen del QR
            $imageData = file_get_contents($qrImageUrl);
            
            if ($imageData === false) {
                throw new \Exception('No se pudo generar el código QR');
            }
            
            // Convertir a base64 para enviar al frontend
            return 'data:image/png;base64,' . base64_encode($imageData);
            
        } catch (\Exception $e) {
            Log::error('Error generando QR code', [
                'error' => $e->getMessage(),
                'url' => $url
            ]);
            
            throw new \Exception('Error generando código QR: ' . $e->getMessage());
        }
    }

    /**
     * Procesar firma recibida
     */
    public function processSignature(string $token, string $signatureData, string $ip = null, string $userAgent = null): array
    {
        try {
            $signToken = SignToken::where('token', $token)->first();
            
            if (!$signToken) {
                return [
                    'success' => false,
                    'error' => 'Token no encontrado'
                ];
            }
            
            if ($signToken->isExpired()) {
                $signToken->update(['status' => 'expired']);
                return [
                    'success' => false,
                    'error' => 'Token expirado'
                ];
            }
            
            if ($signToken->isSigned()) {
                return [
                    'success' => false,
                    'error' => 'Documento ya firmado'
                ];
            }
            
            // Guardar firma como archivo
            $signaturePath = $this->saveSignatureFile($signatureData, $token);
            
            // Marcar como firmado
            $signToken->markAsSigned($signaturePath, $signatureData, $ip, $userAgent);
            
            return [
                'success' => true,
                'message' => 'Firma procesada correctamente',
                'signature_path' => $signaturePath,
                'signed_at' => $signToken->signed_at->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Error procesando firma', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);
            
            return [
                'success' => false,
                'error' => 'Error procesando firma',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Guardar archivo de firma
     */
    private function saveSignatureFile(string $signatureData, string $token): string
    {
        try {
            // Remover el prefijo data:image/png;base64, si existe
            if (strpos($signatureData, 'data:image/png;base64,') === 0) {
                $signatureData = substr($signatureData, 22);
            }
            
            // Decodificar base64
            $imageData = base64_decode($signatureData);
            
            if ($imageData === false) {
                throw new \Exception('Datos de firma inválidos');
            }
            
            // Crear directorio si no existe
            $directory = 'signatures/' . date('Y/m/d');
            Storage::makeDirectory($directory);
            
            // Generar nombre de archivo único
            $filename = "signature_{$token}_" . time() . '.png';
            $filePath = $directory . '/' . $filename;
            
            // Guardar archivo
            Storage::put($filePath, $imageData);
            
            return $filePath;
            
        } catch (\Exception $e) {
            Log::error('Error guardando archivo de firma', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);
            
            throw new \Exception('Error guardando firma: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estado del token
     */
    public function getTokenStatus(string $token): array
    {
        try {
            $signToken = SignToken::where('token', $token)->first();
            
            if (!$signToken) {
                return [
                    'success' => false,
                    'error' => 'Token no encontrado'
                ];
            }
            
            if ($signToken->isExpired()) {
                $signToken->update(['status' => 'expired']);
                return [
                    'success' => true,
                    'status' => 'expired',
                    'message' => 'Token expirado'
                ];
            }
            
            if ($signToken->isSigned()) {
                return [
                    'success' => true,
                    'status' => 'signed',
                    'message' => 'Documento firmado',
                    'signed_at' => $signToken->signed_at->toISOString(),
                    'signature_path' => $signToken->signature_path
                ];
            }
            
            return [
                'success' => true,
                'status' => 'pending',
                'message' => 'Esperando firma',
                'expires_at' => $signToken->expires_at->toISOString(),
                'expires_in_seconds' => $signToken->expires_at->diffInSeconds(now())
            ];
            
        } catch (\Exception $e) {
            Log::error('Error obteniendo estado del token', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);
            
            return [
                'success' => false,
                'error' => 'Error obteniendo estado',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Limpiar tokens expirados
     */
    public function cleanupExpiredTokens(): int
    {
        try {
            $expiredTokens = SignToken::expired()->where('status', 'pending')->get();
            $count = $expiredTokens->count();
            
            foreach ($expiredTokens as $token) {
                $token->update(['status' => 'expired']);
            }
            
            Log::info("Limpieza de tokens expirados completada", ['count' => $count]);
            
            return $count;
            
        } catch (\Exception $e) {
            Log::error('Error limpiando tokens expirados', [
                'error' => $e->getMessage()
            ]);
            
            return 0;
        }
    }
}
