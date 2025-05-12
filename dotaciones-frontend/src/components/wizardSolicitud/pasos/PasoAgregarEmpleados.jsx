import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'

const PasoAgregarEmpleados = ({
  idSolicitud,
  empresa,
  sede,
  cargoSeleccionado,
  setCargoSeleccionado,
  onContinue,
  onBack,
  setEmpleadoActual
}) => {
  const [nombresEmpleado, setNombresEmpleado] = useState('')
  const [documentoEmpleado, setDocumentoEmpleado] = useState('')
  const [tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado] = useState('')
  const [tiposSolicitud, setTiposSolicitud] = useState([])
  const [historialSolicitudes, setHistorialSolicitudes] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [evidencias, setEvidencias] = useState([])
  const [cargos, setCargos] = useState([])

  const [mostrarModal, setMostrarModal] = useState(false)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposRes, cargosRes] = await Promise.all([
          api.get('/tipo-solicitud'),
          empresa && sede
            ? api.get('/cargos-por-empresa-sede', {
                params: { idEmpresa: empresa, idSede: sede }
              })
            : Promise.resolve({ data: [] })
        ])
        setTiposSolicitud(tiposRes.data)
        setCargos(cargosRes.data)
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error)
      }
    }
    fetchData()
  }, [empresa, sede])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (tipoSolicitudSeleccionado !== '1' && documentoEmpleado.length >= 5) {
        consultarHistorial()
      }
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [documentoEmpleado, tipoSolicitudSeleccionado])

  const consultarHistorial = async () => {
    try {
      const response = await api.get('/historial-solicitudes', {
        params: { documento: documentoEmpleado }
      })
      setHistorialSolicitudes(response.data || [])
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn('⚠️ No hay historial para este documento.')
        setHistorialSolicitudes([])
      } else {
        console.error('Error consultando historial:', error)
      }
    }
  }

  const manejarArchivo = (e) => {
    const files = Array.from(e.target.files)
    const archivosValidos = files.filter(file =>
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) && file.size <= 5 * 1024 * 1024
    )
    setEvidencias(prev => [...prev, ...archivosValidos])
  }

  const eliminarArchivo = (nombre) => {
    if (confirm(`¿Seguro que deseas eliminar el archivo "${nombre}"?`)) {
      setEvidencias(prev => prev.filter(file => file.name !== nombre))
    }
  }

  const verArchivo = (archivo) => {
    setArchivoSeleccionado(archivo)
    setMostrarModal(true)
  }

  const continuar = () => {
    const tipoSeleccionado = tiposSolicitud.find(t => t.id == tipoSolicitudSeleccionado)
    const nombreCargo = cargos.find(c => c.IdCargo == cargoSeleccionado)?.NombreCargo || 'Sin nombre'

    const datosEmpleado = {
      nombresEmpleado,
      documentoEmpleado,
      tipoSolicitud: tipoSeleccionado?.NombreTipo || tipoSolicitudSeleccionado,
      IdTipoSolicitud: tipoSeleccionado?.id || parseInt(tipoSolicitudSeleccionado),
      idCargo: cargoSeleccionado,
      cargo: nombreCargo,
      observaciones,
      evidencias
    }

    if (setEmpleadoActual) {
      setEmpleadoActual(datosEmpleado)
    }

    onContinue()
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar Empleado a la Solicitud</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-sm mb-1">Nombres y apellidos</label>
          <input
            type="text"
            value={nombresEmpleado}
            onChange={(e) =>
              setNombresEmpleado(e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, ''))
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">Documento</label>
          <input
            type="text"
            value={documentoEmpleado}
            onChange={(e) => setDocumentoEmpleado(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Cargo</label>
          <select
            value={cargoSeleccionado}
            onChange={(e) => setCargoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccione cargo</option>
            {cargos.map(c => (
              <option key={c.IdCargo} value={c.IdCargo}>{c.NombreCargo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Tipo de solicitud</label>
          <select
            value={tipoSolicitudSeleccionado}
            onChange={(e) => setTipoSolicitudSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccione tipo</option>
            {tiposSolicitud.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.NombreTipo}</option>
            ))}
          </select>
        </div>
      </div>

      {tipoSolicitudSeleccionado && tipoSolicitudSeleccionado !== '1' && (
        <>
          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">Historial de solicitudes</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              {historialSolicitudes.length > 0 ? (
                historialSolicitudes.map(s => (
                  <option key={s.idDetalleSolicitud} value={s.idDetalleSolicitud}>
                    {s.idDetalleSolicitud} - {s.nombreEmpleado}
                  </option>
                ))
              ) : (
                <option value="">Sin solicitudes</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="3"
              placeholder="Observaciones relevantes..."
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">Evidencias (jpg, png, pdf)</label>
            <input
              type="file"
              multiple
              onChange={manejarArchivo}
              accept=".jpg,.jpeg,.png,.pdf"
              className="block w-full text-sm text-gray-600"
            />
            <ul className="mt-2 space-y-1">
              {evidencias.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <span>{file.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => verArchivo(file)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => eliminarArchivo(file.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">⬅️ Volver</button>
        <button onClick={continuar} className="bg-primario text-white px-4 py-2 rounded">Siguiente ➡️</button>
      </div>

      {mostrarModal && archivoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-xl relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
              onClick={() => setMostrarModal(false)}
            >
              ✖️
            </button>
            <h2 className="text-lg font-semibold mb-4">Vista previa de evidencia</h2>
            {archivoSeleccionado.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(archivoSeleccionado)} alt="Evidencia" className="max-h-[500px] w-auto mx-auto" />
            ) : (
              <iframe src={URL.createObjectURL(archivoSeleccionado)} title="PDF" className="w-full h-[500px]" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PasoAgregarEmpleados
