<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblTallaElemento extends Model
{
    use HasFactory;

    protected $table = 'tbl_talla_elemento';
    protected $primaryKey = 'idTallaElemento';
    protected $fillable = ['idNombreTalla', 'idElemento'];
}
