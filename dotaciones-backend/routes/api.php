<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TblUsuarioSistemaController;
use App\Http\Controllers\Api\TblCiudadController;
use App\Http\Controllers\Api\TblEmpresaController;
use App\Http\Controllers\Api\TblSedeController;
use App\Http\Controllers\Api\TblCargoController;
use App\Http\Controllers\Api\TblUsuarioEmpresaSedeCargoController;
use App\Http\Controllers\Api\TblTipoSolicitudController;
use App\Http\Controllers\Api\TblSolicitudController;
use App\Http\Controllers\Api\TblDetalleSolicitudEmpleadoController;
use App\Http\Controllers\Api\TblElementoController;
use App\Http\Controllers\Api\TblTallaElementoController;
use App\Http\Controllers\Api\TblDetalleSolicitudElementoController;
use App\Http\Controllers\AuthController;

// 👇 Login debe quedar totalmente fuera, sin protección
Route::post('/login', [AuthController::class, 'login']);

// 👇 Todas estas rutas SÍ protegidas por auth:sanctum
Route::middleware('auth:sanctum')->group(function () {

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

    // 👇 Logout ya está dentro del grupo protegido
    Route::post('/logout', [AuthController::class, 'logout']);
});
