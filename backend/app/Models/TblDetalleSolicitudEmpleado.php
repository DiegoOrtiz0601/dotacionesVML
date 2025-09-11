<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleSolicitudEmpleado extends Model
{
    use HasFactory;

    protected $table = 'tbl_detalle_solicitud_empleado';
    protected $primaryKey = 'idDetalleSolicitud';
    protected $fillable = ['idSolicitud', 'documentoEmpleado', 'nombreEmpleado', 'idCargo', 'IdTipoSolicitud', 'EstadoSolicitudEmpleado', 'fechaActualizacionSolicitud', 'rutaArchivoSolicitudEmpleado', 'observaciones'];
    
    // 🔗 Relación con la solicitud
    public function solicitud()
    {
        return $this->belongsTo(TblSolicitud::class, 'idSolicitud', 'id');
    }
    
    // 🔗 Relación con elementos del empleado
    public function elementos()
    {
        return $this->hasMany(TblDetalleSolicitudElemento::class, 'idDetalleSolicitud', 'idDetalleSolicitud');
    }
    
    // 🔗 Relación con el tipo de solicitud
    public function tipoSolicitud()
    {
        return $this->belongsTo(TblTipoSolicitud::class, 'IdTipoSolicitud', 'idTipoSolicitud');
    }
}
