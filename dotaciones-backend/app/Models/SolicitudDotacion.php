<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudDotacion extends Model
{
    protected $table = 'solicitudes_dotacion';

    public function tipo()
    {
        return $this->belongsTo(TipoSolicitud::class, 'tipo_solicitud_id');
    }

    public function usuario()
    {
        return $this->belongsTo(UsuarioSistema::class, 'id_usuario');
    }

    public function solicitantes()
    {
        return $this->belongsToMany(Solicitante::class, 'solicitud_solicitante', 'id_solicitud', 'id_solicitante');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleSolicitudDotacion::class, 'id_solicitud');
    }

    public function entregas()
    {
        return $this->hasMany(DocumentoEntrega::class, 'id_solicitud');
    }
}