<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\TblUsuarioSistema;

class ProbarTokenUsuario extends Command
{
    protected $signature = 'probar:token-usuario {usuario}';
    protected $description = 'Generar token de prueba para un usuario';

    public function handle()
    {
        $nombreUsuario = $this->argument('usuario');
        
        $this->info("🔍 Generando token para usuario: {$nombreUsuario}");
        
        // Buscar el usuario usando el modelo
        $usuario = TblUsuarioSistema::where('NombreUsuario', $nombreUsuario)->first();
            
        if (!$usuario) {
            $this->error("❌ Usuario {$nombreUsuario} no encontrado");
            return;
        }
        
        $this->info("✅ Usuario encontrado: {$usuario->NombreUsuario} (ID: {$usuario->idUsuario})");
        
        // Crear un token de prueba
        $token = $usuario->createToken('test-token')->plainTextToken;
        
        $this->info("🔑 Token generado:");
        $this->line($token);
        $this->line("");
        $this->info("🧪 Para probar en Postman o curl:");
        $this->line("curl -H \"Authorization: Bearer {$token}\" http://localhost:8000/api/mis-empresas-sedes");
        $this->line("");
        $this->info("💡 También puedes usar este token en el navegador:");
        $this->line("localStorage.setItem('access_token', '{$token}')");
    }
}
