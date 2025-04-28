<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblEmpresa extends Model
{
    use HasFactory;

    protected $table = 'tbl_empresa';
    protected $primaryKey = 'IdEmpresa';
    protected $fillable = ['NombreEmpresa', 'NitEmpresa', 'DireccionEmpresa', 'IdCiudad'];
}
