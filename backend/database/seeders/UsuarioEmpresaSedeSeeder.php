<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UsuarioEmpresaSedeSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener el ID del usuario creado en UsuarioSistemaSeeder
        $usuario = DB::table('tbl_usuarios_sistema')
            ->where('NombreUsuario', 'dortiz')
            ->first();

        if (!$usuario) {
            $this->command->error('❌ Usuario "dortiz" no encontrado. Ejecuta primero UsuarioSistemaSeeder.');
            return;
        }

        // Crear una empresa de prueba si no existe
        $empresa = DB::table('tbl_empresa')->first();
        if (!$empresa) {
            $empresaId = DB::table('tbl_empresa')->insertGetId([
                'NombreEmpresa' => 'Empresa de Prueba',
                'ruta_logo' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        } else {
            $empresaId = $empresa->IdEmpresa;
        }

        // Crear una sede de prueba si no existe
        $sede = DB::table('tbl_sedes')->where('IdEmpresa', $empresaId)->first();
        if (!$sede) {
            $sedeId = DB::table('tbl_sedes')->insertGetId([
                'NombreSede' => 'Sede Principal',
                'IdEmpresa' => $empresaId,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        } else {
            $sedeId = $sede->IdSede;
        }

        // Verificar si ya existe la asignación
        $existeAsignacion = DB::table('tbl_usuario_empresa_sede_cargos')
            ->where('IdUsuario', $usuario->idUsuario)
            ->where('IdEmpresa', $empresaId)
            ->where('IdSede', $sedeId)
            ->exists();

        if (!$existeAsignacion) {
            DB::table('tbl_usuario_empresa_sede_cargos')->insert([
                'IdUsuario' => $usuario->idUsuario,
                'IdEmpresa' => $empresaId,
                'IdSede' => $sedeId,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $this->command->info("✅ Se creó asignación de usuario-empresa-sede");
        } else {
            $this->command->info("ℹ️ La asignación ya existe");
        }
    }
}
