import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { csrf } from '../api/csrf'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await csrf() // Requerido si usas Sanctum (aunque no obligatorio con token puro)

      const response = await api.post('/login', {
        NombreUsuario: usuario,
        PasswordUsuario: contrasena,
      })

      const user = response.data.user
      const token = response.data.access_token

      console.log('🔐 Usuario autenticado:', user)

      // Guardar en localStorage
      localStorage.setItem('access_token', token)
      localStorage.setItem('usuario', JSON.stringify(user))

      // Redirección por rol
      const rol = user.RolUsuario.toLowerCase()
      if (rol === 'usuario') {
        navigate('/usuario/nueva-solicitud')
      } else if (rol === 'talento_humano') {
        navigate('/talento/dashboard')
      } else {
        navigate('/login')
      }

    } catch (err) {
      console.error('❌ Error al iniciar sesión:', err)
      setError('❌ Credenciales inválidas o error de conexión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondo-login.png"
          alt="Fondo"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="relative z-10 bg-white bg-opacity-90 rounded-xl shadow-2xl px-8 py-10 w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-6 animate-fadeIn">
          <img src="/images/logo.gif" alt="Logo VML" className="w-52 mb-2" />
          <p className="text-lg font-semibold text-primario tracking-wide shadow-sm">
            Sistema de Dotaciones
          </p>
        </div>

        <h2 className="text-2xl font-bold text-center text-primario mb-6">
          Iniciar Sesión
        </h2>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-secundario hover:bg-hover text-white font-semibold py-2 rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          Entrar
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

export default Login
