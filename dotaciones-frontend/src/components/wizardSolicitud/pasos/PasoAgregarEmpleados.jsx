// PasoAgregarEmpleados.jsx
import { useEffect, useState } from "react";
import api from "../../../api/axios";

const PasoAgregarEmpleados = ({
  idSolicitud,
  empresa,
  sede,
  cargoSeleccionado,
  setCargoSeleccionado,
  onContinue,
  onBack,
  setEmpleadoActual,
}) => {
  const [nombresEmpleado, setNombresEmpleado] = useState("");
  const [documentoEmpleado, setDocumentoEmpleado] = useState("");
  const [tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado] =
    useState("");
  const [tiposSolicitud, setTiposSolicitud] = useState([]);
  const [historialSolicitudes, setHistorialSolicitudes] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [consultandoHistorial, setConsultandoHistorial] = useState(false);
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState(new Set());

  // ✅ Control local del botón Siguiente
 const [botonLocalmenteHabilitado, setBotonLocalmenteHabilitado] = useState(false);

useEffect(() => {
  const habilitado =
    nombresEmpleado?.trim() !== '' &&
    documentoEmpleado?.trim().length >= 5 &&
    tipoSolicitudSeleccionado !== '' &&
    cargoSeleccionado !== '' &&
    !isNaN(Number(cargoSeleccionado)); // Validar que no sea NaN

  console.log('🔍 Validación del botón:', {
    nombresEmpleado: nombresEmpleado?.trim(),
    documentoEmpleado: documentoEmpleado?.trim(),
    tipoSolicitudSeleccionado,
    cargoSeleccionado,
    habilitado
  });

  setBotonLocalmenteHabilitado(habilitado);
}, [
  nombresEmpleado,
  documentoEmpleado,
  tipoSolicitudSeleccionado,
  cargoSeleccionado,
]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposRes, cargosRes] = await Promise.all([
          api.get("/tipo-solicitud"),
          empresa && sede
            ? api.get("/cargos-por-empresa-sede", {
                params: { idEmpresa: empresa, idSede: sede },
              })
            : Promise.resolve({ data: [] }),
        ]);
        setTiposSolicitud(tiposRes.data);
        setCargos(cargosRes.data);
      } catch (error) {
        console.error("❌ Error cargando datos iniciales:", error);
      }
    };
    fetchData();
  }, [empresa, sede]);

  // Removemos el useEffect que consulta automáticamente
  // La consulta se hará solo cuando el usuario salga del campo documento

  const consultarHistorial = async () => {
    try {
      setConsultandoHistorial(true);
      console.log("🔍 Consultando historial para documento:", documentoEmpleado);
      
      const response = await api.get("/historial-solicitudes", {
        params: { documento: documentoEmpleado },
      });
      setHistorialSolicitudes(response.data || []);
      console.log("✅ Historial consultado exitosamente");
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn("⚠️ No hay historial para este documento.");
        setHistorialSolicitudes([]);
      } else {
        console.error("❌ Error consultando historial:", error);
      }
    } finally {
      setConsultandoHistorial(false);
    }
  };

  const handleDocumentoBlur = () => {
    // Consultar historial si:
    // 1. El documento tiene al menos 5 caracteres
    // 2. El documento no está vacío
    if (documentoEmpleado.length >= 5 && documentoEmpleado.trim() !== "") {
      console.log("🔍 Condiciones cumplidas, consultando historial...");
      consultarHistorial();
    } else {
      console.log("⚠️ No se consulta historial - documento muy corto o vacío");
    }
  };

  const toggleAcordeon = (idDetalleSolicitud) => {
    setAcordeonesAbiertos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(idDetalleSolicitud)) {
        nuevo.delete(idDetalleSolicitud);
      } else {
        nuevo.add(idDetalleSolicitud);
      }
      return nuevo;
    });
  };

  // Función para verificar si se deben mostrar campos adicionales
  const debeMostrarCamposAdicionales = () => {
    if (!tipoSolicitudSeleccionado) return false;
    const tipoSeleccionado = tiposSolicitud.find(t => t.id == tipoSolicitudSeleccionado);
    const nombre = tipoSeleccionado?.NombreTipo?.toLowerCase() || '';
    
    return (
      nombre === 'solicitud cambio por talla' ||
      nombre === 'solicitud cambio por perdida' ||
      nombre === 'solicitud cambio por daño'
    );
  };

  const manejarArchivo = (e) => {
    const files = Array.from(e.target.files);
    const archivosValidos = files.filter(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );
    setEvidencias((prev) => [...prev, ...archivosValidos]);
  };

  const eliminarArchivo = (nombre) => {
    if (confirm(`¿Seguro que deseas eliminar el archivo "${nombre}"?`)) {
      setEvidencias((prev) => prev.filter((file) => file.name !== nombre));
    }
  };

  const verArchivo = (archivo) => {
    setArchivoSeleccionado(archivo);
    setMostrarModal(true);
  };

  const continuar = () => {
    console.log('🚀 Función continuar ejecutada');
    
    const tipoSeleccionado = tiposSolicitud.find(
      (t) => t.id == tipoSolicitudSeleccionado
    );
    const nombreCargo =
      cargos.find((c) => c.IdCargo == cargoSeleccionado)?.NombreCargo ||
      "Sin nombre";

    const datosEmpleado = {
      nombresEmpleado,
      documentoEmpleado,
      tipoSolicitud: tipoSeleccionado?.NombreTipo || tipoSolicitudSeleccionado,
      IdTipoSolicitud:
        tipoSeleccionado?.id || parseInt(tipoSolicitudSeleccionado),
      idCargo: cargoSeleccionado,
      cargo: nombreCargo,
      // Solo incluir observaciones y evidencias si se deben mostrar campos adicionales
      observaciones: debeMostrarCamposAdicionales() ? observaciones : '',
      evidencias: debeMostrarCamposAdicionales() ? evidencias : [],
    };

    console.log('📦 Datos del empleado:', datosEmpleado);

    if (setEmpleadoActual) {
      setEmpleadoActual(datosEmpleado);
      setTimeout(() => {
        onContinue();
      }, 0);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">
        Agregar Empleado a la Solicitud
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-sm mb-1">
            Nombres y apellidos
          </label>
          <input
            type="text"
            value={nombresEmpleado}
            onChange={(e) =>
              setNombresEmpleado(
                e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, "")
              )
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">Documento</label>
          <input
            type="text"
            value={documentoEmpleado}
            onChange={(e) =>
              setDocumentoEmpleado(e.target.value.replace(/\D/g, ""))
            }
            onBlur={handleDocumentoBlur}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ej: 1234567890"
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Cargo</label>
          <select
            value={cargoSeleccionado}
            onChange={(e) => setCargoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option key="cargo-default" value="">Seleccione cargo</option>
            {cargos && cargos.length > 0 ? cargos.map((c, index) => (
              <option key={c.IdCargo || `cargo-${index}`} value={c.IdCargo}>
                {c.NombreCargo || 'Sin nombre'}
              </option>
            )) : null}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">
            Tipo de solicitud
          </label>
          <select
            value={tipoSolicitudSeleccionado}
            onChange={(e) => {
              setTipoSolicitudSeleccionado(e.target.value);
            }}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option key="tipo-default" value="">Seleccione tipo</option>
            {tiposSolicitud && tiposSolicitud.length > 0 ? tiposSolicitud.map((tipo, index) => (
              <option key={tipo.id || `tipo-${index}`} value={tipo.id}>
                {tipo.NombreTipo || 'Sin nombre'}
              </option>
            )) : null}
          </select>
          {/* Mensaje informativo solo para Solicitud nueva */}
          {(() => {
            const tipoSeleccionado = tiposSolicitud.find(t => t.id == tipoSolicitudSeleccionado);
            const nombre = tipoSeleccionado?.NombreTipo?.toLowerCase() || '';
            if (nombre === 'solicitud nueva') {
              return (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ️ Para "Solicitud nueva" no se requieren observaciones ni evidencias adicionales
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {documentoEmpleado.length >= 5 && (
        <>
          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1">
              Historial de solicitudes
              {consultandoHistorial && (
                <span className="ml-2 text-blue-600 text-xs">
                  🔍 Consultando...
                </span>
              )}
            </label>
            
            {consultandoHistorial ? (
              <div className="text-center py-4 text-gray-500">
                🔍 Consultando historial...
              </div>
            ) : historialSolicitudes.length > 0 ? (
              <div className="border border-gray-300 rounded p-3 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">
                  Se encontraron {historialSolicitudes.length} solicitudes previas:
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {historialSolicitudes.map((s, index) => (
                    <div key={s.idDetalleSolicitud || `historial-${index}`} className="text-xs bg-white p-3 rounded border shadow-sm">
                      {/* Encabezado con código y fecha */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-blue-600 text-sm">
                          {s.codigoSolicitud || 'Sin código'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </div>
                      </div>
                      
                      {/* Información del empleado y tipo */}
                      <div className="text-gray-700 mb-2">
                        <div className="font-semibold">{s.nombreEmpleado || 'Sin nombre'}</div>
                        <div className="text-gray-600">Tipo: {s.tipoSolicitud || 'Sin tipo'}</div>
                      </div>
                      
                      {/* Empresa y Sede */}
                      <div className="text-gray-600 mb-2">
                        <div>🏢 {s.NombreEmpresa || 'Sin empresa'}</div>
                        <div>📍 {s.NombreSede || 'Sin sede'}</div>
                      </div>
                      
                      {/* Elementos solicitados en acordeón */}
                      <div className="mb-2">
                        <button
                          onClick={() => toggleAcordeon(s.idDetalleSolicitud)}
                          className="flex items-center justify-between w-full text-left font-semibold text-gray-700 mb-1 hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                          <span>📦 Elementos ({s.elementos && s.elementos.length > 0 ? s.elementos.length : 0})</span>
                          <span className={`transform transition-transform ${acordeonesAbiertos.has(s.idDetalleSolicitud) ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {acordeonesAbiertos.has(s.idDetalleSolicitud) && (
                          <div className="bg-gray-50 p-2 rounded border-l-4 border-blue-400">
                            {s.elementos && s.elementos.length > 0 ? (
                              <div className="space-y-2">
                                {s.elementos.map((elemento, elemIndex) => (
                                  <div key={elemIndex} className="text-xs bg-white p-2 rounded shadow-sm border">
                                    <div className="font-semibold text-blue-600">
                                      {elemento.nombreElemento}
                                    </div>
                                    <div className="text-gray-600">
                                      Cantidad: {elemento.cantidad}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-xs italic">
                                No hay elementos registrados para esta solicitud
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Estado con color */}
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        s.EstadoSolicitudEmpleado === 'Entregado' ? 'bg-green-100 text-green-800' :
                        s.EstadoSolicitudEmpleado === 'Aprobado' ? 'bg-blue-100 text-blue-800' :
                        s.EstadoSolicitudEmpleado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        s.EstadoSolicitudEmpleado === 'Aprobado Parcial' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {s.EstadoSolicitudEmpleado || 'Sin estado'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 border border-gray-300 rounded">
                ✅ Sin solicitudes previas para este documento
              </div>
            )}
          </div>

          {/* Campos adicionales solo para tipos de solicitud que NO sean "Solicitud nueva" */}
          {debeMostrarCamposAdicionales() && (
            <>
              <div className="mb-4">
                <label className="block font-semibold text-sm mb-1">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="Observaciones relevantes..."
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold text-sm mb-1">
                  Evidencias (jpg, png, pdf)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={manejarArchivo}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="block w-full text-sm text-gray-600"
                />
                <ul className="mt-2 space-y-1">
                  {evidencias.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center text-sm"
                    >
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
        </>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          ⬅️ Volver
        </button>
        {/* Elimino el estado del botón */}
        <button
          onClick={continuar}
          disabled={!botonLocalmenteHabilitado}
          className={`px-4 py-2 rounded text-white ${
            botonLocalmenteHabilitado
              ? "bg-primario hover:bg-primario-dark"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Siguiente ➡️
        </button>
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
            <h2 className="text-lg font-semibold mb-4">
              Vista previa de evidencia
            </h2>
            {archivoSeleccionado.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(archivoSeleccionado)}
                alt="Evidencia"
                className="max-h-[500px] w-auto mx-auto"
              />
            ) : (
              <iframe
                src={URL.createObjectURL(archivoSeleccionado)}
                title="PDF"
                className="w-full h-[500px]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasoAgregarEmpleados;
