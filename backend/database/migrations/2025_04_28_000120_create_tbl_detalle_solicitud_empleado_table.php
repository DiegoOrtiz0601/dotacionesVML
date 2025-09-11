<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblDetalleSolicitudEmpleadoTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_detalle_solicitud_empleado', function (Blueprint $table) {
            $table->id('idDetalleSolicitud');
            $table->unsignedBigInteger('idSolicitud');
            $table->string('documentoEmpleado');
            $table->string('nombreEmpleado');
            $table->unsignedBigInteger('idCargo');
            $table->unsignedBigInteger('IdTipoSolicitud');
            $table->string('EstadoSolicitudEmpleado')->default('Pendiente');
            $table->timestamp('fechaActualizacionSolicitud')->nullable();
            $table->string('rutaArchivoSolicitudEmpleado')->nullable();
            $table->timestamps();

            $table->foreign('idSolicitud')->references('id')->on('tbl_solicitudes');
            $table->foreign('idCargo')->references('IdCargo')->on('tbl_cargo');
            $table->foreign('IdTipoSolicitud')->references('IdTipoSolicitud')->on('tbl_tipo_solicitud');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_detalle_solicitud_empleado');
    }
}
