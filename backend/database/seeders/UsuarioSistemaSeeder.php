<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UsuarioSistemaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_usuarios_sistema')->insert([
            'NombreUsuario' => 'dortiz',
            'PasswordUsuario' => Hash::make('123456'), // Encriptar la contraseña
            'RolUsuario' => 'Talento_Humano',
            'EstadoUsuario' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'NombresUsuarioAutorizado' => 'Diego Armando Ortiz Mora',
            'DocumentoUsuario' => '80550594',
            'CargoSolicitante' => 'Desarrollo Web',
            'CorreoSolicitante' => 'diego.ortiz@holdingvml.net',
        ]);
    }
}
