<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ciudad extends Model
{
    public function empresas()
    {
        return $this->hasMany(Empresa::class);
    }

    public function sedes()
    {
        return $this->hasMany(Sede::class);
    }
}