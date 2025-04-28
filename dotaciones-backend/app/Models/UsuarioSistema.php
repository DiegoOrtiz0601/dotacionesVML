<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UsuarioSistema extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios_sistema';

    protected $fillable = [
        'usuario',
        'contrasena',
        'rol',
        'estado',
    ];

    protected $hidden = [
        'contrasena',
    ];

    public function solicitudes()
    {
        return $this->hasMany(SolicitudDotacion::class, 'id_usuario');
    }

    public function getAuthPassword()
    {
        return $this->contrasena;
    }
}
