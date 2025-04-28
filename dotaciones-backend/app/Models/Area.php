<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }

    public function solicitantes()
    {
        return $this->hasMany(Solicitante::class);
    }
}