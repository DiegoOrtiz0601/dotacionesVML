<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Controladores del sistema
use App\Http\Controllers\TblUsuarioSistemaController;
use App\Http\Controllers\TblCiudadController;
use App\Http\Controllers\TblEmpresaController;
use App\Http\Controllers\TblSedeController;
use App\Http\Controllers\TblCargoController;
use App\Http\Controllers\TblTipoSolicitudController;

// Relación usuarios-empresa-sede-cargos
use App\Http\Controllers\TblUsuarioEmpresaSedeController;
use App\Http\Controllers\TblUsuarioEmpresaSedeCargoController;

// Flujo de solicitud de dotación
use App\Http\Controllers\TblSolicitudController;
use App\Http\Controllers\TblSolicitudEmpleadoController;
use App\Http\Controllers\TblDetalleSolicitudEmpleadoController;
use App\Http\Controllers\TblDetalleSolicitudElementoController;
use App\Http\Controllers\TblElementosDotacionController;
use App\Http\Controllers\TblElementoController;
use App\Http\Controllers\TblEvidenciaTemporalController;
use App\Http\Controllers\DocumentoEntregaController;

// Controladores especializados
use App\Http\Controllers\MisSolicitudesController;
use App\Http\Controllers\EntregaPDFController;
use App\Http\Controllers\EntregaSolicitudController;

// ─────────────────────────────────────────────────────────────
// 🟢 1. Ruta de login (fuera del middleware Sanctum)
// ─────────────────────────────────────────────────────────────

Route::post('/login', [AuthController::class, 'login']);

// ─────────────────────────────────────────────────────────────
// 🔒 2. Rutas protegidas por autenticación Sanctum
// ─────────────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // 🔐 Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // 👤 Usuarios y datos básicos
    Route::apiResource('usuarios-sistema', TblUsuarioSistemaController::class);
    Route::get('/usuario-autenticado', [TblUsuarioSistemaController::class, 'datosAutenticado']);

    // 🌎 Ciudades, empresas, sedes y cargos
    Route::apiResource('ciudades', TblCiudadController::class);
    Route::apiResource('empresas', TblEmpresaController::class);
    Route::apiResource('sedes', TblSedeController::class);
    Route::apiResource('cargos', TblCargoController::class);

    // 🏢 Relación usuarios - empresa - sede - cargos
    Route::apiResource('usuario-empresa-sede-cargos', TblUsuarioEmpresaSedeCargoController::class);
    Route::get('/mis-empresas-sedes', [TblUsuarioEmpresaSedeController::class, 'getEmpresasYSedes']);
    Route::get('/cargos-por-empresa-sede', [TblUsuarioEmpresaSedeController::class, 'getCargosPorEmpresaYSede']);

    // 📋 Tipos de solicitud (eliminada duplicación)
    Route::apiResource('tipo-solicitud', TblTipoSolicitudController::class);

    // 🧾 Solicitudes principales (eliminada duplicación)
    Route::apiResource('solicitudes', TblSolicitudController::class);
    Route::get('/generar-numero-solicitud', [TblSolicitudController::class, 'generarNumeroSolicitud']);
    
    // Rutas específicas de solicitudes
    Route::get('/solicitudes-gestion', [TblSolicitudController::class, 'indexGestionar']);
    Route::put('/solicitudes/{id}/elementos', [TblSolicitudController::class, 'actualizarElementos']);
    Route::post('/solicitudes/{id}/aprobar', [TblSolicitudController::class, 'aprobar']);
    Route::post('/solicitudes/{id}/rechazar', [TblSolicitudController::class, 'rechazar']);

    // 👥 Detalle de empleados por solicitud
    Route::post('/detalle-solicitud-empleado', [TblSolicitudEmpleadoController::class, 'agregarEmpleado']);
    Route::get('/historial-solicitudes', [TblSolicitudEmpleadoController::class, 'historialSolicitudes']);
    Route::apiResource('detalle-solicitud-empleado', TblDetalleSolicitudEmpleadoController::class);

    // 🎽 Elementos de dotación por empleado
    Route::apiResource('elementos', TblElementoController::class);
    Route::get('/elementos-dotacion', [TblElementosDotacionController::class, 'obtenerElementos']);
    Route::post('/detalle-solicitud-elemento', [TblDetalleSolicitudElementoController::class, 'store']);

    // 📎 Evidencias
    Route::post('/guardar-evidencia', [TblEvidenciaTemporalController::class, 'guardarEvidencia']);

    // 📥 Módulo: Mis Solicitudes
    Route::get('/mis-solicitudes', [MisSolicitudesController::class, 'index']);
    Route::get('/mis-solicitudes/{id}', [MisSolicitudesController::class, 'show']);
    Route::get('/documento-entrega/{codigoSolicitud}', [DocumentoEntregaController::class, 'descargar']);
    
    // 📦 Módulo: Entrega Solicitudes
    Route::get('/solicitudes-entrega', [EntregaSolicitudController::class, 'solicitudesParaEntrega']);
    Route::post('/generar-pdf-entrega', [EntregaPDFController::class, 'generar']);

});
