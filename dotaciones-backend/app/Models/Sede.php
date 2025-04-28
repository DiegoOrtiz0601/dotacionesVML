<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sede extends Model
{
    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class);
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    public function solicitantes()
    {
        return $this->hasMany(Solicitante::class);
    }
}