<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblElemento extends Model
{
    use HasFactory;

    protected $table = 'tbl_elementos';
    protected $primaryKey = 'idElemento';
    protected $fillable = ['nombreElemento', 'IdCargo'];
}
