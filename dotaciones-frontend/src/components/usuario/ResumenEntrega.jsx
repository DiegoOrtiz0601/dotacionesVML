import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../../api/axios";
import trimCanvas from "trim-canvas";
import ModalFirma from "./ModalFirma";
import ModalDocumentoEntrega from "./ModalDocumentoEntrega";
import ModalPDFResultado from "./ModalPDFResultado";
import Encabezado from "./Encabezado";
import ResumenEmpleado from "./ResumenEmpleado";
import Swal from "sweetalert2";

const ResumenEntrega = ({
  numeroSolicitud,
  empresa,
  sede,
  usuario,
  ResumenEntrega = [],
  logo,
  nit,
  onCerrarEmpleadoEntregado,
}) => {
  const [desplegado, setDesplegado] = useState({});
  const [mostrarFirma, setMostrarFirma] = useState(false);
  const [firmado, setFirmado] = useState(false);
  const sigCanvasRef = useRef(null);
  const [firmaURL, setFirmaURL] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarDocumento, setMostrarDocumento] = useState(false);
  const [grosorFirma, setGrosorFirma] = useState(1.5);
  const [colorFirma, setColorFirma] = useState("#000000");
  const [cargandoPDF, setCargandoPDF] = useState(false);
  const [modalPDF, setModalPDF] = useState(null);
  const [modoFirma, setModoFirma] = useState("canvas");
  const [webSignerDisponible, setWebSignerDisponible] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      try {
        const str = event.target.getAttribute("SigCaptureWeb_msgAttri");
        const obj = JSON.parse(str);

        if (obj?.isSigned) {
          if (
            !obj.imageData ||
            typeof obj.imageData !== "string" ||
            obj.imageData.trim() === ""
          ) {
            showToast(
              "⚠️ Firma capturada pero sin imagen. Revisa configuración del SDK.",
              "yellow"
            );
            return;
          }

          let dataURL = obj.imageData;
          if (!dataURL.startsWith("data:image")) {
            dataURL = `data:image/png;base64,${dataURL}`;
          }

          setFirmaURL(dataURL);
          setFirmado(true);
          setMostrarFirma(false);
          setMostrarDocumento(true);
          showToast("✅ Firma capturada correctamente.", "green");

          setTimeout(() => {
            enviarDatosPDFAlBackend();
          }, 500);
        } 
      } catch (error) {
        showToast("❌ Error al procesar firma: " + error.message, "red");
      }
    };

    document.addEventListener("SigCaptureWeb_SignResponse", handler);
    return () =>
      document.removeEventListener("SigCaptureWeb_SignResponse", handler);
  }, []);

  useEffect(() => {
    const verificarExtension = () => {
      const installed = document.documentElement.getAttribute(
        "SigCaptureWebExtension-installed"
      );
      setWebSignerDisponible(!!installed);
      if (!installed) {
        console.warn(
          "❌ ePadLink Extension no está instalada o está deshabilitada."
        );
      }
    };

    setTimeout(verificarExtension, 1000);
  }, []);

  const toggleEmpleado = (index) => {
    setDesplegado((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const mostrarModalFirma = (emp) => {
    setEmpleadoSeleccionado(emp);
    setFirmado(false);
    setFirmaURL("");
    setMostrarFirma(true); // solo abrimos el modal de firma
  };

  const limpiarFirma = () => sigCanvasRef.current?.clear();

  const guardarFirma = () => {
    const trimmed = trimCanvas(sigCanvasRef.current.getCanvas());
    const dataURL = trimmed.toDataURL("image/png");
    setFirmaURL(dataURL);
    setFirmado(true);
    setMostrarFirma(false);
    setMostrarDocumento(true);
    showToast("✅ Firma guardada exitosamente.", "green");
  };

  const showToast = (msg, color = "blue") => {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.className = `fixed bottom-4 right-4 bg-${color}-600 text-white px-4 py-2 rounded shadow z-50 animate-bounce`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const enviarDatosPDFAlBackend = async () => {
    if (!firmaURL || !empleadoSeleccionado?.documento) {
      showToast("⚠️ Falta la firma o el empleado seleccionado.", "yellow");
      return;
    }

    try {
      setCargandoPDF(true);
      const logoBase64 = logo ? await getBase64FromUrl(logo) : null;

      const payload = {
        content: JSON.stringify({
          numeroSolicitud,
          empresa,
          sede,
          nit,
          firma: firmaURL,
          logo: logoBase64,
          empleado: empleadoSeleccionado,
        }),
      };

      const response = await api.post("/generar-pdf-entrega", payload);
      const url = response.data.url;

      if (!url) {
        showToast("❌ No se pudo generar el enlace de descarga.", "red");
        return;
      }

      setModalPDF({
        url,
        mensaje:
          "✅ Archivo generado correctamente. Puede descargar o salir del acta.",
      });
    } catch (error) {
      console.error("❌ Error al generar el PDF:", error);
      if (error.response?.status === 422) {
        const errores = error.response.data?.detalles || {};
        showToast(
          "⚠️ Datos incompletos: " + Object.values(errores).flat().join(", "),
          "yellow"
        );
      } else {
        showToast("❌ Error inesperado al generar el PDF.", "red");
      }
    } finally {
      setCargandoPDF(false);
    }
  };

  const capturarFirmaDesdeEPAD = () => {
    try {
      const message = {
        firstName: empleadoSeleccionado?.nombre || "",
        lastName: empleadoSeleccionado?.apellido || "",
        eMail: "",
        location: sede,
        imageFormat: 2,
        imageX: 300,
        imageY: 150,
        imageTransparency: false,
        imageScaling: false,
        maxUpScalePercent: 0.0,
        rawDataFormat: "ENC",
        minSigPoints: 25,
        penThickness: 3,
        penColor: "#000000",
      };

      // Crear elemento con el mensaje
      const dataElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      dataElem.setAttribute(
        "SigCaptureWeb_MsgAttribute",
        JSON.stringify(message)
      );
      document.documentElement.appendChild(dataElem);

      // Crear y lanzar el evento de captura
      const evt = document.createEvent("Events");
      evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
      dataElem.dispatchEvent(evt);
    } catch (e) {
      showToast("❌ Error al iniciar captura: " + e.message, "red");
    }
  };
  const cerrarDocumento = () => {
    setMostrarDocumento(false);
    if (typeof onCerrarEmpleadoEntregado === "function") {
      onCerrarEmpleadoEntregado(); // 🔄 Notificar a EntregaSolicitud que recargue empleados
    }
  };

  const confirmarEntregaEmpleado = () => {
    if (typeof onCerrarEmpleadoEntregado === "function") {
      onCerrarEmpleadoEntregado(empleadoSeleccionado);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white border rounded shadow text-justify text-sm leading-[1.15]">
      <Encabezado logo={logo} empresa={empresa} sede={sede} />

      {webSignerDisponible === false && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
          ⚠️ WebSigner no está disponible. Verifica que el servicio esté
          corriendo en <code>http://localhost:8000/epad.js</code>.
        </div>
      )}

      {webSignerDisponible === true && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded">
          ✅ WebSigner está activo y listo para capturar firmas.
        </div>
      )}

      {Array.isArray(ResumenEntrega) &&
        ResumenEntrega.map((emp, index) => (
          <ResumenEmpleado
            key={index}
            emp={emp}
            index={index}
            desplegado={desplegado}
            toggleEmpleado={toggleEmpleado}
            mostrarModalFirma={mostrarModalFirma}
          />
        ))}

      {mostrarFirma && (
        <ModalFirma
          modoFirma={modoFirma}
          setModoFirma={setModoFirma}
          grosorFirma={grosorFirma}
          setGrosorFirma={setGrosorFirma}
          colorFirma={colorFirma}
          setColorFirma={setColorFirma}
          sigCanvasRef={sigCanvasRef}
          limpiarFirma={limpiarFirma}
          guardarFirma={guardarFirma}
          capturarFirmaDesdeEPAD={capturarFirmaDesdeEPAD}
          setMostrarFirma={setMostrarFirma}
        />
      )}

      {mostrarDocumento && (
        <ModalDocumentoEntrega
          logo={logo}
          empresa={empresa}
          nit={nit}
          empleadoSeleccionado={empleadoSeleccionado}
          firmado={firmado}
          firmaURL={firmaURL}
          setMostrarDocumento={cerrarDocumento}
          setMostrarFirma={setMostrarFirma}
          enviarDatosPDFAlBackend={enviarDatosPDFAlBackend}
        />
      )}

      <ModalPDFResultado
        modalPDF={modalPDF}
        setModalPDF={setModalPDF}
        confirmarEntregaEmpleado={() => {
          if (typeof onCerrarEmpleadoEntregado === "function") {
            onCerrarEmpleadoEntregado(empleadoSeleccionado);
          }
        }}
      />
    </div>
  );
};

export default ResumenEntrega;
