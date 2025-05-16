import React from 'react';

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const nombre = usuario?.usuario || 'Usuario';
  const rol = usuario?.RolUsuario;

  let contenido;

  if (rol === 'usuario') {
    contenido = (
      <>
        <h1 className="text-4xl font-bold text-primario mb-4">
          ¡Bienvenido(a), {nombre}!
        </h1>
        <p className="text-lg text-gray-600">
          Has ingresado correctamente al <strong>Sistema de Dotaciones</strong>.
          <br />Puedes empezar creando una nueva solicitud desde el menú lateral.
        </p>
      </>
    );
  } else if (rol === 'talento_humano') {
    contenido = (
      <>
        <h1 className="text-4xl font-bold text-primario mb-4">
          Panel de Talento Humano
        </h1>
        <p className="text-lg text-gray-600">
          Bienvenido(a) {nombre}, desde aquí puedes gestionar las solicitudes de dotación.
          <br />Selecciona una opción en el menú para empezar.
        </p>
      </>
    );
  } else {
    contenido = (
      <>
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso no reconocido</h1>
        <p className="text-lg text-gray-600">
          Tu rol no tiene una vista de Dashboard asignada. Contacta al administrador del sistema.
        </p>
      </>
    );
  }

  return (
    <div className="flex items-center justify-center h-[80vh] text-center animate-fadeInSlow">
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-10 max-w-2xl w-full">
        {contenido}
      </div>
    </div>
  );
}

export default Dashboard;
