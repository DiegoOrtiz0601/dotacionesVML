import { useEffect, useState } from 'react'
import api from '../api/axios'

function NuevaSolicitud() {
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [cargos, setCargos] = useState([])
  const [tiposSolicitud, setTiposSolicitud] = useState([])

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [sedeSeleccionada, setSedeSeleccionada] = useState('')
  const [cargoSeleccionado, setCargoSeleccionado] = useState('')
  const [tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado] = useState('')

  const [numeroSolicitud, setNumeroSolicitud] = useState('')
  const [nombresEmpleado, setNombresEmpleado] = useState('')
  const [documentoEmpleado, setDocumentoEmpleado] = useState('')

  // Cargar empresas y sedes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await api.get('/mis-empresas-sedes')
        setEmpresas(response.data.empresas)
        setSedes(response.data.sedes)
      } catch (error) {
        console.error('Error cargando empresas y sedes:', error)
      }
    }

    cargarDatos()
  }, [])

  // Filtrar sedes cuando cambia empresa
  const sedesFiltradas = sedes.filter(s => s.IdEmpresa == empresaSeleccionada)

  // Cargar cargos cuando hay empresa + sede
  useEffect(() => {
    const cargarCargos = async () => {
      if (empresaSeleccionada && sedeSeleccionada) {
        try {
          const response = await api.get('/cargos-por-empresa-sede', {
            params: {
              idEmpresa: empresaSeleccionada,
              idSede: sedeSeleccionada
            }
          })
          setCargos(response.data)
        } catch (error) {
          console.error('Error cargando cargos:', error)
        }
      }
    }

    cargarCargos()
  }, [empresaSeleccionada, sedeSeleccionada])

  // Cargar tipos de solicitud (si los tienes en una tabla)
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const response = await api.get('/tipo-solicitud')
        setTiposSolicitud(response.data)
      } catch (error) {
        console.error('Error cargando tipos de solicitud:', error)
      }
    }

    cargarTipos()
  }, [])

  // Generar número de solicitud automáticamente
  useEffect(() => {
    const generarNumero = async () => {
      if (empresaSeleccionada && sedeSeleccionada) {
        try {
          const response = await api.get('/generar-numero-solicitud')
          setNumeroSolicitud(response.data.numeroSolicitud)
        } catch (error) {
          console.error('Error generando número:', error)
        }
      }
    }

    generarNumero()
  }, [empresaSeleccionada, sedeSeleccionada])

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primario">📝 Crear nueva solicitud</h2>
        <span className="text-sm font-semibold text-gray-500">
          N° Solicitud: <span className="text-secundario">{numeroSolicitud || '---'}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Empresa */}
        <div>
          <label className="block font-semibold text-sm mb-1">Empresa</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={empresaSeleccionada}
            onChange={e => {
              setEmpresaSeleccionada(e.target.value)
              setSedeSeleccionada('')
              setCargoSeleccionado('')
            }}
          >
            <option value="">Seleccione empresa</option>
            {empresas.map(e => (
              <option key={e.IdEmpresa} value={e.IdEmpresa}>
                {e.NombreEmpresa}
              </option>
            ))}
          </select>
        </div>

        {/* Sede */}
        <div>
          <label className="block font-semibold text-sm mb-1">Sede</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={sedeSeleccionada}
            onChange={e => setSedeSeleccionada(e.target.value)}
            disabled={!empresaSeleccionada}
          >
            <option value="">Seleccione sede</option>
            {sedesFiltradas.map(s => (
              <option key={s.IdSede} value={s.IdSede}>
                {s.NombreSede}
              </option>
            ))}
          </select>
        </div>

        {/* Cargo */}
        <div>
          <label className="block font-semibold text-sm mb-1">Cargo</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={cargoSeleccionado}
            onChange={e => setCargoSeleccionado(e.target.value)}
            disabled={!sedeSeleccionada}
          >
            <option value="">Seleccione cargo</option>
            {cargos.map((c, idx) => (
  <option key={c.IdCargo} value={c.IdCargo}>
    {c.NombreCargo}
  </option>
))}
          </select>
        </div>

        {/* Tipo de solicitud */}
        <div>
          <label className="block font-semibold text-sm mb-1">Tipo de solicitud</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={tipoSolicitudSeleccionado}
            onChange={e => setTipoSolicitudSeleccionado(e.target.value)}
          >
            <option value="">Seleccione tipo</option>
            {tiposSolicitud.map(t => (
              <option key={t.id} value={t.id}>
                {t.NombreTipo}
              </option>
            ))}
          </select>
        </div>

        {/* Nombres */}
        <div>
          <label className="block font-semibold text-sm mb-1">Nombres y apellidos</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={nombresEmpleado}
            onChange={e => setNombresEmpleado(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        {/* Documento */}
        <div>
          <label className="block font-semibold text-sm mb-1">Documento</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={documentoEmpleado}
            onChange={e => setDocumentoEmpleado(e.target.value)}
            placeholder="Ej: 1234567890"
          />
        </div>
      </div>
    </div>
  )
}

export default NuevaSolicitud
