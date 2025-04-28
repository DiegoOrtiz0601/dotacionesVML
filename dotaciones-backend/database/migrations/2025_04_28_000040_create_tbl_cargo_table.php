<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblCargoTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_cargo', function (Blueprint $table) {
            $table->id('IdCargo');
            $table->string('NombreCargo');
            $table->unsignedBigInteger('IdSede');
            $table->timestamps();

            $table->foreign('IdSede')->references('IdSede')->on('tbl_sedes');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_cargo');
    }
}
