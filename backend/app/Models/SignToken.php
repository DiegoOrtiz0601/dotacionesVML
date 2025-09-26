<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SignToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'document_id',
        'document_type',
        'document_data',
        'expires_at',
        'signed_at',
        'signature_path',
        'signature_data',
        'signer_ip',
        'signer_user_agent',
        'status'
    ];

    protected $casts = [
        'document_data' => 'array',
        'expires_at' => 'datetime',
        'signed_at' => 'datetime',
    ];

    /**
     * Generar un token único
     */
    public static function generateToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while (self::where('token', $token)->exists());
        
        return $token;
    }

    /**
     * Crear un nuevo token de firma
     */
    public static function createSignatureToken(array $documentData, int $expirationMinutes = 5): self
    {
        return self::create([
            'token' => self::generateToken(),
            'document_id' => $documentData['document_id'] ?? null,
            'document_type' => $documentData['document_type'] ?? 'entrega',
            'document_data' => $documentData,
            'expires_at' => Carbon::now()->addMinutes($expirationMinutes),
            'status' => 'pending'
        ]);
    }

    /**
     * Verificar si el token está expirado
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Verificar si el token está firmado
     */
    public function isSigned(): bool
    {
        return $this->status === 'signed' && !is_null($this->signed_at);
    }

    /**
     * Marcar como firmado
     */
    public function markAsSigned(string $signaturePath, string $signatureData, string $ip = null, string $userAgent = null): void
    {
        $this->update([
            'status' => 'signed',
            'signed_at' => Carbon::now(),
            'signature_path' => $signaturePath,
            'signature_data' => $signatureData,
            'signer_ip' => $ip,
            'signer_user_agent' => $userAgent
        ]);
    }

    /**
     * Obtener URL de firma
     */
    public function getSignatureUrl(): string
    {
        return url("/firma/{$this->token}");
    }

    /**
     * Scope para tokens válidos (no expirados y pendientes)
     */
    public function scopeValid($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', Carbon::now());
    }

    /**
     * Scope para tokens expirados
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', Carbon::now());
    }
}