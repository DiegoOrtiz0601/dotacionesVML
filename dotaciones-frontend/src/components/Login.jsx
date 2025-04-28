
import { useState } from 'react'
import api from '../api/axios'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { 
        NombreUsuario: usuario, 
        PasswordUsuario: contrasena 
      });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('❌ Credenciales inválidas o error de conexión');
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">

      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondo-login.png"
          alt="Fondo"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Card de login */}
      <div className="relative z-10 bg-white bg-opacity-90 rounded-xl shadow-2xl px-8 py-10 w-full max-w-md">
      <div className="flex flex-col items-center justify-center text-center mb-6 animate-fadeIn">
  <img
    src="/images/logo.gif"
    alt="Logo VML"
    className="w-52 mb-2"
  />
  <p className="text-lg font-semibold text-primario tracking-wide shadow-sm">
    Sistema de Dotaciones
  </p>
</div>


        <h2 className="text-2xl font-bold text-center text-primario mb-6">Iniciar Sesión</h2>

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

        {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  )
}

export default Login
