<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TblSolicitud extends Model
{
    protected $table = 'tbl_solicitudes';

    protected $primaryKey = 'id'; // clave real en la base

    public $incrementing = true;

    protected $fillable = [
    'idSolicitud',       // ← Aquí va el DOT-0001
    'idUsuario',
    'idEmpresa',
    'idSede',
    'fechaSolicitud',
    'estadoSolicitud',
    ];

    public $timestamps = true;
}

