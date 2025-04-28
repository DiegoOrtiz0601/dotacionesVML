<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoSolicitud extends Model
{
    protected $table = 'tipos_solicitud';

    public function solicitudes()
    {
        return $this->hasMany(SolicitudDotacion::class, 'tipo_solicitud_id');
    }
}