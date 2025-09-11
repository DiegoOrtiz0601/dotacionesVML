<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleSolicitudElemento extends Model
{
    use HasFactory;

    protected $table = 'tbl_detalle_solicitud_elemento';
    protected $primaryKey = 'idDetalleSolicitudElementos';
    
    protected $fillable = [
        'idDetalleSolicitud',
        'idElemento',
        'TallaElemento', // ✅ este es el campo correcto
        'Cantidad'
    ];
    
    // 🔗 Relación con el empleado
    public function empleado()
    {
        return $this->belongsTo(TblDetalleSolicitudEmpleado::class, 'idDetalleSolicitud', 'idDetalleSolicitud');
    }
    
    // 🔗 Relación con el elemento
    public function elemento()
    {
        return $this->belongsTo(TblElemento::class, 'idElemento', 'idElemento');
    }
    
    // 🔗 Accesores para compatibilidad con el controlador
    public function getTallaAttribute()
    {
        return $this->TallaElemento;
    }
    
    public function getCantidadSolicitadaAttribute()
    {
        return $this->Cantidad;
    }
    
    public function getNombreElementoAttribute()
    {
        if ($this->elemento) {
            return $this->elemento->nombreElemento;
        }
        
        // 🔍 Fallback: Intentar obtener el elemento directamente si la relación falla
        try {
            $elemento = \App\Models\TblElemento::find($this->idElemento);
            return $elemento ? $elemento->nombreElemento : 'Elemento no encontrado';
        } catch (\Exception $e) {
            return 'Error al obtener elemento';
        }
    }
}
