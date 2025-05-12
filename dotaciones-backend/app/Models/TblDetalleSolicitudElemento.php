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
}
