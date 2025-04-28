import { useState, useEffect } from 'react';
import api from '../api/axios';

function Configuracion() {
  const [usuario, setUsuario] = useState({});
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmacionContrasena, setConfirmacionContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(user || {});
  }, []);

  const handleActualizarContrasena = async () => {
    try {
      const response = await api.post('/cambiar-contrasena', {
        nueva_contrasena: nuevaContrasena,
        nueva_contrasena_confirmation: confirmacionContrasena
      });
      setMensaje('✅ Contraseña actualizada correctamente');
      setNuevaContrasena('');
      setConfirmacionContrasena('');
    } catch (error) {
      setMensaje('❌ Error al actualizar contraseña');
      console.error(error);
    }
  };

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      setImagen(e.target.files[0]);
    }
  };

  const handleGuardarImagen = () => {
    alert('Funcionalidad para guardar imagen aún no implementada.');
  };

  return (
    <div>
      <h2>Configuración de Usuario</h2>

      <div>
        <p><strong>Usuario:</strong> {usuario.usuario}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
      </div>

      <hr />

      <div>
        <h4>Cambiar contraseña</h4>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmacionContrasena}
          onChange={(e) => setConfirmacionContrasena(e.target.value)}
        />
        <br />
        <button onClick={handleActualizarContrasena}>Actualizar</button>
        {mensaje && <p>{mensaje}</p>}
      </div>

      <hr />

      <div>
        <h4>Foto de perfil</h4>
        <input type="file" onChange={handleImagenChange} />
        <button onClick={handleGuardarImagen}>Guardar imagen</button>
      </div>
    </div>
  );
}

export default Configuracion;