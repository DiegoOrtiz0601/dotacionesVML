<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblLogEvidenciasTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_log_evidencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('idSolicitud');
            $table->string('documentoEmpleado');
            $table->string('accion'); // ej: 'CREAR_CARPETA', 'GUARDAR_ARCHIVO'
            $table->text('mensaje');
            $table->string('usuario')->nullable(); // en caso de que quieras registrar quién lo hizo
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_log_evidencias');
    }
}

