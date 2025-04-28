import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario || usuario.RolUsuario !== 'usuario') {
    return null;
  }

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/nueva-solicitud', label: 'Crear Solicitud', icon: '📝' },
    { path: '/solicitudes', label: 'Mis Solicitudes', icon: '📄' },
    { path: '/entregas', label: 'Entrega de Dotación', icon: '🎯' },
    { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-primario text-white min-h-screen fixed p-6 shadow-xl">
      <div className="text-2xl font-bold mb-10 text-center tracking-wide">🧥 Dotaciones</div>

      <nav className="flex flex-col gap-3">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium text-sm transition
              ${location.pathname === link.path ? 'bg-hover text-white' : 'hover:bg-gray-700'}`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
