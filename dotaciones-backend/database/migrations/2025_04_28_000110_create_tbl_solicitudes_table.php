<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblSolicitudesTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_solicitudes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('idSolicitud')->unique();
            $table->unsignedBigInteger('idUsuario');
            $table->unsignedBigInteger('idEmpresa')->nullable();
            $table->unsignedBigInteger('idSede')->nullable();
            $table->date('fechaSolicitud');
            $table->string('estadoSolicitud')->default('Pendiente');
            $table->timestamps();

            $table->foreign('idUsuario')->references('idUsuario')->on('tbl_usuarios_sistema');
            $table->foreign('idEmpresa')->references('IdEmpresa')->on('tbl_empresa');
            $table->foreign('idSede')->references('IdSede')->on('tbl_sedes');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_solicitudes');
    }
}
