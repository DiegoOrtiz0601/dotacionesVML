<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class TblUsuarioSistema extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'tbl_usuarios_sistema';
    protected $primaryKey = 'idUsuario';
    public $timestamps = true;

    protected $fillable = [
        'NombreUsuario',
        'PasswordUsuario',
        'RolUsuario',
        'EstadoUsuario',
    ];

    protected $hidden = [
        'PasswordUsuario',
        'remember_token',
    ];
    
    public function getAuthPassword()
    {
        return $this->PasswordUsuario;
    }
}
