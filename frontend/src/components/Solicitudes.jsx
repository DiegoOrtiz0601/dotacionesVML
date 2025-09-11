import React, { useEffect, useState } from 'react'
import api from '../api/axios'

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const response = await api.get('/solicitudes')
        setSolicitudes(response.data)
      } catch (error) {
        console.error('Error cargando solicitudes:', error)
      }
    }

    obtenerSolicitudes()
  }, [])

  return (
    <div className="p-6 animate-fadeInSlow">
      <h1 className="text-3xl font-bold text-primario mb-6">
        Solicitudes de Dotación
      </h1>

      <div className="mb-4">
        <button className="bg-secundario hover:bg-hover text-white px-4 py-2 rounded-lg shadow-sm transition duration-300">
          ➕ Nueva Solicitud
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-primario text-white">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-left">Sede</th>
              <th className="px-4 py-2 text-left">Área</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {solicitudes.map((s, index) => (
              <tr key={s.id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{s.empresa}</td>
                <td className="px-4 py-2">{s.sede}</td>
                <td className="px-4 py-2">{s.area}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded
                    ${s.estado === 'Aprobada'
                      ? 'bg-green-100 text-green-800'
                      : s.estado === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {s.estado}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-sm text-blue-600 hover:underline">Ver</button>
                  <button className="text-sm text-yellow-600 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
            {solicitudes.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-400">
                  No hay solicitudes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Solicitudes
