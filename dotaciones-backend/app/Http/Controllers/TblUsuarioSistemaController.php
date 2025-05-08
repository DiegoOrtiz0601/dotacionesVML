<?php

namespace App\Http\Controllers;

use App\Models\TblUsuarioSistema;
use Illuminate\Http\Request;

class TblUsuarioSistemaController extends Controller
{
    public function index()
    {
        return response()->json(TblUsuarioSistema::all());
    }

    public function store(Request $request)
{
    $data = $request->all();
    $data['PasswordUsuario'] = bcrypt($data['PasswordUsuario']); // <-- encriptar antes de guardar

    $registro = TblUsuarioSistema::create($data);
    return response()->json($registro, 201);
}


    public function show($id)
    {
        return response()->json(TblUsuarioSistema::findOrFail($id));
    }

    public function update(Request $request, $id)
{
    $registro = TblUsuarioSistema::findOrFail($id);

    $data = $request->all();
    if (isset($data['PasswordUsuario'])) {
        $data['PasswordUsuario'] = bcrypt($data['PasswordUsuario']); // ¡Aquí también!
    }

    $registro->update($data);
    return response()->json($registro);
}


    public function destroy($id)
    {
        $registro = TblUsuarioSistema::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
