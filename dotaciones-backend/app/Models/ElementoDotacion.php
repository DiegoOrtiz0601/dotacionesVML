<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElementoDotacion extends Model
{
    public function tallas()
    {
        return $this->belongsToMany(Talla::class, 'elemento_tallas', 'id_elemento', 'id_talla');
    }
}