<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblUsuarioEmpresaSedeCargosTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_usuario_empresa_sede_cargos', function (Blueprint $table) {
            $table->id('IdUsuarioEmpresa');
            $table->unsignedBigInteger('IdUsuario');
            $table->unsignedBigInteger('IdEmpresa');
            $table->unsignedBigInteger('IdSede');
            $table->timestamps();

            $table->foreign('IdUsuario')->references('idUsuario')->on('tbl_usuarios_sistema');
            $table->foreign('IdEmpresa')->references('IdEmpresa')->on('tbl_empresa');
            $table->foreign('IdSede')->references('IdSede')->on('tbl_sedes');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_usuario_empresa_sede_cargos');
    }
}
