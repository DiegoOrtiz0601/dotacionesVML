<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblSedesTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_sedes', function (Blueprint $table) {
            $table->id('IdSede');
            $table->string('NombreSede');
            $table->unsignedBigInteger('IdEmpresa');
            $table->timestamps();

            $table->foreign('IdEmpresa')->references('IdEmpresa')->on('tbl_empresa');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_sedes');
    }
}
