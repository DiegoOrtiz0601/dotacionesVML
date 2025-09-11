<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblTipoSolicitudTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_tipo_solicitud', function (Blueprint $table) {
            $table->id('IdTipoSolicitud');
            $table->string('NombreSolicitud');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_tipo_solicitud');
    }
}
