<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tbl_historial_aprobacion_elemento', function (Blueprint $table) {
            $table->id('idHistorial');
            $table->unsignedBigInteger('idDetalleElemento');
            $table->integer('cantidadAnterior');
            $table->integer('cantidadNueva');
            $table->string('estadoAnterior', 20)->nullable();
            $table->string('estadoNuevo', 20)->nullable();
            $table->text('observacion')->nullable();
            $table->string('usuarioResponsable', 100)->nullable();
            $table->timestamp('fechaCambio')->useCurrent();

            $table->foreign('idDetalleElemento')
                  ->references('idDetalleSolicitudElementos')
                  ->on('tbl_detalle_solicitud_elemento')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_historial_aprobacion_elemento');
    }
};
