<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleSolicitudDotacion extends Model
{
    protected $table = 'detalle_solicitudes_dotacion';

    public function solicitud()
    {
        return $this->belongsTo(SolicitudDotacion::class, 'id_solicitud');
    }

    public function solicitante()
    {
        return $this->belongsTo(Solicitante::class, 'id_solicitante');
    }

    public function elemento()
    {
        return $this->belongsTo(ElementoDotacion::class, 'id_elemento');
    }

    public function talla()
    {
        return $this->belongsTo(Talla::class, 'id_talla');
    }
}