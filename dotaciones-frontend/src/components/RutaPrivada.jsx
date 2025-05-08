import { Navigate } from 'react-router-dom'

function RutaPrivada({ children, rolPermitido = 'usuario' }) {
  const token = localStorage.getItem('access_token');

  let usuario = null;
  try {
    const raw = localStorage.getItem('usuario');
    usuario = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Error al parsear usuario:", err);
  }

  // Si no hay token o usuario, redirige
  if (!token || !usuario) {
    return <Navigate to="/login" replace />
  }

  // Valida rol con la propiedad correcta
  if (usuario.RolUsuario !== rolPermitido) {
    return <Navigate to="/login" replace />
  }

  return children;
}


export default RutaPrivada
