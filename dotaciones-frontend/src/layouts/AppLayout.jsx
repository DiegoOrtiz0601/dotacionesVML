import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="flex h-screen">
      {/* Menú lateral izquierdo */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 ml-64 bg-gray-100">
        {/* Barra superior */}
        <Navbar />

        {/* Contenido de las rutas hijas */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
