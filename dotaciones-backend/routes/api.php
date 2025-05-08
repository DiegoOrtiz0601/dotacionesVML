<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TblUsuarioSistemaController;
use App\Http\Controllers\TblCiudadController;
use App\Http\Controllers\TblEmpresaController;
use App\Http\Controllers\TblSedeController;
use App\Http\Controllers\TblCargoController;
use App\Http\Controllers\TblUsuarioEmpresaSedeCargoController;
use App\Http\Controllers\TblUsuarioEmpresaSedeController;
use App\Http\Controllers\TblTipoSolicitudController;
use App\Http\Controllers\TblSolicitudController;
use App\Http\Controllers\TblDetalleSolicitudEmpleadoController;
use App\Http\Controllers\TblElementoController;
use App\Http\Controllers\TblTallaElementoController;
use App\Http\Controllers\TblDetalleSolicitudElementoController;

// ✅ Ruta de login debe estar FUERA del middleware
Route::post('/login', [AuthController::class, 'login']);

// ✅ Rutas protegidas por sanctum
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('usuarios-sistema', TblUsuarioSistemaController::class);
    Route::apiResource('ciudades', TblCiudadController::class);
    Route::apiResource('empresas', TblEmpresaController::class);
    Route::apiResource('sedes', TblSedeController::class);
    Route::apiResource('cargos', TblCargoController::class);
    Route::apiResource('usuario-empresa-sede-cargos', TblUsuarioEmpresaSedeCargoController::class);
    Route::apiResource('tipo-solicitud', TblTipoSolicitudController::class);
    Route::apiResource('solicitudes', TblSolicitudController::class);
    Route::apiResource('detalle-solicitud-empleado', TblDetalleSolicitudEmpleadoController::class);
    Route::apiResource('elementos', TblElementoController::class);
    Route::apiResource('talla-elemento', TblTallaElementoController::class);
    Route::apiResource('detalle-solicitud-elemento', TblDetalleSolicitudElementoController::class);

    // Rutas auxiliares
    Route::get('/generar-numero-solicitud', [TblSolicitudController::class, 'generarNumeroSolicitud']);
    Route::middleware('auth:sanctum')->get('/cargos-por-empresa-sede', [TblUsuarioEmpresaSedeController::class, 'getCargosPorEmpresaYSede']);
    Route::get('/mis-empresas-sedes', [TblUsuarioEmpresaSedeController::class, 'getEmpresasYSedes']);
    Route::get('/tipo-solicitud', [TblTipoSolicitudController::class, 'getTiposSolicitud']);

});
