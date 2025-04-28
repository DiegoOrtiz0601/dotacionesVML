<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblTipoSolicitud extends Model
{
    use HasFactory;

    protected $table = 'tbl_tipo_solicitud';
    protected $primaryKey = 'IdTipoSolicitud';
    protected $fillable = ['NombreSolicitud'];
}
