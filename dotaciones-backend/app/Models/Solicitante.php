<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitante extends Model
{
    protected $fillable = [
        'documento',
        'nombres',
        'apellidos',
        'empresa_id',
        'sede_id',
        'area_id',
        'cargo',
        'estado',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function solicitudes()
    {
        return $this->belongsToMany(SolicitudDotacion::class, 'solicitud_solicitante', 'id_solicitante', 'id_solicitud');
    }

    public function entregas()
    {
        return $this->hasMany(DocumentoEntrega::class, 'id_solicitante');
    }
}
