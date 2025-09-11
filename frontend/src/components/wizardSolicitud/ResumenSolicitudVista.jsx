import { useState } from "react";
import dayjs from "dayjs";

function ResumenSolicitudVista({
  numeroSolicitud,
  empresa,
  sede,
  usuario,
  resumenSolicitud,
  estadoSolicitud,
  motivoRechazo,
}) {
  const [archivoModal, setArchivoModal] = useState(null);

  const nombreEmpresa =
    typeof empresa === "object"
      ? empresa?.NombreEmpresa || empresa?.nombre
      : empresa;

  const nombreSede =
    typeof sede === "object" ? sede?.NombreSede || sede?.nombre : sede;

  const logoUrl = empresa?.ruta_logo ? `${empresa.ruta_logo}` : null;
  const fechaActual = dayjs().format("DD/MM/YYYY");

  const cerrarModal = () => setArchivoModal(null);
  console.log("🧾 Estado de la solicitud:", estadoSolicitud);
  return (
    <>
      <div className="bg-white rounded shadow-md border border-gray-300 p-6 mt-6">
        {/* 🧾 Encabezado */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="text-sm text-gray-700">
            <p>
              <strong>Fecha:</strong> {fechaActual}
            </p>
            <p>
              <strong>Solicitud:</strong> #{numeroSolicitud}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-primario">
              🧾 Solicitud de Dotación
            </h3>
          </div>
          <div className="w-28 h-16 flex justify-end">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo empresa"
                className="object-contain h-full"
              />
            )}
          </div>
        </div>

        {/* 👤 Información del responsable */}
        <div className="mb-6 text-sm">
          <p>
            <strong>Responsable:</strong> {usuario?.nombre}
          </p>
          <p>
            <strong>Documento:</strong> {usuario?.documento}
          </p>
          <p>
            <strong>Correo:</strong> {usuario?.correo}
          </p>
          <p>
            <strong>Cargo:</strong> {usuario?.cargo}
          </p>
          <p>
            <strong>Sede:</strong> {nombreSede}
          </p>
          {estadoSolicitud === "Rechazado" && motivoRechazo && (
  <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded">
    <h4 className="text-red-800 font-bold">❌ Motivo del rechazo:</h4>
    <p className="text-sm text-red-700 mt-1">{motivoRechazo}</p>
  </div>
)}
        </div>

        {/* 🧑 Empleados incluidos */}
        <div>
          <h4 className="text-md font-semibold mb-2 text-primario">
            👤 Empleados incluidos:
          </h4>

          {resumenSolicitud.map((emp) => (
            <div
              key={
                emp.documentoEmpleado ||
                emp.idDetalleSolicitud ||
                crypto.randomUUID()
              }
              className="border-t pt-4 mt-4"
            >
              <div>
                <p className="font-semibold text-base">
                  {emp.nombreEmpleado || emp.nombresEmpleado} (Documento:{" "}
                  {emp.documentoEmpleado})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Cargo: {emp.cargo || "N/D"} | Tipo solicitud:{" "}
                  {emp.tipoSolicitud || emp.NombreTipo || "N/A"}
                </p>
              </div>

              <details className="mt-2 bg-gray-50 border rounded p-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                  Ver dotación solicitada
                </summary>

                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                  {(emp.elementos || []).map((el) => (
                    <li key={`${el.id || el.nombreElemento}-${el.talla}`}>
                      {el.nombreElemento || "Elemento"} — Talla:{" "}
                      <strong>{el.talla}</strong>, Cantidad:{" "}
                      <strong>{el.cantidadSolicitada}</strong>
                    </li>
                  ))}
                </ul>

                {/* Observaciones */}
                {emp.observaciones && (
                  <div className="mt-4 text-sm">
                    <strong>📝 Observaciones:</strong>
                    <p className="mt-1 bg-white border rounded p-2 text-gray-700">
                      {emp.observaciones}
                    </p>
                  </div>
                )}

                {/* Evidencias */}
                {emp.evidencias?.length > 0 && (
                  <div className="mt-4 text-sm">
                    <strong>📎 Evidencias:</strong>
                    <ul className="mt-2 space-y-1">
                      {emp.evidencias.map((file) => (
                        <li
                          key={file.name}
                          className="flex items-center space-x-2"
                        >
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

                {/* 📄 Botón de descarga de documento */}
                {estadoSolicitud?.toLowerCase() === "cerrada" && (
                  <div className="mt-4 text-right">
                    <a
                      href={`http://localhost:8000/descargar-pdf/${emp.documentoEmpleado}`}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      📄 Descargar Documento de Entrega
                    </a>
                  </div>
                )}
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* 🖼️ Modal para visualizar archivo */}
      {archivoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">
              🖼️ Evidencia: {archivoModal.name}
            </h2>

            <div className="max-h-[70vh] overflow-auto">
              {archivoModal.type?.includes("image") ? (
                <img
                  src={URL.createObjectURL(archivoModal)}
                  alt="evidencia"
                  className="mx-auto max-h-[60vh]"
                />
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
    </>
  );
}

export default ResumenSolicitudVista;
