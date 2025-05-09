import { useEffect, useState } from 'react'
import api from '../../../api/axios'

const PasoAgregarEmpleados = ({ idSolicitud, empresa, sede, onContinue, onBack }) => {
  const [nombresEmpleado, setNombresEmpleado] = useState('')
  const [documentoEmpleado, setDocumentoEmpleado] = useState('')
  const [cargoSeleccionado, setCargoSeleccionado] = useState('')
  const [cargos, setCargos] = useState([])
  const [idTipoSolicitudSeleccionado, setIdTipoSolicitudSeleccionado] = useState('')
  const [tiposSolicitud, setTiposSolicitud] = useState([])
  const [historialSolicitudes, setHistorialSolicitudes] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [evidencias, setEvidencias] = useState([])
  const [modalEvidencia, setModalEvidencia] = useState(null)

  useEffect(() => {
    const cargarCargos = async () => {
      if (empresa && sede) {
        try {
          const response = await api.get('/cargos-por-empresa-sede', {
            params: { idEmpresa: empresa, idSede: sede }
          })
          setCargos(response.data)
        } catch (error) {
          console.error('Error cargando cargos:', error)
        }
      }
    }
    cargarCargos()
  }, [empresa, sede])

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

  useEffect(() => {
    const consultarHistorial = async () => {
      if (idTipoSolicitudSeleccionado && idTipoSolicitudSeleccionado !== 1 && documentoEmpleado) {
        try {
          const response = await api.get('/historial-solicitudes', {
            params: { documento: documentoEmpleado }
          })
          setHistorialSolicitudes(response.data || [])
        } catch (error) {
          console.error('Error consultando historial:', error)
        }
      } else {
        setHistorialSolicitudes([])
      }
    }
    consultarHistorial()
  }, [idTipoSolicitudSeleccionado, documentoEmpleado])

  const manejarArchivo = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      const maxSize = 5 * 1024 * 1024
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      return validTypes.includes(file.type) && file.size <= maxSize
    })
    setEvidencias(prev => [...prev, ...validFiles])
  }

  const eliminarArchivo = (nombre) => {
    setEvidencias(prev => prev.filter(file => file.name !== nombre))
  }

  const visualizarArchivo = (file) => {
    const url = URL.createObjectURL(file)
    setModalEvidencia(url)
  }

  // Validación en tiempo real: solo letras y espacios, y convertir a mayúsculas
  const handleNombreChange = (e) => {
    const valor = e.target.value.toUpperCase()
    if (/^[A-ZÀ-Ÿ\s]*$/.test(valor)) {
      setNombresEmpleado(valor)
    }
  }

  // Validación en tiempo real: solo números
  const handleDocumentoChange = (e) => {
    const valor = e.target.value
    if (/^\d*$/.test(valor)) {
      setDocumentoEmpleado(valor)
    }
  }

  const esValido = () => {
    return (
      nombresEmpleado.trim() !== '' &&
      documentoEmpleado.trim() !== '' &&
      cargoSeleccionado &&
      idTipoSolicitudSeleccionado
    )
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar empleado a la solicitud</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-sm mb-1">Nombres y apellidos</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={nombresEmpleado}
            onChange={handleNombreChange}
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Documento</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={documentoEmpleado}
            onChange={handleDocumentoChange}
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Cargo</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={cargoSeleccionado}
            onChange={e => setCargoSeleccionado(e.target.value)}
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
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={idTipoSolicitudSeleccionado}
            onChange={e => setIdTipoSolicitudSeleccionado(Number(e.target.value))}
          >
            <option value="">Seleccione tipo</option>
            {tiposSolicitud.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.NombreTipo}</option>
            ))}
          </select>
        </div>
      </div>

      {idTipoSolicitudSeleccionado && idTipoSolicitudSeleccionado !== 1 && (
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
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="3"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Observaciones relevantes para la solicitud..."
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">Evidencias</label>
            <input
              type="file"
              multiple
              onChange={manejarArchivo}
              accept=".jpg,.jpeg,.png,.pdf"
              className="block w-full text-sm text-gray-600"
            />
            <ul className="mt-2">
              {evidencias.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{file.name}</span>
                  <div>
                    <button
                      onClick={() => visualizarArchivo(file)}
                      className="text-blue-500 mr-2 hover:underline text-sm"
                    >Ver</button>
                    <button
                      onClick={() => eliminarArchivo(file.name)}
                      className="text-red-500 hover:underline text-sm"
                    >Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {modalEvidencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-xl max-w-2xl w-full relative">
            <button
              onClick={() => setModalEvidencia(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >✖</button>
            <iframe src={modalEvidencia} className="w-full h-[500px]" title="Evidencia" />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >⬅️ Volver</button>
        <button
          onClick={onContinue}
          className={`px-4 py-2 rounded text-white ${esValido() ? 'bg-primario hover:bg-primario/90' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!esValido()}
        >Siguiente ➡️</button>
      </div>
    </div>
  )
}

export default PasoAgregarEmpleados
