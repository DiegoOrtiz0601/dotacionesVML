<?php 

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use App\Http\Controllers\EntregaPDFController; // ✅ Asegúrate de importar el controlador
use App\Http\Controllers\DocumentoEntregaController;
// ✅ Ruta necesaria para Sanctum: CSRF Cookie
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// 🏠 Página de bienvenida (usada por defecto en Laravel Breeze/Inertia)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 📊 Dashboard (requiere autenticación y verificación de email si está activado)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// 👤 Perfil del usuario (rutas protegidas)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 🛠️ Rutas de autenticación generadas por Breeze/Fortify/etc.
require __DIR__.'/auth.php';

// Prueba PDF
use Barryvdh\DomPDF\Facade\Pdf;

Route::get('/test-pdf', function () {
    $pdf = Pdf::loadView('emails.resumen_solicitud', [
        'solicitud' => (object)[
            'codigoSolicitud' => 'DOT-9999',
            'empresa' => 'Empresa de Ejemplo',
            'sede' => 'Sede Principal',
            'estadoSolicitud' => 'Aprobado',
        ],
        'empleados' => [[
            'nombreEmpleado' => 'Juan Pérez',
            'documentoEmpleado' => '12345678',
            'elementos' => [[
                'nombreElemento' => 'Zapatos de seguridad',
                'talla' => '42',
                'cantidadSolicitada' => 1,
                'cantidad' => 1,
                'observacionElemento' => ''
            ]]
        ]]
    ]);
    return $pdf->download('resumen.pdf');
});

// ✅ Ruta firmada para descarga segura del PDF
Route::get('/descargar-entrega', [EntregaPDFController::class, 'descargarPublico'])->name('descargar.pdf.entrega');
Route::get('/descargar-pdf/{documento}', [DocumentoEntregaController::class, 'descargar']);