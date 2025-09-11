<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\TblUsuarioEmpresaSedeController;
use Illuminate\Http\Request;

class ProbarEndpointEmpresas extends Command
{
    protected $signature = 'probar:endpoint-empresas {usuario}';
    protected $description = 'Probar el endpoint de empresas para un usuario específico';

    public function handle()
    {
        $nombreUsuario = $this->argument('usuario');
        
        $this->info("🔍 Probando endpoint para usuario: {$nombreUsuario}");
        
        // Buscar el usuario
        $usuario = DB::table('tbl_usuarios_sistema')
            ->where('NombreUsuario', $nombreUsuario)
            ->first();
            
        if (!$usuario) {
            $this->error("❌ Usuario {$nombreUsuario} no encontrado");
            return;
        }
        
        $this->info("✅ Usuario encontrado: {$usuario->NombreUsuario} (ID: {$usuario->idUsuario})");
        
        // Simular una request autenticada
        $request = new Request();
        $request->setUserResolver(function () use ($usuario) {
            return (object) [
                'idUsuario' => $usuario->idUsuario,
                'NombreCompleto' => $usuario->NombresUsuarioAutorizado ?? $usuario->NombreUsuario,
                'email' => $usuario->CorreoSolicitante ?? '',
                'documento' => $usuario->DocumentoUsuario ?? ''
            ];
        });
        
        // Llamar al controlador
        $controller = new TblUsuarioEmpresaSedeController();
        $response = $controller->getEmpresasYSedes($request);
        
        $data = $response->getData(true);
        
        $this->info("📊 Respuesta del endpoint:");
        $this->line("Empresas: " . count($data['empresas'] ?? []));
        $this->line("Sedes: " . count($data['sedes'] ?? []));
        
        if (isset($data['message'])) {
            $this->warn("⚠️ Mensaje: " . $data['message']);
        }
        
        if (!empty($data['empresas'])) {
            $this->info("📋 Empresas disponibles:");
            foreach ($data['empresas'] as $empresa) {
                $this->line("  - {$empresa['NombreEmpresa']} (ID: {$empresa['IdEmpresa']})");
            }
        }
        
        if (!empty($data['sedes'])) {
            $this->info("📋 Sedes disponibles:");
            foreach ($data['sedes'] as $sede) {
                $this->line("  - {$sede['NombreSede']} (ID: {$sede['IdSede']}) - Empresa: {$sede['IdEmpresa']}");
            }
        }
    }
}
