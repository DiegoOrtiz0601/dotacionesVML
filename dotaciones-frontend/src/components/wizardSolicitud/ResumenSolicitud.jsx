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
  if (!resumenSolicitud?.length) return null

  const nombreEmpresa = typeof empresa === 'object' ? empresa?.NombreEmpresa || empresa?.nombre : empresa
  const nombreSede = typeof sede === 'object' ? sede?.NombreSede || sede?.nombre : sede
  const logoUrl = empresa?.ruta_logo ? `${empresa.ruta_logo}` : null
  const fechaActual = dayjs().format('DD/MM/YYYY')

  return (
    <div className="bg-white rounded shadow-md border border-gray-300 p-6 mt-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="text-sm text-gray-700">
          <p><strong>Fecha:</strong> {fechaActual}</p>
          <p><strong>Solicitud:</strong> #{numeroSolicitud}</p>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-primario">🧾 Formato de Solicitud de Dotación</h3>
        </div>
        <div className="w-28 h-16 flex justify-end">
          {logoUrl && <img src={logoUrl} alt="Logo empresa" className="object-contain h-full" />}
        </div>
      </div>

      {/* Información de usuario */}
      <div className="mb-6 text-sm">
        <p><strong>Responsable:</strong> {usuario?.nombre}</p>
<p><strong>Documento:</strong> {usuario?.documento}</p>
<p><strong>Correo:</strong> {usuario?.correo}</p>
<p><strong>Cargo:</strong> {usuario?.cargo}</p>
        <p><strong>Sede:</strong> {nombreSede}</p>
      </div>

      {/* Empleados */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-primario">👤 Empleados incluidos:</h4>

        {resumenSolicitud.map((emp, idx) => (
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
                {emp.elementos.map((el, i) => (
                  <li key={i}>
                    {(el.nombreElemento || 'Elemento desconocido')} — Talla: <strong>{el.talla}</strong>, Cantidad: <strong>{el.cantidad}</strong>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onEnviarSolicitudFinal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded"
        >
          ✅ Enviar Solicitud Final
        </button>
      </div>
    </div>
  )
}

export default ResumenSolicitud
