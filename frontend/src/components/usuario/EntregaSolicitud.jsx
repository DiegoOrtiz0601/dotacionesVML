import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import optimizedApi from "../../api/optimizedAxios";
import ResumenEntrega from "./ResumenEntrega";
import { obtenerEmpresasYSedes, obtenerUsuarioAutenticado } from "../../api/utils";
import { Search, Eye, ArrowLeft } from "lucide-react";

const EntregaSolicitud = () => {
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const [usuarioData, empresaSedeData] = await Promise.all([
          obtenerUsuarioAutenticado(),
          obtenerEmpresasYSedes(),
        ]);
        
        setUsuario(usuarioData);
        setEmpresas(empresaSedeData?.empresas || []);
        setSedes(empresaSedeData?.sedes || []);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        setError("Error cargando datos iniciales: " + error.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const cargarSolicitudes = async () => {
    if (!empresaSeleccionada) {
      Swal.fire({
        icon: "warning",
        title: "Falta seleccionar empresa",
        text: "Debe seleccionar al menos una empresa para continuar.",
      });
      return;
    }

    try {
      setCargandoSolicitudes(true);
      setError(null);
      
      const response = await optimizedApi.getCached("/solicitudes-entrega", {
        idEmpresa: empresaSeleccionada,
        idSede: sedeSeleccionada,
      }, 1 * 60 * 1000); // 1 minuto de caché para solicitudes de entrega
      
      setSolicitudes(response.data || []);
    } catch (error) {
      console.error("❌ Error cargando solicitudes:", error);
      setError("Error cargando solicitudes: " + error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las solicitudes. Intente nuevamente.",
      });
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  const manejarCambioEmpresa = (e) => {
    const nuevaEmpresa = e.target.value;
    setEmpresaSeleccionada(nuevaEmpresa);
    setSedeSeleccionada("");
  };

  // 🔄 Este se encarga de actualizar los empleados que faltan por entregar
  const onCerrarEmpleadoEntregado = (empleadoEntregado) => {
    const restantes = solicitudSeleccionada.empleados.filter(
      (e) => e.documento !== empleadoEntregado.documento
    );
    if (restantes.length === 0) {
      setSolicitudSeleccionada(null);
      cargarSolicitudes(); // 🔁 Refresca el listado general
    } else {
      setSolicitudSeleccionada({
        ...solicitudSeleccionada,
        empleados: restantes,
      });
    }
  };

  // Mostrar estado de carga inicial
  if (cargando) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos iniciales...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!solicitudSeleccionada ? (
        <>
          <h2 className="text-2xl font-bold mb-6">📦 Entrega de Solicitudes</h2>

          <div className="flex gap-4 mb-6">
            <select
              className="border px-3 py-2 rounded w-1/3"
              value={empresaSeleccionada}
              onChange={manejarCambioEmpresa}
            >
              <option value="">Seleccione empresa</option>
              {empresas.map((emp) => (
                <option key={emp.IdEmpresa} value={emp.IdEmpresa}>
                  {emp.NombreEmpresa}
                </option>
              ))}
            </select>

            <select
              className="border px-3 py-2 rounded w-1/3"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
              disabled={!empresaSeleccionada}
            >
              <option value="">Seleccione sede</option>
              {sedes
                .filter((s) => s.IdEmpresa == empresaSeleccionada)
                .map((s) => (
                  <option key={s.IdSede} value={s.IdSede}>
                    {s.NombreSede}
                  </option>
                ))}
            </select>

            <button
              onClick={cargarSolicitudes}
              disabled={cargandoSolicitudes}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition-all duration-300"
            >
              {cargandoSolicitudes ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>
          </div>

          <table className="min-w-full border rounded shadow text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Empresa</th>
                <th className="p-2 text-left">Sede</th>
                <th className="p-2 text-left">Aprobación</th>
                <th className="p-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr
                  key={sol.id}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-2">{sol.codigoSolicitud}</td>
                  <td className="p-2">{sol.empresa}</td>
                  <td className="p-2">{sol.sede}</td>
                  <td className="p-2">
                    {new Date(sol.fecha_aprobacion).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => setSolicitudSeleccionada(sol)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {solicitudes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">
                    No hay resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <ResumenEntrega
  numeroSolicitud={solicitudSeleccionada.codigoSolicitud}
  empresa={solicitudSeleccionada.empresa}
  sede={solicitudSeleccionada.sede}
  usuario={usuario}
  logo={solicitudSeleccionada.ruta_logo}
  nit={solicitudSeleccionada.NitEmpresa}
  ResumenEntrega={solicitudSeleccionada.empleados ?? []}
  onCerrarEmpleadoEntregado={async () => {
    try {
      const response = await optimizedApi.getCached("/solicitudes-entrega", {
        idEmpresa: solicitudSeleccionada.idEmpresa,
        idSede: solicitudSeleccionada.idSede,
      }, 1 * 60 * 1000); // 1 minuto de caché para solicitudes de entrega

      const solicitudActualizada = response.data.find(
        (s) => s.id === solicitudSeleccionada.id
      );

      if (!solicitudActualizada || solicitudActualizada.empleados.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Solicitud completada",
          text: "Todos los empleados han recibido su dotación.",
        });
        setSolicitudSeleccionada(null);
        cargarSolicitudes(); // 🔄 Refresca listado completo
      } else {
        setSolicitudSeleccionada(solicitudActualizada); // 🔁 Carga solo los no entregados
      }
    } catch (error) {
      console.error("❌ Error recargando solicitud:", error);
      setSolicitudSeleccionada(null);
    }
  }}
/>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setSolicitudSeleccionada(null);
                cargarSolicitudes();
              }}
              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver otras solicitudes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EntregaSolicitud;
