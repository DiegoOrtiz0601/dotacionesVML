<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Talla extends Model
{
    public function elementos()
    {
        return $this->belongsToMany(ElementoDotacion::class, 'elemento_tallas', 'id_talla', 'id_elemento');
    }
}