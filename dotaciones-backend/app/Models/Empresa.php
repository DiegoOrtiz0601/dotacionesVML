<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class);
    }

    public function sedes()
    {
        return $this->hasMany(Sede::class);
    }

    public function solicitantes()
    {
        return $this->hasMany(Solicitante::class);
    }
}