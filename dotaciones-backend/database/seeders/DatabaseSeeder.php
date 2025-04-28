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
        // Ejecuta el seeder del usuario del sistema
        $this->call([
            UsuarioSistemaSeeder::class,
        ]);
    }
}
