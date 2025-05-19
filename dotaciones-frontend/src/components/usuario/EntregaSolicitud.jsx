import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../../api/axios'
import ResumenEntrega from './ResumenEntrega'
import { obtenerEmpresasYSedes } from '../../api/utils'
import { Search, Eye, ArrowLeft } from 'lucide-react'

const EntregaSolicitud = () => {
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [sedeSeleccionada, setSedeSeleccionada] = useState('')
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioRes, empresaSedeRes] = await Promise.all([
          api.get('/usuario-autenticado'),
          obtenerEmpresasYSedes()
        ])
        setUsuario(usuarioRes.data)
        setEmpresas(empresaSedeRes.empresas)
        setSedes(empresaSedeRes.sedes)
      } catch (error) {
        console.error('❌ Error cargando usuario o empresas:', error)
      }
    }
    cargarDatos()
  }, [])

  const cargarSolicitudes = async () => {
    if (!empresaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta seleccionar empresa',
        text: 'Debe seleccionar al menos una empresa para continuar.'
      })
      return
    }

    try {
      const response = await api.get('/solicitudes-entrega', {
        params: {
          idEmpresa: empresaSeleccionada,
          idSede: sedeSeleccionada
        }
      })

      if (response.data.length === 0) {
        const empresaNombre = empresas.find(emp => emp.IdEmpresa == empresaSeleccionada)?.NombreEmpresa || 'la empresa'
        const sedeNombre = sedes.find(s => s.IdSede == sedeSeleccionada)?.NombreSede || 'todas las sedes'

        Swal.fire({
          icon: 'info',
          title: 'Sin solicitudes',
          text: `No hay solicitudes pendientes para ${empresaNombre} en ${sedeNombre}.`
        })
      }

      setSolicitudes(response.data)
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
    }
  }

  const manejarCambioEmpresa = (e) => {
    const nuevaEmpresa = e.target.value
    setEmpresaSeleccionada(nuevaEmpresa)
    setSedeSeleccionada('')
  }

  return (
    <div className="p-6">
      {!solicitudSeleccionada ? (
        <>
          <h2 className="text-2xl font-bold mb-6">📦 Entrega de Solicitudes</h2>

          <div className="flex gap-4 mb-6">
            <select
              className="border px-3 py-2 rounded w-1/3"
              value={empresaSeleccionada}
              onChange={manejarCambioEmpresa}
            >
              <option value="">Seleccione empresa</option>
              {empresas.map(emp => (
                <option key={emp.IdEmpresa} value={emp.IdEmpresa}>{emp.NombreEmpresa}</option>
              ))}
            </select>

            <select
              className="border px-3 py-2 rounded w-1/3"
              value={sedeSeleccionada}
              onChange={e => setSedeSeleccionada(e.target.value)}
              disabled={!empresaSeleccionada}
            >
              <option value="">Seleccione sede</option>
              {sedes
                .filter(s => s.IdEmpresa == empresaSeleccionada)
                .map(s => (
                  <option key={s.IdSede} value={s.IdSede}>{s.NombreSede}</option>
                ))}
            </select>

            <button
              onClick={cargarSolicitudes}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>

          <table className="min-w-full border rounded shadow text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Empresa</th>
                <th className="p-2 text-left">Sede</th>
                <th className="p-2 text-left">Aprobación</th>
                <th className="p-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(sol => (
                <tr key={sol.id} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-2">{sol.codigoSolicitud}</td>
                  <td className="p-2">{sol.empresa}</td>
                  <td className="p-2">{sol.sede}</td>
                  <td className="p-2">{new Date(sol.fecha_aprobacion).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setSolicitudSeleccionada(sol)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {solicitudes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">No hay resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <ResumenEntrega
            numeroSolicitud={solicitudSeleccionada.codigoSolicitud}
            empresa={solicitudSeleccionada.empresa}
            sede={solicitudSeleccionada.sede}
            usuario={usuario}
            logo={solicitudSeleccionada.ruta_logo}
            nit={solicitudSeleccionada.NitEmpresa}
            ResumenEntrega={solicitudSeleccionada.empleados ?? []}
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => setSolicitudSeleccionada(null)}
              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver otras solicitudes
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default EntregaSolicitud
