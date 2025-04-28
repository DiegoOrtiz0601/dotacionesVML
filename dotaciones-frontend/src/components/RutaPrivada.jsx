import { Navigate } from 'react-router-dom'

function RutaPrivada({ children, rolPermitido = 'usuario' }) {
  const token = localStorage.getItem('access_token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  // Si no hay token o no hay usuario → redirige al login
  if (!token || !usuario) {
    return <Navigate to="/login" replace />
  }

  // Si el rol no es permitido → también redirige al login o a error 403
  if (usuario.rol !== rolPermitido) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RutaPrivada
