<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblTallaElementoTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_talla_elemento', function (Blueprint $table) {
            $table->id('idTallaElemento');
            $table->string('idNombreTalla');
            $table->unsignedBigInteger('idElemento');
            $table->timestamps();

            $table->foreign('idElemento')->references('idElemento')->on('tbl_elementos');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_talla_elemento');
    }
}
