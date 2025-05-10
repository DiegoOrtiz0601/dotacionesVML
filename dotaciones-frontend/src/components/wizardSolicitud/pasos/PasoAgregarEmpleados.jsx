import { useEffect, useState } from 'react'
import api from '../../../api/axios'


const PasoAgregarEmpleados = ({
  idSolicitud,
  empresa,
  sede,
  cargoSeleccionado,
  setCargoSeleccionado,
  onContinue,
  onBack,
  setEmpleadoActual // <- función para almacenar el empleado actual
}) => {
  const [nombresEmpleado, setNombresEmpleado] = useState('')
  const [documentoEmpleado, setDocumentoEmpleado] = useState('')
  const [tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado] = useState('')
  const [tiposSolicitud, setTiposSolicitud] = useState([])
  const [historialSolicitudes, setHistorialSolicitudes] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [evidencias, setEvidencias] = useState([])
  const [cargos, setCargos] = useState([])

  // Carga tipos de solicitud
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

  // Carga cargos según empresa y sede
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

  // Carga historial si aplica
  useEffect(() => {
    const consultarHistorial = async () => {
      if (tipoSolicitudSeleccionado !== '1' && documentoEmpleado) {
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
  }, [tipoSolicitudSeleccionado, documentoEmpleado])

  const manejarArchivo = (e) => {
    const files = Array.from(e.target.files)
    const archivosValidos = files.filter(file => {
      const esFormatoValido = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      const esTamanioValido = file.size <= 5 * 1024 * 1024
      return esFormatoValido && esTamanioValido
    })
    setEvidencias(prev => [...prev, ...archivosValidos])
  }

  const eliminarArchivo = (nombre) => {
    setEvidencias(prev => prev.filter(file => file.name !== nombre))
  }

  const continuar = () => {
    const datosEmpleado = {
      nombresEmpleado,
      documentoEmpleado,
      tipoSolicitud: tipoSolicitudSeleccionado,
      cargo: cargoSeleccionado,
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
            onChange={(e) => {
              const soloTexto = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '')
              setNombresEmpleado(soloTexto)
            }}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">Documento</label>
          <input
            type="text"
            value={documentoEmpleado}
            onChange={(e) => {
              const soloNumeros = e.target.value.replace(/\D/g, '')
              setDocumentoEmpleado(soloNumeros)
            }}
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
            ></textarea>
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
                  <div>
                    <button
                      onClick={() => eliminarArchivo(file.name)}
                      className="text-red-500 hover:underline mr-2"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                      className="text-blue-500 hover:underline"
                    >
                      Ver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          ⬅️ Volver
        </button>
        <button
          onClick={continuar}
          className="bg-primario text-white px-4 py-2 rounded"
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  )
}

export default PasoAgregarEmpleados
