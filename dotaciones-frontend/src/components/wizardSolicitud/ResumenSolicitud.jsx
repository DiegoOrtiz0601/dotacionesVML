// src/components/wizardSolicitud/ResumenSolicitud.jsx
function ResumenSolicitud({ numeroSolicitud, empresa, sede, resumenSolicitud, onEnviarSolicitudFinal }) {
  if (!resumenSolicitud?.length) return null

  const nombreEmpresa = typeof empresa === 'object' ? empresa?.NombreEmpresa || empresa?.nombre : empresa
  const nombreSede = typeof sede === 'object' ? sede?.NombreSede || sede?.nombre : sede

  return (
    <div className="bg-white rounded shadow-md p-6 border border-primario mt-4">
      <h3 className="text-lg font-bold mb-2 text-primario">
        📄 Resumen de Solicitud #{numeroSolicitud} – Empresa: {nombreEmpresa} – Sede: {nombreSede}
      </h3>

      {resumenSolicitud.map((emp, idx) => (
        <div key={idx} className="mb-4 border-t pt-2">
          <p className="font-semibold">{emp.nombresEmpleado} (Doc: {emp.documentoEmpleado})</p>
          <p className="text-sm text-gray-600">Cargo: {emp.cargo} | Tipo solicitud: {emp.tipoSolicitud}</p>

          <details className="mt-2 bg-gray-50 border rounded p-2">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">Ver elementos</summary>
            <ul className="list-disc ml-5 mt-1 text-sm text-gray-700">
              {emp.elementos.map((el, i) => (
                <li key={i}>
                  {el.nombreElemento} - Talla: {el.talla} - Cantidad: {el.cantidad}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}

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
