<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentoEntrega extends Model
{
    protected $table = 'documentos_entrega';

    public function solicitud()
    {
        return $this->belongsTo(SolicitudDotacion::class, 'id_solicitud');
    }

    public function solicitante()
    {
        return $this->belongsTo(Solicitante::class, 'id_solicitante');
    }
}