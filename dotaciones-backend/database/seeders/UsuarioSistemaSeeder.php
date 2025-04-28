<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\UsuarioSistema;

class UsuarioSistemaSeeder extends Seeder
{
    public function run()
    {
        UsuarioSistema::create([
            'usuario' => 'admin',
            'contrasena' => Hash::make('123456'),
            'rol' => 'admin',
            'estado' => 1,
        ]);
    }
}