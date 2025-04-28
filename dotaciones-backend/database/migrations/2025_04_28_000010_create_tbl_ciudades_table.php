<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblCiudadesTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_ciudades', function (Blueprint $table) {
            $table->id('IdCiudad');
            $table->string('nombreCiudad');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_ciudades');
    }
}
