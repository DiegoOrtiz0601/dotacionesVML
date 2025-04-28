import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const usuario = JSON.parse(localStorage.getItem('usuario')) || {}
  const nombre = usuario?.usuario || 'Usuario'

  const toggleDropdown = () => setOpen(!open)
  const cerrarSesion = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', closeOnClickOutside)
    return () => document.removeEventListener('mousedown', closeOnClickOutside)
  }, [])

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-end items-center relative z-20">
      <div className="relative" ref={dropdownRef}>
        <button onClick={toggleDropdown} className="flex items-center gap-2">
          <img
            src={usuario?.foto || '/images/default-avatar.png'} // puedes cambiar esto por un campo real
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <span className="font-semibold text-sm hidden sm:block">{nombre}</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden">
            <button
              onClick={() => navigate('/configuracion')}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Configurar Perfil
            </button>
            <button
              onClick={() => navigate('/configuracion#password')}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Cambiar Contraseña
            </button>
            <hr />
            <button
              onClick={cerrarSesion}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
