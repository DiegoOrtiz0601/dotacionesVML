import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import ResumenSolicitud from '../wizardSolicitud/ResumenSolicitud'

const MisSolicitudes = () => {
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [sedeSeleccionada, setSedeSeleccionada] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioRes, empresaSedesRes] = await Promise.all([
          api.get('/usuario-autenticado'),
          api.get('/mis-empresas-sedes')
        ])
        setUsuario(usuarioRes.data)
        setEmpresas(empresaSedesRes.data.empresas)
        setSedes(empresaSedesRes.data.sedes)
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
      }
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    if (empresaSeleccionada && sedeSeleccionada) {
      cargarSolicitudes()
    }
  }, [empresaSeleccionada, sedeSeleccionada])

  const cargarSolicitudes = async () => {
    setCargandoSolicitudes(true)
    try {
      const response = await api.get('/mis-solicitudes', {
        params: {
          idEmpresa: empresaSeleccionada,
          idSede: sedeSeleccionada
        }
      })
      setSolicitudes(response.data)
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
    } finally {
      setCargandoSolicitudes(false)
    }
  }

  const verDetalle = (solicitud) => {
    setSolicitudSeleccionada(solicitud)
    setModalVisible(true)
  }

  const cerrarModal = () => {
    setModalVisible(false)
    setSolicitudSeleccionada(null)
  }

  const sedesFiltradas = useMemo(() => {
    return sedes.filter(s => s.IdEmpresa == empresaSeleccionada)
  }, [sedes, empresaSeleccionada])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📄 Mis Solicitudes</h2>

      <div className="flex gap-4 mb-4">
        <select
          className="border px-3 py-2 rounded w-1/3"
          value={empresaSeleccionada}
          onChange={e => setEmpresaSeleccionada(e.target.value)}
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
        >
          <option value="">Seleccione sede</option>
          {sedesFiltradas.map(s => (
            <option key={s.IdSede} value={s.IdSede}>{s.NombreSede}</option>
          ))}
        </select>
      </div>

      <table className="min-w-full border rounded shadow text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left"># Solicitud</th>
            <th className="p-2 text-left">Creación</th>
            <th className="p-2 text-left">Actualización</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {cargandoSolicitudes ? (
            <tr><td colSpan="5" className="p-4 text-center">Cargando solicitudes...</td></tr>
          ) : solicitudes.length === 0 ? (
            <tr><td colSpan="5" className="p-4 text-center text-gray-400">No hay resultados</td></tr>
          ) : (
            solicitudes.map(sol => (
              <tr key={sol.idSolicitud} className="border-t hover:bg-gray-50">
                <td className="p-2">DOT-{String(sol.idSolicitud).padStart(4, '0')}</td>
                <td className="p-2">{new Date(sol.created_at).toLocaleDateString()}</td>
                <td className="p-2">{new Date(sol.updated_at).toLocaleDateString()}</td>
                <td className="p-2">{sol.estadoSolicitud}</td>
                <td className="p-2">
                  <button
                    onClick={() => verDetalle(sol)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalVisible && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-4xl relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
            >
              ✖
            </button>
            <ResumenSolicitud
              numeroSolicitud={`DOT-${String(solicitudSeleccionada.idSolicitud).padStart(4, '0')}`}
              empresa={solicitudSeleccionada.empresa}
              sede={solicitudSeleccionada.sede}
              usuario={usuario}
              resumenSolicitud={solicitudSeleccionada.detalle || []}
              onEnviarSolicitudFinal={() => {}}
              onModificarEmpleado={() => {}}
              onEliminarEmpleado={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MisSolicitudes
