import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  // 🔐 Validación inicial: si no hay usuario autenticado, no mostrar el sidebar
  if (!usuario || !usuario.RolUsuario) {
    return null
  }

  const links = []

  // 🧑 Menú para rol 'usuario'
  if (usuario.RolUsuario === 'usuario') {
    links.push(
      {
        path: '/usuario/dashboard',
        label: 'Dashboard',
        icon: '📊'
      },
      {
        path: '/usuario/nueva-solicitud',
        label: 'Crear Solicitud',
        icon: '📝'
      },
      {
        path: '/usuario/solicitudes',
        label: 'Mis Solicitudes',
        icon: '📄'
      },
      {
        path: '/usuario/entregas',
        label: 'Entrega de Dotación',
        icon: '🎯'
      },
      {
        path: '/usuario/configuracion',
        label: 'Configuración',
        icon: '⚙️'
      }
    )
  }

  // 🧑‍💼 Menú para rol 'talento_humano'
  if (usuario.RolUsuario === 'talento_humano') {
    links.push(
      {
        path: '/talento/dashboard',
        label: 'Dashboard',
        icon: '📊'
      },
      {
        path: '/talento/gestionar-solicitudes',
        label: 'Gestionar Solicitudes',
        icon: '✅'
      },
      {
        path: '/talento/historial-solicitudes',
        label: 'Historial',
        icon: '📁'
      },
      {
        path: '/talento/rechazadas',
        label: 'Rechazadas',
        icon: '❌'
      },
      {
        path: '/talento/configuracion',
        label: 'Configuración',
        icon: '⚙️'
      }
    )
  }

  return (
    <aside className="w-64 bg-primario text-white min-h-screen fixed p-6 shadow-xl">
      {/* 🔰 Logo y título */}
      <div className="text-2xl font-bold mb-10 text-center tracking-wide">🧥 Dotaciones</div>

      {/* 🧭 Navegación dinámica según el rol */}
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
  )
}

export default Sidebar
