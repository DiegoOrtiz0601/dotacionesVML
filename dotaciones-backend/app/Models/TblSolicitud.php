<?php
namespace App\Models;

use App\Models\TblEmpresa;
use App\Models\TblSede;
use App\Models\TblUsuarioSistema;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblSolicitud extends Model
{
    protected $table = 'tbl_solicitudes';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'codigoSolicitud',
        'idUsuario',
        'idEmpresa',
        'idSede',
        'fechaSolicitud',
        'estadoSolicitud',
    ];

    public $timestamps = true;

    // ✅ Relación con empresa
    public function empresa()
    {
        return $this->belongsTo(TblEmpresa::class, 'idEmpresa', 'IdEmpresa');
    }

    // ✅ Relación con sede
    public function sede()
    {
        return $this->belongsTo(TblSede::class, 'idSede', 'IdSede');
    }

    // ✅ Relación con el usuario creador
    public function usuario()
    {
        return $this->belongsTo(TblUsuarioSistema::class, 'idUsuario', 'idUsuario');
    }
}
