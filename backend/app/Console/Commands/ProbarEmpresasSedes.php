<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\TblUsuarioEmpresaSedeController;
use Illuminate\Http\Request;

class ProbarEmpresasSedes extends Command
{
    protected $signature = 'probar:empresas-sedes {usuario}';
    protected $description = 'Probar el endpoint mis-empresas-sedes para un usuario específico';

    public function handle()
    {
        $nombreUsuario = $this->argument('usuario');
        
        $this->info("🔍 Probando endpoint mis-empresas-sedes para usuario: {$nombreUsuario}");
        
        // Buscar el usuario
        $usuario = DB::table('tbl_usuarios_sistema')
            ->where('NombreUsuario', $nombreUsuario)
            ->first();
            
        if (!$usuario) {
            $this->error("❌ Usuario {$nombreUsuario} no encontrado");
            return;
        }
        
        $this->info("✅ Usuario encontrado: {$usuario->NombreUsuario} (ID: {$usuario->idUsuario})");
        
        // Simular request con el usuario autenticado
        $request = new Request();
        $request->setUserResolver(function () use ($usuario) {
            return (object) $usuario;
        });
        
        // Crear instancia del controlador y llamar al método
        $controller = new TblUsuarioEmpresaSedeController();
        $response = $controller->getEmpresasYSedes($request);
        
        $this->info("📊 Respuesta del endpoint:");
        $this->line(json_encode($response->getData(), JSON_PRETTY_PRINT));
        
        // Verificar asignaciones directamente
        $asignaciones = DB::table('tbl_usuario_empresa_sede_cargos as uec')
            ->join('tbl_empresa as emp', 'uec.IdEmpresa', '=', 'emp.IdEmpresa')
            ->join('tbl_sedes as sed', 'uec.IdSede', '=', 'sed.IdSede')
            ->where('uec.IdUsuario', $usuario->idUsuario)
            ->select(
                'emp.IdEmpresa',
                'emp.NombreEmpresa',
                'emp.ruta_logo',
                'sed.IdSede',
                'sed.NombreSede'
            )
            ->get();
            
        $this->info("🔍 Asignaciones encontradas en BD: " . $asignaciones->count());
        foreach ($asignaciones as $asignacion) {
            $this->line("- Empresa: {$asignacion->NombreEmpresa} (ID: {$asignacion->IdEmpresa})");
            $this->line("  Sede: {$asignacion->NombreSede} (ID: {$asignacion->IdSede})");
        }
    }
}
