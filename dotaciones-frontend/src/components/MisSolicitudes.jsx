import { useEffect, useState } from "react";
import api from "../api/axios";
import ResumenSolicitudVista from "./wizardSolicitud/ResumenSolicitudVista";
import { obtenerEmpresasYSedes } from "../api/utils";
import Swal from "sweetalert2";

const MisSolicitudes = () => {
  const [mensajeError, setMensajeError] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioRes, empresaSedeRes] = await Promise.all([
          api.get("/usuario-autenticado"),
          obtenerEmpresasYSedes(),
        ]);

        setUsuario(usuarioRes.data);
        setEmpresas(empresaSedeRes.empresas);
        setSedes(empresaSedeRes.sedes);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

 const cargarSolicitudes = async () => {
  if (!empresaSeleccionada) {
    Swal.fire({
      icon: "warning",
      title: "Empresa no seleccionada",
      text: "⚠️ Debes seleccionar una empresa para realizar la búsqueda.",
      confirmButtonColor: "#f59e0b" // un amarillo tipo warning
    });
    return;
  }

  try {
    const params = { idEmpresa: empresaSeleccionada };
    if (sedeSeleccionada) {
      params.idSede = sedeSeleccionada;
    }

    const response = await api.get('/mis-solicitudes', { params });
    setSolicitudes(response.data);
  } catch (error) {
    console.error('❌ Error cargando solicitudes:', error);
  }
};


  const verDetalle = async (solicitud) => {
    try {
      const response = await api.get(`/mis-solicitudes/${solicitud.id}`);
      console.log(
        "📦 Datos completos de la solicitud seleccionada:",
        response.data
      );
      setSolicitudSeleccionada(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Error al cargar el detalle:", error);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSolicitudSeleccionada(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📄 Mis Solicitudes</h2>

      {/* Filtros por empresa y sede */}
      <div className="flex gap-4 mb-4">
        <select
          className="border px-3 py-2 rounded w-1/3"
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
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
          className="bg-primario text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>
     
      {/* Tabla de resultados */}
      <table className="min-w-full border rounded shadow text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left"># Solicitud</th>
            <th className="p-2 text-left">Creación</th>
            <th className="p-2 text-left">Actualización</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((sol) => (
            <tr key={sol.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{sol.codigoSolicitud}</td>
              <td className="p-2">
                {new Date(sol.created_at).toLocaleDateString()}
              </td>
              <td className="p-2">
                {new Date(sol.updated_at).toLocaleDateString()}
              </td>
              <td className="p-2">{sol.estadoSolicitud}</td>
              <td className="p-2">
                <button
                  onClick={() => verDetalle(sol)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
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

      {/* Modal con resumen de solicitud */}
      {modalVisible && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-4xl relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
            >
              ✖
            </button>
            <ResumenSolicitudVista
              numeroSolicitud={solicitudSeleccionada.solicitud.codigoSolicitud}
              empresa={solicitudSeleccionada.empresa}
              sede={solicitudSeleccionada.sede}
              usuario={usuario}
              resumenSolicitud={solicitudSeleccionada.detalle ?? []}
              estadoSolicitud={solicitudSeleccionada.solicitud.estadoSolicitud}
              motivoRechazo={solicitudSeleccionada.solicitud.motivoRechazo}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MisSolicitudes;
