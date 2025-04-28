<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleSolicitudEmpleado extends Model
{
    use HasFactory;

    protected $table = 'tbl_detalle_solicitud_empleado';
    protected $primaryKey = 'idDetalleSolicitud';
    protected $fillable = ['idSolicitud', 'documentoEmpleado', 'nombreEmpleado', 'idCargo', 'IdTipoSolicitud', 'EstadoSolicitudEmpleado', 'fechaActualizacionSolicitud', 'rutaArchivoSolicitudEmpleado'];
}
