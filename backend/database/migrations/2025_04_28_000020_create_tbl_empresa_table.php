<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblEmpresaTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_empresa', function (Blueprint $table) {
            $table->id('IdEmpresa');
            $table->string('NombreEmpresa');
            $table->string('NitEmpresa')->nullable();
            $table->string('DireccionEmpresa')->nullable();
            $table->unsignedBigInteger('IdCiudad');
            $table->timestamps();

            $table->foreign('IdCiudad')->references('IdCiudad')->on('tbl_ciudades');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_empresa');
    }
}
