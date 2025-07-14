// WizardSolicitudDotacion.jsx
import { useEffect, useState } from "react";
import PasoSeleccionEmpresaSede from "./pasos/PasoSeleccionEmpresaSede";
import PasoAgregarEmpleados from "./pasos/PasoAgregarEmpleados";
import PasoElementosDotacion from "./pasos/PasoElementosDotacion";
import ResumenSolicitud from "./ResumenSolicitud";
import Loader from "../Loader";
import api from "../../api/axios";

const WizardSolicitudDotacion = () => {
  const [cargando, setCargando] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [clavePaso3, setClavePaso3] = useState(0);

  const [idSolicitud, setIdSolicitud] = useState(null);
  const [numeroSolicitud, setNumeroSolicitud] = useState("");
  const [empresa, setEmpresa] = useState(null);
  const [sede, setSede] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [cargoSeleccionado, setCargoSeleccionado] = useState("");
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [elementosEditados, setElementosEditados] = useState(null);
  const [resumenSolicitud, setResumenSolicitud] = useState([]);

  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [formularioVisible, setFormularioVisible] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [empresaSedesRes, usuarioRes] = await Promise.all([
          api.get("/mis-empresas-sedes"),
          api.get("/usuario-autenticado"),
        ]);
        setEmpresas(empresaSedesRes.data.empresas);
        setSedes(empresaSedesRes.data.sedes);
        setUsuario(usuarioRes.data);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const irAlSiguientePaso = () => setPasoActual((prev) => prev + 1);
  const irAlPasoAnterior = () => setPasoActual((prev) => prev - 1);
  const ocultarFormulario = () => setFormularioVisible(false);

  const agregarEmpleadoAResumen = (elementos) => {
    if (!empleadoActual) return;
    const nuevoEmpleado = { ...empleadoActual, elementos };
    setResumenSolicitud((prev) => [...prev, nuevoEmpleado]);
    setElementosEditados(null);
  };

  const agregarOtroEmpleado = () => {
    setEmpleadoActual(null);
    setCargoSeleccionado("");
    setElementosEditados(null);
    setPasoActual(2);
  };

  const modificarEmpleado = (index) => {
  const empleado = resumenSolicitud[index];
  setEmpleadoActual(empleado);
  setCargoSeleccionado(empleado.idCargo || "");
  setElementosEditados(empleado.elementos || []);
  setResumenSolicitud((prev) => prev.filter((_, i) => i !== index));
  setFormularioVisible(true); // 👈 esta es la línea faltante
  setPasoActual(3);
};

  const eliminarEmpleado = (index) => {
    const nuevos = [...resumenSolicitud];
    nuevos.splice(index, 1);
    setResumenSolicitud(nuevos);
  };

  const enviarSolicitudFinal = async () => {
    setCargando(true);
    try {
      console.log('🚀 Iniciando proceso de guardado optimizado...');
      
      // Validaciones previas
      if (!resumenSolicitud || resumenSolicitud.length === 0) {
        throw new Error('No hay empleados para procesar');
      }

      // 1. Crear la solicitud principal
      const response = await api.post("/solicitudes", {
        idUsuario: usuario.idUsuario,
        idEmpresa: empresa.IdEmpresa,
        idSede: sede.IdSede,
        estadoSolicitud: "En revisión",
        fechaSolicitud: new Date().toISOString(),
      });

      const idSol = response.data.idSolicitud;
      const numeroSol = response.data.codigoSolicitud;

      setIdSolicitud(idSol);
      setNumeroSolicitud(numeroSol);

      console.log('✅ Solicitud principal creada:', numeroSol);

      // 2. Procesar empleados en paralelo para mejor rendimiento
      const promesasEmpleados = resumenSolicitud.map(async (emp) => {
        // Crear detalle del empleado
        const responseDetalle = await api.post("/detalle-solicitud-empleado", {
          idSolicitud: idSol,
          nombreEmpleado: emp.nombresEmpleado,
          documentoEmpleado: emp.documentoEmpleado,
          idCargo: emp.idCargo,
          IdTipoSolicitud: emp.IdTipoSolicitud,
          observaciones: emp.observaciones || "",
          EstadoSolicitudEmpleado: "En revisión",
        });

        const idDetalleSolicitud = responseDetalle.data.idDetalleSolicitud;
        emp.idDetalleSolicitud = idDetalleSolicitud;

        // Procesar elementos en batch
        if (Array.isArray(emp.elementos) && emp.elementos.length > 0) {
          const peticionesElementos = emp.elementos.map((elemento) =>
            api.post("/detalle-solicitud-elemento", {
              idDetalleSolicitud,
              idElemento: elemento.idElemento,
              TallaElemento: elemento.talla,
              Cantidad: elemento.cantidad,
            })
          );
          await Promise.all(peticionesElementos);
        }

        // Procesar evidencias en batch (solo si no es solicitud nueva)
        if (
          emp.evidencias &&
          emp.evidencias.length > 0 &&
          emp.IdTipoSolicitud !== 1
        ) {
          const promesasEvidencias = emp.evidencias.map(async (evidencia) => {
            const formData = new FormData();
            formData.append("idSolicitud", idSol);
            formData.append("documentoEmpleado", emp.documentoEmpleado);
            formData.append("nombreEmpresa", empresa.NombreEmpresa);
            formData.append("archivo", evidencia);

            return api.post("/guardar-evidencia", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          });
          
          await Promise.all(promesasEvidencias);
        }

        return emp;
      });

      // Ejecutar todas las promesas de empleados en paralelo
      await Promise.all(promesasEmpleados);

      console.log('✅ Proceso de guardado completado exitosamente');
      return numeroSol;

    } catch (error) {
      console.error(
        "❌ Error global al guardar la solicitud:",
        error.response?.data || error
      );
      alert(
        `❌ Error al guardar la solicitud:\n${error.message || JSON.stringify(error.response?.data?.errors, null, 2)}`
      );
      throw error; // Re-lanzar para que el componente maneje el error
    } finally {
      setResumenSolicitud([]);
      setEmpleadoActual(null);
      setElementosEditados(null);
      setCargoSeleccionado("");
      setIdSolicitud(null);
      setNumeroSolicitud("");
      setPasoActual(1);
      setClavePaso3(0);
      setFormularioVisible(true);
      setCargando(false);
    }
  };

  return (
    <>
      {formularioVisible && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primario">
              🧥 Wizard Solicitud de Dotación
            </h2>
            <p className="text-sm text-gray-500">Paso {pasoActual} de 3</p>
          </div>

          {pasoActual === 1 && (
            <PasoSeleccionEmpresaSede
              empresas={empresas}
              sedes={sedes}
              empresaSeleccionada={empresa}
              setEmpresaSeleccionada={setEmpresa}
              sedeSeleccionada={sede}
              setSedeSeleccionada={setSede}
              usuario={usuario}
              onContinue={({
                idSolicitud,
                numeroSolicitud,
                empresaSeleccionada,
                sedeSeleccionada,
              }) => {
                setIdSolicitud(idSolicitud);
                setNumeroSolicitud(numeroSolicitud);
                setEmpresa(empresaSeleccionada);
                setSede(sedeSeleccionada);
                irAlSiguientePaso();
              }}
            />
          )}

          {pasoActual === 2 && (
            <PasoAgregarEmpleados
              idSolicitud={idSolicitud}
              empresa={empresa}
              sede={sede}
              cargoSeleccionado={cargoSeleccionado}
              setCargoSeleccionado={setCargoSeleccionado}
              onContinue={irAlSiguientePaso}
              // onContinue={() => {
              //   // Esperar a que setEmpleadoActual se complete
              //   setTimeout(() => {
              //     const {
              //       nombresEmpleado,
              //       documentoEmpleado,
              //       IdTipoSolicitud,
              //     } = empleadoActual || {};

              //     if (
              //       !nombresEmpleado?.trim() ||
              //       !documentoEmpleado?.trim() ||
              //       !cargoSeleccionado ||
              //       !IdTipoSolicitud
              //     ) {
              //       alert(
              //         "⚠️ Faltan datos obligatorios: nombre, documento, tipo de solicitud o cargo."
              //       );
              //       return;
              //     }

              //     irAlSiguientePaso();
              //   }, 0);
              // }}
              onBack={irAlPasoAnterior}
              setEmpleadoActual={setEmpleadoActual}
            />
          )}

          {pasoActual === 3 && (
            <PasoElementosDotacion
              key={clavePaso3}
              idEmpresa={empresa?.IdEmpresa}
              idCargo={cargoSeleccionado}
              onBack={() => {
                setClavePaso3((prev) => prev + 1);
                irAlPasoAnterior();
              }}
              onAgregarOtroEmpleado={agregarOtroEmpleado}
              agregarEmpleadoAResumen={agregarEmpleadoAResumen}
              elementosPrecargados={elementosEditados}
              setPasoActual={setPasoActual}
              ocultarFormulario={ocultarFormulario}
            />
          )}
        </div>
      )}

      <ResumenSolicitud
        numeroSolicitud={numeroSolicitud}
        empresa={empresa}
        sede={sede}
        usuario={usuario}
        resumenSolicitud={resumenSolicitud}
        onEnviarSolicitudFinal={enviarSolicitudFinal}
        onModificarEmpleado={modificarEmpleado}
        onEliminarEmpleado={eliminarEmpleado}
      />

      {cargando && <Loader mensaje="Guardando la solicitud por favor espere"/>}
    </>
  );
};

export default WizardSolicitudDotacion;
