function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <div className="flex items-center justify-center h-[80vh] text-center animate-fadeInSlow w-full">
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-10 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-primario mb-4">
          ¡Bienvenido(a), {usuario?.NombreUsuario || 'Usuario'}!
        </h1>
        <p className="text-lg text-gray-600">
          Has ingresado correctamente al <strong>Sistema de Dotaciones</strong>.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;


