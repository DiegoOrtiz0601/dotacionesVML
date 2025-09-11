<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TblTipoSolicitud extends Model
{
    protected $table = 'tbl_tipo_solicitud';
    protected $primaryKey = 'IdTipoSolicitud';

    public $timestamps = false; // solo si tu tabla no tiene created_at / updated_at
}