<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblSede extends Model
{
    use HasFactory;

    protected $table = 'tbl_sedes';
    protected $primaryKey = 'IdSede';
    protected $fillable = ['NombreSede', 'IdEmpresa'];
}
