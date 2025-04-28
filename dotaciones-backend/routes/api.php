<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CiudadController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\SedeController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\SolicitanteController;
use App\Http\Controllers\Api\SolicitudDotacionController;
use App\Http\Controllers\Api\DetalleSolicitudDotacionController;
use App\Http\Controllers\Api\DocumentoEntregaController;
use App\Http\Controllers\Api\TallaController;
use App\Http\Controllers\Api\ElementoDotacionController;
use App\Http\Controllers\Api\TipoSolicitudController;


Route::apiResource('ciudades', CiudadController::class);
Route::apiResource('empresas', EmpresaController::class);
Route::apiResource('sedes', SedeController::class);
Route::apiResource('areas', AreaController::class);
Route::apiResource('solicitantes', SolicitanteController::class);
Route::apiResource('solicitudes', SolicitudDotacionController::class);
Route::apiResource('detalles', DetalleSolicitudDotacionController::class);
Route::apiResource('documentos', DocumentoEntregaController::class);
Route::get('tallas', [TallaController::class, 'index']);
Route::get('elementos', [ElementoDotacionController::class, 'index']);
Route::get('tipos-solicitud', [TipoSolicitudController::class, 'index']);

// Sedes por empresa
Route::get('empresas/{empresa}/sedes', [App\Http\Controllers\Api\SedeController::class, 'porEmpresa']);

// Áreas por sede
Route::get('sedes/{sede}/areas', [App\Http\Controllers\Api\AreaController::class, 'porSede']);

// Tallas por elemento
Route::get('elementos/{elemento}/tallas', [App\Http\Controllers\Api\ElementoDotacionController::class, 'tallas']);

// Solicitantes por sede
Route::get('sedes/{sede}/solicitantes', [App\Http\Controllers\Api\SolicitanteController::class, 'porSede']);

// Detalles por solicitud
Route::get('solicitudes/{id}/detalles', [App\Http\Controllers\Api\DetalleSolicitudDotacionController::class, 'porSolicitud']);

// Documentos por solicitud
Route::get('solicitudes/{id}/documentos', [App\Http\Controllers\Api\DocumentoEntregaController::class, 'porSolicitud']);
//login
use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/cambiar-contrasena', [App\Http\Controllers\Api\AuthController::class, 'cambiarContrasena']);
});