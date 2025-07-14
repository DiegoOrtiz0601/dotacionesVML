import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

function ResumenSolicitud({
  numeroSolicitud,
  empresa,
  sede,
  usuario,
  resumenSolicitud,
  onEnviarSolicitudFinal,
  onModificarEmpleado,
  onEliminarEmpleado
}) {
  const [archivoModal, setArchivoModal] = useState(null)
  const [modalExito, setModalExito] = useState(false)
  const [numeroConfirmada, setNumeroConfirmada] = useState(null)

  const nombreEmpresa = useMemo(() => {
    return typeof empresa === 'object' ? empresa?.NombreEmpresa || empresa?.nombre : empresa
  }, [empresa])

  const nombreSede = useMemo(() => {
    return typeof sede === 'object' ? sede?.NombreSede || sede?.nombre : sede
  }, [sede])

  const logoUrl = empresa?.ruta_logo ? `${empresa.ruta_logo}` : null
  const fechaActual = dayjs().format('DD/MM/YYYY')

  const cerrarModal = () => setArchivoModal(null)

  return (
    <>
      <div className="bg-white rounded shadow-md border border-gray-300 p-6 mt-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="text-sm text-gray-700">
            <p><strong>Fecha:</strong> {fechaActual}</p>
            <p><strong>Solicitud:</strong> {numeroSolicitud}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-primario">🧾 Formato de solicitud de dotación</h3>
          </div>
          <div className="w-28 h-16 flex justify-end">
            {logoUrl && <img src={logoUrl} alt="Logo empresa" className="object-contain h-full" />}
          </div>
        </div>

        <div className="mb-6 text-sm">
          <p><strong>Responsable:</strong> {usuario?.nombre}</p>
          <p><strong>Documento:</strong> {usuario?.documento}</p>
          <p><strong>Correo:</strong> {usuario?.correo}</p>
          <p><strong>Cargo:</strong> {usuario?.cargo}</p>
          <p><strong>Sede:</strong> {nombreSede}</p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2 text-primario">👤 Empleados incluidos:</h4>

          {resumenSolicitud.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📝 No hay empleados agregados</p>
              <p className="text-sm">Completa los pasos del wizard para agregar empleados a la solicitud</p>
            </div>
          ) : (
            resumenSolicitud.map((emp, idx) => (
            <div key={idx} className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-base">
                    {emp.nombresEmpleado} (Documento Empleado: {emp.documentoEmpleado})
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Cargo: {emp.cargo} | Tipo solicitud: {emp.tipoSolicitud}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onModificarEmpleado(idx)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm shadow"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => onEliminarEmpleado(idx)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              <details className="mt-2 bg-gray-50 border rounded p-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                  Ver dotación solicitada
                </summary>

                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                  {emp.elementos?.map((el, i) => (
                    <li key={i}>
                      {(el.nombreElemento || 'Elemento desconocido')} — Talla: <strong>{el.talla}</strong>, Cantidad: <strong>{el.cantidad}</strong>
                    </li>
                  ))}
                </ul>

                {emp.observaciones && (
                  <div className="mt-4 text-sm">
                    <strong>📝 Observaciones:</strong>
                    <p className="mt-1 bg-white border rounded p-2 text-gray-700">{emp.observaciones}</p>
                  </div>
                )}

                {emp.evidencias?.length > 0 && (
                  <div className="mt-4 text-sm">
                    <strong>📎 Evidencias:</strong>
                    <ul className="mt-2 space-y-1">
                      {emp.evidencias.map((file, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="truncate">{file.name}</span>
                          <button
                            onClick={() => setArchivoModal(file)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded"
                          >
                            Ver
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </details>
            </div>
          ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={async () => {
              // Validar que haya empleados antes de enviar
              if (!resumenSolicitud || resumenSolicitud.length === 0) {
                alert('⚠️ Debes agregar al menos un empleado antes de enviar la solicitud.')
                return
              }

              // Validar que cada empleado tenga elementos
              const empleadosSinElementos = resumenSolicitud.filter(emp => 
                !emp.elementos || emp.elementos.length === 0
              )
              
              if (empleadosSinElementos.length > 0) {
                alert('⚠️ Todos los empleados deben tener elementos de dotación asignados.')
                return
              }

              if (process.env.NODE_ENV === 'development') {
                console.log('🟢 Botón Enviar presionado')
              }
              const numero = await onEnviarSolicitudFinal()
              setNumeroConfirmada(numero)
              setModalExito(true)
            }}
            disabled={!resumenSolicitud || resumenSolicitud.length === 0}
            className={`px-6 py-2 rounded text-sm shadow ${
              resumenSolicitud && resumenSolicitud.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            ✅ Enviar Solicitud Final
          </button>
        </div>
      </div>

      {archivoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">🖼️ Evidencia: {archivoModal.name}</h2>

            <div className="max-h-[70vh] overflow-auto">
              {archivoModal.type.includes('image') ? (
                <img src={URL.createObjectURL(archivoModal)} alt="evidencia" className="mx-auto max-h-[60vh]" />
              ) : (
                <embed
                  src={URL.createObjectURL(archivoModal)}
                  type={archivoModal.type}
                  className="w-full h-[60vh] border"
                />
              )}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={cerrarModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExito && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 ¡Felicitaciones!</h2>
            <p className="text-gray-700 mb-6">
              Su solicitud <strong>#{numeroConfirmada}</strong> fue realizada con éxito.
            </p>
            <button
              onClick={() => setModalExito(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ResumenSolicitud
