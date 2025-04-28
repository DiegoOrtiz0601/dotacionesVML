<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSistemaSeeder extends Seeder
{
    public function run()
    {
        DB::table('tbl_usuarios_sistema')->insert([
            'NombreUsuario' => 'admin',
            'PasswordUsuario' => Hash::make('123456'), // Encripta la contraseña
            'RolUsuario' => 'usuario',
            'EstadoUsuario' => 1,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
