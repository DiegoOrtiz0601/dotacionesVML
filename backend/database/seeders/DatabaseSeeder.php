<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ejecuta los seeders del sistema
        $this->call([
            UsuarioSistemaSeeder::class,
            UsuarioEmpresaSedeSeeder::class,
        ]);
    }
}
