// Componente para tramitar una solicitud con edición de cantidades y observación, confirmación y envío de correos
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Disclosure, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import Loader from "../Loader"; // ajusta la ruta según tu estructura

const TramitarSolicitud = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalArchivo, setModalArchivo] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [correoCompras, setCorreoCompras] = useState("");
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [excelGenerado, setExcelGenerado] = useState(false);
  const [excelInfo, setExcelInfo] = useState(null);
  const [solicitudProcesada, setSolicitudProcesada] = useState(false);
  const [tipoProcesamiento, setTipoProcesamiento] = useState(null); // 'aprobada' o 'rechazada'

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        const response = await api.get(`/solicitudes/${id}`);
        const data = response.data;
        
        // Verificar si la solicitud ya fue procesada
        if (data.estado === 'Aprobada' || data.estado === 'Rechazada') {
          setSolicitudProcesada(true);
          setTipoProcesamiento(data.estado === 'Aprobada' ? 'aprobada' : 'rechazada');
          
          // Si fue aprobada, verificar si hay Excel generado
          if (data.estado === 'Aprobada') {
            // Intentar buscar archivos Excel existentes
            try {
              const excelResponse = await api.get(`/solicitudes/${id}/excel-download`);
              if (excelResponse.status === 200) {
                setExcelGenerado(true);
                setExcelInfo({
                  filename: `Solicitud_Aprobada_${data.codigoSolicitud}_${new Date().toISOString().split('T')[0]}.xlsx`
                });
              }
            } catch (excelError) {
              console.log("No hay Excel generado para esta solicitud");
            }
          }
        }
        
        data.empleados.forEach((emp) => {
          emp.elementos.forEach((el) => {
            el.id = el.id ?? null;
            el.cantidadModificada = el.cantidadSolicitada;
            el.observacionElemento = "";
          });
        });
        setSolicitud(data);
        console.log("✅ Solicitud cargada:", data);
      } catch (error) {
        console.error("❌ Error al cargar solicitud:", error);
      } finally {
        setTimeout(() => setCargando(false), 300); // retraso suave para mejor UX
      }
    };
    obtenerDetalle();
  }, [id]);

  const abrirModal = (url) => {
    setModalArchivo(url);
    setErrorModal(false);
  };

  const cerrarModal = () => {
    setModalArchivo(null);
    setErrorModal(false);
  };

  // 🔍 Función auxiliar: verifica si hay elementos reducidos sin observación
  const hayReduccionesSinObservacion = () => {
    for (const emp of solicitud.empleados) {
      for (const el of emp.elementos) {
        if (
          el.cantidadModificada < el.cantidadSolicitada &&
          !el.observacionElemento.trim()
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const confirmarAprobacion = () => {
    if (hayReduccionesSinObservacion()) {
      alert(
        "⚠️ Debes ingresar una observación para cada elemento con cantidad reducida."
      );
      return;
    }
    setMostrarConfirmacion(true);
  };

  const generarResumenAprobacion = () => {
    if (!solicitud || !solicitud.empleados) return [];
    return solicitud.empleados.flatMap((emp) =>
      emp.elementos
        .filter(
          (el) =>
            el.cantidadModificada < el.cantidadSolicitada ||
            el.cantidadModificada === 0
        )
        .map((el) => ({
          nombreEmpleado: emp.nombreEmpleado,
          documentoEmpleado: emp.documentoEmpleado,
          nombreElemento: el.nombreElemento,
          talla: el.talla,
          cantidadAnterior: el.cantidadSolicitada,
          cantidadNueva: el.cantidadModificada,
          observacion: el.observacionElemento,
        }))
    );
  };

  const descargarExcel = async () => {
    try {
      const response = await api.get(`/solicitudes/${id}/excel-download`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', excelInfo.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando Excel:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "❌ No se pudo descargar el archivo Excel.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const descargarPDF = async () => {
    try {
      const response = await api.get(`/solicitudes/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resumen_solicitud_${solicitud.codigoSolicitud}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando PDF:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "❌ No se pudo descargar el archivo PDF.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const enviarNotificacion = async () => {
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correoCompras)) {
      alert("❌ El correo del área de compras no es válido.");
      return;
    }

    // Construir payload con campos necesarios
    const payload = {
      correoCompras,
      generarExcel: true, // ✅ Nueva bandera para generar Excel
      empleados: solicitud.empleados.map((emp) => ({
        nombreEmpleado: emp.nombreEmpleado, // ✅ Añadir
        documentoEmpleado: emp.documentoEmpleado,
        elementos: emp.elementos.map((el) => ({
          id: el.id,
          nombreElemento: el.nombreElemento, // ✅ Añadir
          talla: el.talla, // ✅ Añadir
          cantidad: el.cantidadModificada,
          cantidadSolicitada: el.cantidadSolicitada,
          observacionElemento: el.observacionElemento,
        })),
      })),
    };

    setEnviandoCorreo(true);
    try {
      const response = await api.post(`/solicitudes/${id}/aprobar`, payload);

      // Marcar solicitud como procesada
      setSolicitudProcesada(true);
      setTipoProcesamiento('aprobada');
      
      // Verificar si se generó Excel
      if (response.data.excel_generado) {
        setExcelGenerado(true);
        setExcelInfo(response.data.excel_info);
        
        Swal.fire({
          icon: "success",
          title: "Solicitud aprobada",
          text: "✅ Solicitud aprobada y Excel generado correctamente.",
          confirmButtonColor: "#16a34a",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Solicitud aprobada",
          text: "✅ Correos enviados correctamente.",
          confirmButtonColor: "#16a34a",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "❌ Ocurrió un error al aprobar la solicitud.",
        confirmButtonColor: "#dc2626",
      });
      console.error("🚨 Error en envío:", error);
    } finally {
      setEnviandoCorreo(false);
    }
  };

  if (cargando) return <Loader mensaje="Cargado los datos de la solicitud" />;
  if (!solicitud)
    return (
      <p className="text-center mt-8 text-red-500">
        No se encontró la solicitud.
      </p>
    );

  const resumenAprobacion = generarResumenAprobacion();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">
        🛠️ Trámite de Solicitud
      </h1>

      {/* Modal para vista de evidencias */}

      {modalArchivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              📄 Vista previa del archivo
            </h2>
            <div className="h-[75vh] overflow-auto">
              <embed
                src={modalArchivo}
                type="application/pdf"
                className="w-full h-full border"
                onError={() => setErrorModal(true)}
              />
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={cerrarModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
            {errorModal && (
              <p className="text-red-600 text-sm mt-2">
                ❌ No se pudo cargar el archivo.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Datos generales */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Código</p>
          <p className="text-lg font-semibold">{solicitud.codigo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estado</p>
          <p className="text-lg text-blue-600 font-medium">
            {solicitud.estadoSolicitud}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Empresa</p>
          <p>{solicitud.empresa}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sede</p>
          <p>{solicitud.sede}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Solicitante</p>
          <p>{solicitud.nombreSolicitante}</p>
        </div>
      </div>
      {/* Elementos por empleado */}
      <div className="bg-white shadow rounded p-6">
        <p className="text-lg font-semibold mb-4">
          Elementos Solicitados por Empleado
        </p>
        {solicitud.empleados.map((emp, idx) => (
          <Disclosure key={idx}>
            {({ open }) => (
              <div className="border mb-4 rounded">
                <Disclosure.Button className="w-full text-left px-4 py-2 font-medium text-gray-800 bg-gray-100 hover:bg-gray-200">
                  👤 {emp.nombreEmpleado} — <b>Documento:</b>{" "}
                  {emp.documentoEmpleado} — <b>Tipo:</b>{" "}
                  {emp.tipoSolicitud || "No definido"} {open ? "▲" : "▼"}
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-200 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-150 ease-in"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel className="bg-gray-50 px-4 py-4 space-y-4">
                    {emp.elementos.map((el, j) => {
                      const cantidadReducida =
                        el.cantidadModificada < el.cantidadSolicitada;
                      return (
                        <div
                          key={j}
                          className="border p-3 rounded shadow-sm bg-white space-y-2"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                            <div>
                              <strong>Elemento:</strong> {el.nombreElemento}
                            </div>
                            <div>
                              <strong>Talla:</strong> {el.talla}
                            </div>
                            <div>
                              <strong>Cantidad:</strong> {el.cantidadSolicitada}
                            </div>
                            <div>
                              <input
                                type="number"
                                min={1}
                                max={el.cantidadSolicitada}
                                value={el.cantidadModificada}
                                onChange={(e) => {
                                  const nueva = Math.min(
                                    Number(e.target.value),
                                    el.cantidadSolicitada
                                  );
                                  const nuevaData = [...solicitud.empleados];
                                  nuevaData[idx].elementos[
                                    j
                                  ].cantidadModificada = nueva;
                                  setSolicitud({
                                    ...solicitud,
                                    empleados: nuevaData,
                                  });
                                }}
                                className="w-full border rounded px-2 py-1 text-center"
                              />
                            </div>
                          </div>

                          {cantidadReducida && (
                            <textarea
                              rows={2}
                              placeholder="Motivo de disminución"
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              value={el.observacionElemento}
                              onChange={(e) => {
                                const nuevaData = [...solicitud.empleados];
                                nuevaData[idx].elementos[
                                  j
                                ].observacionElemento = e.target.value;
                                setSolicitud({
                                  ...solicitud,
                                  empleados: nuevaData,
                                });
                              }}
                            />
                          )}
                        </div>
                      );
                    })}

                    {/* Mostrar observaciones y evidencias SOLO si el tipo de solicitud del empleado no es "Solicitud nueva" */}
                    {emp.tipoSolicitud?.toLowerCase() !== "solicitud nueva" && (
                      <>
                        {emp.observaciones?.trim() && (
                          <div className="bg-white border border-yellow-200 rounded p-3 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1 font-medium">
                              📝 Observaciones del empleado
                            </p>
                            <p className="text-gray-700 text-sm">
                              {emp.observaciones}
                            </p>
                          </div>
                        )}

                        {Array.isArray(emp.evidencias) &&
                          emp.evidencias.length > 0 && (
                            <div className="bg-white border border-blue-100 rounded p-3 shadow-sm space-y-2">
                              <p className="text-sm text-gray-600 mb-1 font-medium">
                                📎 Evidencias adjuntas
                              </p>
                              {emp.evidencias.map((evi, k) => (
                                <div
                                  key={k}
                                  className="flex justify-between items-center border px-3 py-2 rounded bg-gray-50 text-sm"
                                >
                                  <span className="truncate">
                                    {evi.nombreArchivo}
                                  </span>
                                  {evi.existe ? (
                                    <button
                                      onClick={() => abrirModal(evi.url)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                    >
                                      Ver
                                    </button>
                                  ) : (
                                    <span className="text-red-500 italic text-xs">
                                      Archivo no disponible
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        {Array.isArray(emp.historial) &&
                          emp.historial.length > 0 && (
                            <div className="bg-white border border-indigo-200 rounded p-3 shadow-sm mt-4">
                              <p className="text-sm font-semibold text-indigo-700 mb-2">
                                📚 Historial de solicitudes previas
                              </p>
                              {emp.historial.map((solicitudHist, i) => (
                                <Disclosure key={i}>
                                  {({ open }) => (
                                    <div className="mb-2 border rounded">
                                      <Disclosure.Button className="w-full text-left px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 rounded">
                                        <span className="font-medium">
                                          {solicitudHist.codigoSolicitud ||
                                            "Solicitud sin código"}
                                        </span>{" "}
                                        <span className="text-gray-600">
                                          (
                                          {new Date(
                                            solicitudHist.fecha
                                          ).toLocaleDateString()}
                                          )
                                        </span>{" "}
                                        {open ? "▲" : "▼"}
                                      </Disclosure.Button>
                                      <Transition
                                        show={open}
                                        enter="transition duration-200 ease-out"
                                        enterFrom="transform scale-95 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-150 ease-in"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-95 opacity-0"
                                      >
                                        <Disclosure.Panel className="px-4 py-2 text-sm text-gray-700 space-y-2 bg-indigo-50 rounded-b">
                                          <p>{solicitudHist.evento}</p>
                                          {Array.isArray(
                                            solicitudHist.elementos
                                          ) &&
                                            solicitudHist.elementos.length >
                                              0 && (
                                              <ul className="list-disc pl-5 text-gray-600">
                                                {solicitudHist.elementos.map(
                                                  (el, j) => (
                                                    <li key={j}>
                                                      {el.nombreElemento} —
                                                      Talla: {el.talla},
                                                      Cantidad: {el.cantidad}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            )}
                                        </Disclosure.Panel>
                                      </Transition>
                                    </div>
                                  )}
                                </Disclosure>
                              ))}
                            </div>
                          )}
                      </>
                    )}
                  </Disclosure.Panel>
                </Transition>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl space-y-4">
            <h2 className="text-lg font-bold">Confirmar aprobación</h2>

            {resumenAprobacion.length > 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  Se detectaron cambios en la solicitud. Por favor confirme y
                  proporcione el correo del área de compras para enviar la
                  notificación:
                </p>
                <div className="border rounded p-3 max-h-60 overflow-y-auto text-sm">
                  {resumenAprobacion.map((item, idx) => (
                    <div key={idx} className="border-b py-1">
                      <p>
                        <strong>{item.nombreEmpleado}</strong> (
                        {item.documentoEmpleado})
                      </p>
                      <p>
                        {item.nombreElemento} ({item.talla}):{" "}
                        {item.cantidadAnterior} → {item.cantidadNueva}
                      </p>
                      {item.observacion && (
                        <p className="italic text-xs">
                          Motivo: {item.observacion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-700">
                ¿Está seguro de aprobar la solicitud sin modificaciones?
              </p>
            )}

            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Correo área de compras"
              value={correoCompras}
              onChange={(e) => setCorreoCompras(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={enviarNotificacion}
                disabled={enviandoCorreo}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {enviandoCorreo ? "Enviando..." : "Confirmar y Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

{mostrarRechazo && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg space-y-4">
      <h2 className="text-lg font-bold text-red-600">Motivo del rechazo</h2>
      <textarea
        rows={4}
        value={motivoRechazo}
        onChange={(e) => setMotivoRechazo(e.target.value)}
        className="w-full border rounded px-3 py-2"
        placeholder="Ingrese el motivo del rechazo"
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setMostrarRechazo(false)}
          className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          onClick={async () => {
            if (!motivoRechazo.trim()) return alert("❌ Debes ingresar un motivo.");
            try {
              await api.post(`/solicitudes/${id}/rechazar`, {
                motivo: motivoRechazo
              });
              
              // Marcar solicitud como procesada
              setSolicitudProcesada(true);
              setTipoProcesamiento('rechazada');
              setMostrarRechazo(false);
              
              Swal.fire("Rechazada", "La solicitud fue rechazada correctamente", "success");
            } catch (error) {
              console.error("❌ Error al rechazar:", error);
              Swal.fire("Error", "No se pudo rechazar la solicitud", "error");
            }
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Confirmar rechazo
        </button>
      </div>
    </div>
  </div>
)}

      {/* Estado de la solicitud procesada */}
      {solicitudProcesada && (
        <div className={`border rounded-lg p-6 mb-6 ${
          tipoProcesamiento === 'aprobada' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                tipoProcesamiento === 'aprobada' ? 'text-green-800' : 'text-red-800'
              }`}>
                {tipoProcesamiento === 'aprobada' 
                  ? '✅ Solicitud Aprobada' 
                  : '❌ Solicitud Rechazada'
                }
              </h3>
              <p className={`text-sm ${
                tipoProcesamiento === 'aprobada' ? 'text-green-700' : 'text-red-700'
              }`}>
                {tipoProcesamiento === 'aprobada' 
                  ? 'La solicitud ha sido aprobada y procesada. No se pueden realizar más cambios.'
                  : 'La solicitud ha sido rechazada. No se pueden realizar más cambios.'
                }
              </p>
              <p className={`text-xs mt-2 ${
                tipoProcesamiento === 'aprobada' ? 'text-green-600' : 'text-red-600'
              }`}>
                💡 Solo puedes descargar archivos o regresar a la lista de solicitudes.
              </p>
            </div>
          </div>
          
                     {/* Información de archivos generados si se aprobó */}
           {tipoProcesamiento === 'aprobada' && (
             <div className="mt-4 p-4 bg-white rounded border">
               <h4 className="font-semibold text-green-800 mb-2">
                 📁 Archivos Generados
               </h4>
               <p className="text-green-700 text-sm mb-3">
                 Se han generado los siguientes archivos para esta solicitud aprobada.
                 Puedes descargarlos para uso interno o análisis.
               </p>
               
               {/* Botón de descarga PDF */}
               <div className="mb-3">
                 <button
                   onClick={descargarPDF}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md flex items-center gap-2"
                 >
                   📄 Descargar PDF
                 </button>
               </div>
               
               {/* Botón de descarga Excel si se generó */}
               {excelGenerado && (
                 <div className="mb-3">
                   <div className="text-sm text-green-600 mb-2">
                     <p><strong>Archivo Excel:</strong> {excelInfo?.filename}</p>
                     <p><strong>Generado:</strong> {new Date().toLocaleString()}</p>
                   </div>
                   <button
                     onClick={descargarExcel}
                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md flex items-center gap-2"
                   >
                     📊 Descargar Excel
                   </button>
                 </div>
               )}
             </div>
           )}
        </div>
      )}

      {/* Botones finales */}
      <div className="flex justify-end gap-3">
        {!solicitudProcesada ? (
          <>
            <button
              onClick={confirmarAprobacion}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
            >
              Aprobar
            </button>
            <button
              onClick={() => setMostrarRechazo(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow"
            >
              Rechazar
            </button>
          </>
                 ) : (
           <>
             <button
               onClick={() => navigate("/talento/gestionar-solicitudes")}
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
             >
               ← Volver a Solicitudes
             </button>
           </>
         )}
      </div>
    </div>
  );
};

export default TramitarSolicitud;
