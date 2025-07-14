<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPerformanceIndexes extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Índices para tbl_solicitudes
        Schema::table('tbl_solicitudes', function (Blueprint $table) {
            $table->index(['idUsuario', 'estadoSolicitud'], 'idx_solicitudes_usuario_estado');
            $table->index(['idEmpresa', 'idSede'], 'idx_solicitudes_empresa_sede');
            $table->index('created_at', 'idx_solicitudes_created_at');
        });

        // Índices para tbl_detalle_solicitud_empleado
        Schema::table('tbl_detalle_solicitud_empleado', function (Blueprint $table) {
            $table->index('idSolicitud', 'idx_detalle_solicitud_empleado_solicitud');
            $table->index('documentoEmpleado', 'idx_detalle_solicitud_empleado_documento');
            $table->index(['idSolicitud', 'EstadoSolicitudEmpleado'], 'idx_detalle_solicitud_empleado_solicitud_estado');
        });

        // Índices para tbl_detalle_solicitud_elemento
        Schema::table('tbl_detalle_solicitud_elemento', function (Blueprint $table) {
            $table->index('idDetalleSolicitud', 'idx_detalle_solicitud_elemento_detalle');
            $table->index('idElemento', 'idx_detalle_solicitud_elemento_elemento');
        });

        // Índices para tbl_historial_aprobacion_elemento
        Schema::table('tbl_historial_aprobacion_elemento', function (Blueprint $table) {
            $table->index('idElementoDetalle', 'idx_historial_elemento_detalle');
            $table->index('fechaCambio', 'idx_historial_fecha_cambio');
        });

        // Índices para tbl_evidencias_temporales
        Schema::table('tbl_evidencias_temporales', function (Blueprint $table) {
            $table->index('idSolicitud', 'idx_evidencias_solicitud');
            $table->index('documentoEmpleado', 'idx_evidencias_documento');
        });

        // Índices para tbl_elementos
        Schema::table('tbl_elementos', function (Blueprint $table) {
            $table->index(['IdEmpresa', 'IdCargo'], 'idx_elementos_empresa_cargo');
            $table->index('estadoElemento', 'idx_elementos_estado');
        });

        // Índices para tbl_usuario_empresa_sede_cargos
        Schema::table('tbl_usuario_empresa_sede_cargos', function (Blueprint $table) {
            $table->index('IdUsuario', 'idx_usuario_empresa_sede_cargos_usuario');
            $table->index(['IdEmpresa', 'IdSede'], 'idx_usuario_empresa_sede_cargos_empresa_sede');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover índices de tbl_solicitudes
        Schema::table('tbl_solicitudes', function (Blueprint $table) {
            $table->dropIndex('idx_solicitudes_usuario_estado');
            $table->dropIndex('idx_solicitudes_empresa_sede');
            $table->dropIndex('idx_solicitudes_created_at');
        });

        // Remover índices de tbl_detalle_solicitud_empleado
        Schema::table('tbl_detalle_solicitud_empleado', function (Blueprint $table) {
            $table->dropIndex('idx_detalle_solicitud_empleado_solicitud');
            $table->dropIndex('idx_detalle_solicitud_empleado_documento');
            $table->dropIndex('idx_detalle_solicitud_empleado_solicitud_estado');
        });

        // Remover índices de tbl_detalle_solicitud_elemento
        Schema::table('tbl_detalle_solicitud_elemento', function (Blueprint $table) {
            $table->dropIndex('idx_detalle_solicitud_elemento_detalle');
            $table->dropIndex('idx_detalle_solicitud_elemento_elemento');
        });

        // Remover índices de tbl_historial_aprobacion_elemento
        Schema::table('tbl_historial_aprobacion_elemento', function (Blueprint $table) {
            $table->dropIndex('idx_historial_elemento_detalle');
            $table->dropIndex('idx_historial_fecha_cambio');
        });

        // Remover índices de tbl_evidencias_temporales
        Schema::table('tbl_evidencias_temporales', function (Blueprint $table) {
            $table->dropIndex('idx_evidencias_solicitud');
            $table->dropIndex('idx_evidencias_documento');
        });

        // Remover índices de tbl_elementos
        Schema::table('tbl_elementos', function (Blueprint $table) {
            $table->dropIndex('idx_elementos_empresa_cargo');
            $table->dropIndex('idx_elementos_estado');
        });

        // Remover índices de tbl_usuario_empresa_sede_cargos
        Schema::table('tbl_usuario_empresa_sede_cargos', function (Blueprint $table) {
            $table->dropIndex('idx_usuario_empresa_sede_cargos_usuario');
            $table->dropIndex('idx_usuario_empresa_sede_cargos_empresa_sede');
        });
    }
} 