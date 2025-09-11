<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblUsuarioEmpresaSedeCargo extends Model
{
    use HasFactory;

    protected $table = 'tbl_usuario_empresa_sede_cargos';
    protected $primaryKey = 'IdUsuarioEmpresa';
    protected $fillable = ['IdUsuario', 'IdEmpresa', 'IdSede'];
}
