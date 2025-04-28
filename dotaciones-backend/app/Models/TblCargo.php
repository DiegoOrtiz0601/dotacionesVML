<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblCargo extends Model
{
    use HasFactory;

    protected $table = 'tbl_cargo';
    protected $primaryKey = 'IdCargo';
    protected $fillable = ['NombreCargo', 'IdSede'];
}
