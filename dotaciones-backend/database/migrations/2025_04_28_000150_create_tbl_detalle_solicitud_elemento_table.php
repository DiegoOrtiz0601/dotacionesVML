<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblDetalleSolicitudElementoTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_detalle_solicitud_elemento', function (Blueprint $table) {
            $table->id('idDetalleSolicitudElementos');
            $table->unsignedBigInteger('idDetalleSolicitud');
            $table->unsignedBigInteger('idElemento');
            $table->unsignedBigInteger('idTallaElemento');
            $table->integer('Cantidad');
            $table->timestamps();

            $table->foreign('idDetalleSolicitud')->references('idDetalleSolicitud')->on('tbl_detalle_solicitud_empleado');
            $table->foreign('idElemento')->references('idElemento')->on('tbl_elementos');
            $table->foreign('idTallaElemento')->references('idTallaElemento')->on('tbl_talla_elemento');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_detalle_solicitud_elemento');
    }
}
