import React, { useState, useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../../api/axios";
import trimCanvas from "trim-canvas";
import ModalFirma from "./ModalFirma";
import ModalDocumentoEntrega from "./ModalDocumentoEntrega";
import ModalPDFResultado from "./ModalPDFResultado";
import Encabezado from "./Encabezado";
import ResumenEmpleado from "./ResumenEmpleado";
import EPadStatusIndicator from "../EPadStatusIndicator";
import QRSignatureModal from "../QRSignatureModal";
import { useEPadStatus } from "../../hooks/useEPadStatus";
import { configurarListenersFirma } from "../../utils/signatureHandlers";
import { ePadService } from "../../services/ePadService";
import { showToast } from "../../utils/toastUtils";
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
  const [mostrarQRModal, setMostrarQRModal] = useState(false);

  // Hook personalizado para manejo del estado del ePad
  const {
    epadStatus,
    verificarEstadoEPad,
    verificarManualmente,
    getStatusText,
    getStatusColor
  } = useEPadStatus();

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

  const enviarDatosPDFAlBackend = useCallback(async () => {
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
  }, [firmaURL, empleadoSeleccionado, logo, numeroSolicitud, empresa, sede, nit]);

  // Configurar listeners de firma usando el módulo de utilidades
  useEffect(() => {
    const onSignatureSuccess = (dataURL) => {
      setFirmaURL(dataURL);
      setFirmado(true);
      setMostrarFirma(false);
      setMostrarDocumento(true);
      
      setTimeout(() => {
        enviarDatosPDFAlBackend();
      }, 500);
    };

    // Configurar todos los listeners usando el módulo
    const cleanup = configurarListenersFirma(onSignatureSuccess);

    // Limpiar listeners al desmontar
    return cleanup;
  }, []); // Remover dependencia para evitar referencia circular

  const toggleEmpleado = (index) => {
    setDesplegado((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const mostrarModalFirma = (emp) => {
    setEmpleadoSeleccionado(emp);
    setFirmado(false);
    setFirmaURL("");
    setMostrarFirma(false); // NO abrir modal de firma primero
    setMostrarDocumento(true); // Mostrar documento PRIMERO para que lea
    console.log("📄 Mostrando documento para lectura antes de firmar");
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

  const capturarFirmaDesdeEPAD = () => {
    console.log("🔍 capturarFirmaDesdeEPAD llamada");
    console.log("📋 empleadoSeleccionado:", empleadoSeleccionado);
    console.log("🏢 sede:", sede);
    console.log("📊 epadStatus:", epadStatus);
    
      if (!empleadoSeleccionado) {
        showToast("❌ No hay empleado seleccionado", "red");
        return;
      }

    ePadService.iniciarCapturaFirma(empleadoSeleccionado, sede);
  };

  /**
   * Manejar firma QR exitosa
   */
  const handleQRSignatureSuccess = useCallback((signatureData) => {
    console.log("✅ Firma QR recibida:", signatureData);
    setFirmaURL(signatureData);
    setFirmado(true);
    setMostrarFirma(false);
    setMostrarDocumento(true);
    setMostrarQRModal(false);
    
    // Generar PDF automáticamente después de un breve delay
    setTimeout(() => {
      enviarDatosPDFAlBackend();
    }, 500);
  }, [enviarDatosPDFAlBackend]);

  /**
   * Abrir modal de firma QR
   */
  const abrirModalQR = () => {
    if (!empleadoSeleccionado) {
      showToast("❌ No hay empleado seleccionado", "red");
      return;
    }
    setMostrarQRModal(true);
  };

  /**
   * Cerrar modal de firma QR
   */
  const cerrarModalQR = () => {
    setMostrarQRModal(false);
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
      
      {/* Indicador de estado del ePad usando componente modular */}
      <EPadStatusIndicator 
        epadStatus={epadStatus}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
        verificarManualmente={verificarManualmente}
      />

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
          abrirModalQR={abrirModalQR}
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

      {/* Modal de Firma QR */}
      <QRSignatureModal
        isOpen={mostrarQRModal}
        onClose={cerrarModalQR}
        onSuccess={handleQRSignatureSuccess}
        empleado={empleadoSeleccionado}
        solicitud={{
          numeroSolicitud,
          empresa,
          sede,
          id: numeroSolicitud
        }}
        tipoDocumento="entrega"
        expirationMinutes={5}
      />
    </div>
  );
};

export default ResumenEntrega;
