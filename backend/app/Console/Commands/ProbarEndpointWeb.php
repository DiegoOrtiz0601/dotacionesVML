<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProbarEndpointWeb extends Command
{
    protected $signature = 'probar:endpoint-web {usuario}';
    protected $description = 'Generar URL para probar el endpoint desde el navegador';

    public function handle()
    {
        $nombreUsuario = $this->argument('usuario');
        
        $this->info("🔍 Generando URL de prueba para usuario: {$nombreUsuario}");
        
        // Buscar el usuario
        $usuario = DB::table('tbl_usuarios_sistema')
            ->where('NombreUsuario', $nombreUsuario)
            ->first();
            
        if (!$usuario) {
            $this->error("❌ Usuario {$nombreUsuario} no encontrado");
            return;
        }
        
        $this->info("✅ Usuario encontrado: {$usuario->NombreUsuario} (ID: {$usuario->idUsuario})");
        
        // Generar token de prueba
        $token = $usuario->idUsuario . '_' . time();
        
        $this->info("🔗 URL para probar en el navegador:");
        $this->line("http://localhost:8000/api/mis-empresas-sedes");
        $this->line("");
        $this->info("📋 Headers necesarios:");
        $this->line("Authorization: Bearer [TOKEN_DEL_USUARIO]");
        $this->line("Accept: application/json");
        $this->line("Content-Type: application/json");
        $this->line("");
        $this->info("💡 Instrucciones:");
        $this->line("1. Abre las herramientas de desarrollador (F12)");
        $this->line("2. Ve a la pestaña 'Network'");
        $this->line("3. Recarga la página de solicitud");
        $this->line("4. Busca la llamada a 'mis-empresas-sedes'");
        $this->line("5. Revisa la respuesta y el status code");
    }
}
