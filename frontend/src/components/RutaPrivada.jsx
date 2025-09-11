import { Navigate, Outlet } from 'react-router-dom'

function RutaPrivada({ rolPermitido = 'usuario' }) {
  const token = localStorage.getItem('access_token')
  const storedUser = localStorage.getItem('usuario')

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />
  }

  let usuario = null
  try {
    usuario = JSON.parse(storedUser)
  } catch (err) {
    console.error('❌ Error al parsear usuario:', err)
    return <Navigate to="/login" replace />
  }

  const rolUsuario = (usuario?.RolUsuario || '').toLowerCase()
  const rolesPermitidos = Array.isArray(rolPermitido) ? rolPermitido.map(r => r.toLowerCase()) : [rolPermitido.toLowerCase()]

  if (!rolesPermitidos.includes(rolUsuario)) {
    console.warn(`🚫 Acceso denegado para rol: ${rolUsuario}`)
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RutaPrivada
