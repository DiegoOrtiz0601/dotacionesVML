<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerificarTablaAsignaciones extends Command
{
    protected $signature = 'verificar:asignaciones';
    protected $description = 'Verificar el estado de la tabla tbl_usuario_empresa_sede_cargos';

    public function handle()
    {
        $this->info('🔍 Verificando tabla tbl_usuario_empresa_sede_cargos...');
        
        // Verificar si la tabla existe
        if (!DB::getSchemaBuilder()->hasTable('tbl_usuario_empresa_sede_cargos')) {
            $this->error('❌ La tabla tbl_usuario_empresa_sede_cargos no existe');
            return;
        }
        
        // Contar registros
        $totalRegistros = DB::table('tbl_usuario_empresa_sede_cargos')->count();
        $this->info("📊 Total de registros: {$totalRegistros}");
        
        if ($totalRegistros > 0) {
            // Mostrar algunos registros de ejemplo
            $registros = DB::table('tbl_usuario_empresa_sede_cargos')
                ->join('tbl_usuarios_sistema', 'tbl_usuario_empresa_sede_cargos.IdUsuario', '=', 'tbl_usuarios_sistema.idUsuario')
                ->join('tbl_empresa', 'tbl_usuario_empresa_sede_cargos.IdEmpresa', '=', 'tbl_empresa.IdEmpresa')
                ->join('tbl_sedes', 'tbl_usuario_empresa_sede_cargos.IdSede', '=', 'tbl_sedes.IdSede')
                ->select(
                    'tbl_usuario_empresa_sede_cargos.*',
                    'tbl_usuarios_sistema.NombreUsuario',
                    'tbl_empresa.NombreEmpresa',
                    'tbl_sedes.NombreSede'
                )
                ->limit(5)
                ->get();
                
            $this->info('📋 Primeros 5 registros:');
            $this->table(
                ['ID', 'Usuario', 'Empresa', 'Sede', 'Creado'],
                $registros->map(function($reg) {
                    return [
                        $reg->IdUsuarioEmpresa,
                        $reg->NombreUsuario,
                        $reg->NombreEmpresa,
                        $reg->NombreSede,
                        $reg->created_at
                    ];
                })
            );
        } else {
            $this->warn('⚠️ No hay registros en la tabla');
        }
        
        // Verificar usuario específico ksilva
        $this->info('🔍 Verificando usuario ksilva...');
        $usuarioKsilva = DB::table('tbl_usuarios_sistema')
            ->where('NombreUsuario', 'ksilva')
            ->first();
            
        if ($usuarioKsilva) {
            $this->info("✅ Usuario ksilva encontrado: {$usuarioKsilva->NombreUsuario} (ID: {$usuarioKsilva->idUsuario})");
            
            $asignacionesKsilva = DB::table('tbl_usuario_empresa_sede_cargos')
                ->where('IdUsuario', $usuarioKsilva->idUsuario)
                ->count();
                
            $this->info("📊 Asignaciones para ksilva: {$asignacionesKsilva}");
            
            if ($asignacionesKsilva > 0) {
                $asignacionesDetalle = DB::table('tbl_usuario_empresa_sede_cargos as uec')
                    ->join('tbl_empresa as emp', 'uec.IdEmpresa', '=', 'emp.IdEmpresa')
                    ->join('tbl_sedes as sed', 'uec.IdSede', '=', 'sed.IdSede')
                    ->where('uec.IdUsuario', $usuarioKsilva->idUsuario)
                    ->select('emp.NombreEmpresa', 'sed.NombreSede')
                    ->get();
                    
                $this->info('📋 Asignaciones de ksilva:');
                foreach ($asignacionesDetalle as $asig) {
                    $this->line("  - {$asig->NombreEmpresa} -> {$asig->NombreSede}");
                }
            } else {
                $this->warn('⚠️ El usuario ksilva no tiene asignaciones');
            }
        } else {
            $this->error('❌ Usuario ksilva no encontrado');
        }
        
        // Verificar estadísticas generales
        $usuarios = DB::table('tbl_usuarios_sistema')->count();
        $this->info("👥 Total usuarios en el sistema: {$usuarios}");
        
        $empresas = DB::table('tbl_empresa')->count();
        $this->info("🏢 Total empresas en el sistema: {$empresas}");
        
        $sedes = DB::table('tbl_sedes')->count();
        $this->info("🏢 Total sedes en el sistema: {$sedes}");
    }
}
