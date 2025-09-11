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
  const [epadStatus, setEpadStatus] = useState({
    extensionInstalled: false,
    serviceAvailable: false,
    deviceConnected: false,
    lastCheck: null,
    isChecking: false
  });

  useEffect(() => {
    const handler = (event) => {
      try {
        const str = event.target.getAttribute("SigCaptureWeb_MsgAttribute");
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

  // Verificación inicial al cargar el componente
  useEffect(() => {
    const initialCheck = setTimeout(() => {
      verificarEstadoEPad();
    }, 1000);
    
    return () => clearTimeout(initialCheck);
  }, []);

  // Función para verificar el estado completo del ePad
  const verificarEstadoEPad = async () => {
    if (epadStatus.isChecking) return; // Evitar verificaciones simultáneas
    
    setEpadStatus(prev => ({ ...prev, isChecking: true }));
    
    const newStatus = {
      extensionInstalled: false,
      serviceAvailable: false,
      deviceConnected: false,
      lastCheck: new Date(),
      isChecking: false
    };

    try {
      console.log("🔍 Iniciando verificación del ePad...");
      
      // 1. Verificar si la extensión está instalada (múltiples métodos)
      let extensionInstalled = false;
      let detectionMethod = "";
      
      // Método 1: Atributo en documentElement
      const attrValue = document.documentElement.getAttribute("SigCaptureWebExtension-installed");
      if (attrValue === "true" || attrValue === true) {
        extensionInstalled = true;
        detectionMethod = "atributo documentElement";
      }
      
      // Método 2: Verificar si existe el objeto global
      if (!extensionInstalled && typeof window.SigCaptureWeb !== 'undefined') {
        extensionInstalled = true;
        detectionMethod = "objeto global SigCaptureWeb";
      }
      
      // Método 3: Verificar si se pueden crear elementos específicos
      if (!extensionInstalled) {
        try {
          const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
          if (testElem && testElem.tagName === "SIGCAPTUREWEB_EXTNDATAELEM") {
            extensionInstalled = true;
            detectionMethod = "creación de elemento";
          }
        } catch (e) {
          console.log("🔍 No se pudo crear elemento de prueba:", e.message);
        }
      }
      
      // Método 4: Verificar si hay scripts de la extensión cargados
      if (!extensionInstalled) {
        const scripts = document.querySelectorAll('script[src*="websigner"], script[src*="SigCapture"]');
        if (scripts.length > 0) {
          extensionInstalled = true;
          detectionMethod = "scripts cargados";
        }
      }
      
      newStatus.extensionInstalled = extensionInstalled;
      console.log("📦 Extensión instalada:", extensionInstalled, "Método:", detectionMethod);
      console.log("🔍 Atributo documentElement:", attrValue);
      console.log("🔍 Objeto SigCaptureWeb:", typeof window.SigCaptureWeb);
      console.log("🔍 Scripts encontrados:", document.querySelectorAll('script[src*="websigner"], script[src*="SigCapture"]').length);

      if (!extensionInstalled) {
        console.warn("❌ Extensión WebSigner no detectada con ningún método");
        console.log("💡 Sugerencia: Visita http://localhost:8000/instalar-websigner.html para instrucciones de instalación");
        setEpadStatus(newStatus);
        return;
      }

      // 2. Verificar si el servicio está disponible
      try {
        const serviceResponse = await fetch('http://localhost:8000/epad.js', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        newStatus.serviceAvailable = true;
        console.log("✅ Servicio ePad disponible");
      } catch (error) {
        console.warn("❌ Servicio ePad no disponible:", error);
        newStatus.serviceAvailable = false;
      }

      // 3. Verificar si el dispositivo está conectado
      if (newStatus.serviceAvailable) {
        try {
          // Verificación simple pero efectiva: verificar si la extensión responde
          const extensionInstalled = document.documentElement.getAttribute("SigCaptureWebExtension-installed");
          
          if (extensionInstalled === "true") {
            // Verificar si podemos crear elementos del ePad
            try {
              const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
              testElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify({
                test: true,
                firstName: "Test",
                lastName: "User"
              }));
              
              // Verificar si el elemento se creó correctamente
              if (testElem && testElem.getAttribute("SigCaptureWeb_MsgAttribute")) {
                // Verificación adicional: intentar acceder a propiedades específicas del ePad
                const hasEpadSupport = typeof window.SigCaptureWeb !== 'undefined' || 
                                     document.documentElement.hasAttribute("SigCaptureWebExtension-installed");
                
                if (hasEpadSupport) {
                  newStatus.deviceConnected = true;
                  console.log("✅ Dispositivo ePad conectado y respondiendo");
                } else {
                  newStatus.deviceConnected = false;
                  console.warn("❌ ePad no tiene soporte completo");
                }
              } else {
                newStatus.deviceConnected = false;
                console.warn("❌ No se pudo crear elemento de prueba");
              }
              
              // Limpiar elemento de prueba
              if (testElem.parentNode) {
                testElem.parentNode.removeChild(testElem);
              }
            } catch (elemError) {
              console.warn("❌ Error creando elemento de prueba:", elemError);
              newStatus.deviceConnected = false;
            }
          } else {
            newStatus.deviceConnected = false;
            console.warn("❌ Extensión no está activa");
          }
        } catch (error) {
          console.warn("❌ Error verificando dispositivo:", error);
          newStatus.deviceConnected = false;
        }
      }

    } catch (error) {
      console.error("❌ Error verificando estado del ePad:", error);
    }

    // Detectar cambios de estado
    const wasConnected = epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected;
    const isConnected = newStatus.extensionInstalled && newStatus.serviceAvailable && newStatus.deviceConnected;

    if (wasConnected && !isConnected) {
      console.warn("❌ ePad desconectado");
      showToast("⚠️ ePad desconectado", "yellow");
    } else if (!wasConnected && isConnected) {
      console.log("✅ ePad conectado");
      showToast("✅ ePad conectado", "green");
    }

    console.log("📊 Estado final del ePad:", {
      extension: newStatus.extensionInstalled,
      service: newStatus.serviceAvailable,
      device: newStatus.deviceConnected,
      connected: isConnected
    });

    setEpadStatus(newStatus);
  };

  // Función para verificación manual
  const verificarManualmente = async () => {
    console.log("🔄 Verificación manual iniciada...");
    await verificarEstadoEPad();
    
    // Esperar un momento para que se actualice el estado
    setTimeout(() => {
      const isConnected = epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected;
      
      if (isConnected) {
        showToast("✅ ePad verificado - Conectado y funcionando", "green");
      } else if (epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected) {
        showToast("⚠️ ePad verificado - Servicio disponible pero dispositivo desconectado", "yellow");
      } else if (epadStatus.extensionInstalled && !epadStatus.serviceAvailable) {
        showToast("⚠️ ePad verificado - Extensión instalada pero servicio no disponible", "yellow");
      } else {
        showToast("❌ ePad verificado - Extensión no instalada", "red");
      }
    }, 500);
  };

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
      console.log("🚀 Iniciando captura desde ePad...");
      
      // Verificar que la extensión esté instalada
      if (!epadStatus.extensionInstalled) {
        showToast("❌ Extensión WebSigner no está instalada", "red");
        return;
      }

      // Verificar que el empleado esté seleccionado
      if (!empleadoSeleccionado) {
        showToast("❌ No hay empleado seleccionado", "red");
        return;
      }

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

      console.log("📝 Datos para captura:", message);

      // Crear elemento con el mensaje
      const dataElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      dataElem.setAttribute(
        "SigCaptureWeb_MsgAttribute",
        JSON.stringify(message)
      );
      
      // Agregar al DOM
      document.documentElement.appendChild(dataElem);
      console.log("📦 Elemento creado y agregado al DOM");

      // Crear y lanzar el evento de captura
      const evt = document.createEvent("Events");
      evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
      dataElem.dispatchEvent(evt);
      
      console.log("🎯 Evento de captura disparado");
      showToast("🔄 Iniciando captura de firma...", "blue");
      
    } catch (e) {
      console.error("❌ Error al iniciar captura:", e);
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
      
      {/* Indicador de estado del ePad en tiempo real */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 border rounded">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected ? 'bg-green-500 animate-pulse' :
            epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected ? 'bg-yellow-500 animate-pulse' :
            epadStatus.extensionInstalled && !epadStatus.serviceAvailable ? 'bg-red-500' :
            epadStatus.extensionInstalled ? 'bg-blue-500 animate-pulse' :
            'bg-gray-500'
          }`}></div>
          <span className="text-sm font-medium">
            Estado del ePad: {
              epadStatus.isChecking ? 'Verificando...' :
              epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected ? 'Conectado' :
              epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected ? 'Desconectado' :
              epadStatus.extensionInstalled && !epadStatus.serviceAvailable ? 'Servicio no disponible' :
              epadStatus.extensionInstalled ? 'Verificando...' :
              'Extensión no instalada'
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          {epadStatus.lastCheck && (
            <span className="text-xs text-gray-500">
              Última verificación: {epadStatus.lastCheck.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={verificarManualmente}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          >
            🔄 Verificar
          </button>
        </div>
      </div>

      {/* Estado: Extensión no instalada */}
      {!epadStatus.extensionInstalled && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <div className="flex-1">
              <strong>Extensión WebSigner no instalada</strong>
              <p className="text-sm mt-1">
                La extensión del navegador no está instalada o está deshabilitada.
                Instala la extensión WebSigner para usar el ePad.
              </p>
              <div className="mt-3 flex gap-2">
                <a 
                  href="http://localhost:8000/instalar-websigner.html" 
                  target="_blank"
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-all duration-300"
                >
                  📖 Ver guía de instalación
                </a>
                <a 
                  href="http://localhost:8000/test-epad.html" 
                  target="_blank"
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-all duration-300"
                >
                  🧪 Probar ePad
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado: Extensión instalada pero servicio no disponible */}
      {epadStatus.extensionInstalled && !epadStatus.serviceAvailable && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <strong>Servicio ePad no disponible</strong>
              <p className="text-sm mt-1">
                La extensión está instalada, pero el servicio de ePad en http://localhost:8000/epad.js no está corriendo.
                Verifica que el servidor esté iniciado y accesible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado: Servicio disponible pero dispositivo no conectado */}
      {epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected && (
        <div className="mb-4 p-4 bg-orange-100 text-orange-800 border border-orange-300 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔌</span>
            <div>
              <strong>ePad desconectado</strong>
                              <p className="text-sm mt-1">
                  El servicio está corriendo, pero el ePad no está conectado físicamente o no responde.
                  Verifica la conexión USB y el estado del dispositivo.
                </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado: Todo conectado y funcionando */}
      {epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div>
              <strong>ePad conectado y funcionando</strong>
              <p className="text-sm mt-1">
                WebSigner está activo y listo para capturar firmas.
              </p>
            </div>
          </div>
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
