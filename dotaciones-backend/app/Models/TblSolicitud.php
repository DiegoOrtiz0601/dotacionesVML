<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblSolicitud extends Model
{
    use HasFactory;

    protected $table = 'tbl_solicitudes';
    protected $primaryKey = 'id';
    protected $fillable = ['idSolicitud', 'idUsuario', 'idEmpresa', 'idSede', 'fechaSolicitud', 'estadoSolicitud'];
}
