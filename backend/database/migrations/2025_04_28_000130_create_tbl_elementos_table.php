<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblElementosTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_elementos', function (Blueprint $table) {
            $table->id('idElemento');
            $table->string('nombreElemento');
            $table->unsignedBigInteger('IdCargo');
            $table->timestamps();

            $table->foreign('IdCargo')->references('IdCargo')->on('tbl_cargo');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_elementos');
    }
}
