<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblUsuariosSistemaTable extends Migration
{
    public function up()
    {
        Schema::create('tbl_usuarios_sistema', function (Blueprint $table) {
            $table->id('idUsuario');
            $table->string('NombreUsuario');
            $table->string('PasswordUsuario');
            $table->string('RolUsuario');
            $table->boolean('EstadoUsuario')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_usuarios_sistema');
    }
}