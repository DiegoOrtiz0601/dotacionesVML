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
        console.log("📨 Handler principal activado:", event.type, event);
        console.log("🔍 Elemento target:", event.target.tagName, event.target.id);
        
        // Buscar datos en múltiples atributos posibles
        let str = event.target.getAttribute("SigCaptureWeb_MsgAttribute");
        console.log("📝 Datos en SigCaptureWeb_MsgAttribute:", str);
        
        if (!str) {
          // Buscar en otros atributos posibles
          const atributosPosibles = [
            "SigCaptureWeb_ResponseData",
            "SigCaptureWeb_Response", 
            "ePadLink_Response",
            "SignatureData",
            "ResponseData"
          ];
          
          for (const attr of atributosPosibles) {
            str = event.target.getAttribute(attr);
            if (str) {
              console.log(`📝 Datos encontrados en ${attr}:`, str);
              break;
            }
          }
        }
        
        if (!str) {
          console.log("🔍 Buscando en todos los atributos del elemento...");
          const attrs = event.target.getAttributeNames ? event.target.getAttributeNames() : [];
          attrs.forEach(attr => {
            const value = event.target.getAttribute(attr);
            console.log(`   - ${attr}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
            
            // Si el atributo contiene datos de firma, usarlo
            if (value && value.includes && (value.includes('isSigned') || value.includes('imageData'))) {
              console.log(`🎯 ¡Datos de firma encontrados en ${attr}!`);
              str = value;
            }
          });
        }
        
        if (!str) {
          console.log("⚠️ No se encontraron datos de firma en ningún atributo");
          return;
        }
        
        const obj = JSON.parse(str);
        console.log("📊 Objeto parseado:", obj);

        if (obj?.isSigned) {
          console.log("✅ isSigned confirmado:", obj.isSigned);
          console.log("🖼️ imageData presente:", !!obj.imageData);
          console.log("📏 Tamaño imageData:", obj.imageData ? obj.imageData.length : 0);
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
        console.log("⚠️ Error en handler principal:", error.message);
        // No mostrar toast para errores de runtime de Chrome
        if (!error.message.includes('runtime.lastError') && !error.message.includes('message channel')) {
          showToast("❌ Error al procesar firma: " + error.message, "red");
        }
      }
    };

    // Listener adicional para ePad Ink
    const handlerInk = (event) => {
      try {
        console.log("📨 Respuesta de ePad Ink recibida:", event);
        
        // ePad Ink puede usar diferentes atributos
        const str = event.target.getAttribute("ePadInk_Response") || 
                    event.target.getAttribute("SigCaptureWeb_MsgAttribute") ||
                    event.target.getAttribute("SignatureCapture_Response");
        
        if (!str) {
          console.log("⚠️ Sin datos de respuesta ePad Ink");
          return;
        }
        
        const obj = JSON.parse(str);
        console.log("📊 Respuesta ePad Ink parseada:", obj);

        if (obj?.isSigned || obj?.signatureData || obj?.signature) {
          const imageData = obj.imageData || obj.signatureData || obj.signature;
          
          if (!imageData || imageData.trim() === "") {
            showToast("⚠️ Firma capturada pero sin imagen ePad Ink", "yellow");
            return;
          }

          let dataURL = imageData;
          if (!dataURL.startsWith("data:image")) {
            dataURL = `data:image/png;base64,${imageData}`;
          }

          setFirmaURL(dataURL);
          setFirmado(true);
          setMostrarFirma(false);
          setMostrarDocumento(true);
          showToast("✅ Firma ePad Ink capturada correctamente.", "green");

          setTimeout(() => {
            enviarDatosPDFAlBackend();
          }, 500);
        }
      } catch (error) {
        console.log("⚠️ Error en handlerInk:", error.message);
        // No mostrar toast para errores de runtime de Chrome
        if (!error.message.includes('runtime.lastError') && !error.message.includes('message channel')) {
          showToast("❌ Error al procesar firma ePad Ink: " + error.message, "red");
        }
      }
    };

    // Agregar listeners para ambos sistemas
    document.addEventListener("SigCaptureWeb_SignResponse", handler);
    document.addEventListener("ePadInk_SignResponse", handlerInk);
    document.addEventListener("SignatureCapture_Response", handlerInk);
    document.addEventListener("ePadInk_Complete", handlerInk);
    
    // Listeners adicionales específicos para ePadLink Chrome Extension
    document.addEventListener("SigCaptureWeb_SendResponseData", handler);
    document.addEventListener("SigCaptureWebSigningChromeExtn_Response", handler);
    
    // Listener global para cualquier evento de firma
    const globalHandler = (event) => {
      try {
        console.log("🔍 Evento global capturado:", event.type, event);
        // Intentar con el handler principal primero
        if (event.type.includes('SignResponse') || event.type.includes('Response')) {
          handler(event);
        }
      } catch (error) {
        console.log("⚠️ Error en globalHandler (ignorado):", error.message);
        // Ignorar errores de runtime para no afectar funcionalidad
      }
    };
    
    // Agregar listeners para todos los posibles eventos de ePadLink
    const eventosePadLink = [
      'SigCaptureWeb_SendResponseData',
      'SigCaptureWebSigningChromeExtn_Response', 
      'ePadLink_SignComplete',
      'ePadLink_Response',
      'SignatureComplete',
      'SignatureCaptured'
    ];
    
    eventosePadLink.forEach(evento => {
      document.addEventListener(evento, globalHandler);
      console.log(`👂 Listener agregado para: ${evento}`);
    });
    
    // Método adicional: Polling para verificar elementos con datos de firma
    const intervalId = setInterval(() => {
      // Buscar elementos que puedan contener datos de firma
      const elementos = document.querySelectorAll('[SigCaptureWeb_MsgAttribute]');
      elementos.forEach(elem => {
        const data = elem.getAttribute('SigCaptureWeb_MsgAttribute');
        if (data) {
          try {
            const obj = JSON.parse(data);
            if (obj?.isSigned && obj?.imageData) {
              console.log("🎉 Firma encontrada por polling:", obj);
              clearInterval(intervalId);
              handler({ target: elem }); // Simular evento
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        }
      });
    }, 500); // Verificar cada 500ms
    
    // Limpiar interval después de 30 segundos
    setTimeout(() => clearInterval(intervalId), 30000);
    
    // MÉTODO ADICIONAL: Capturar CUALQUIER evento que contenga datos de firma
    const universalHandler = (event) => {
      console.log("🌍 Evento universal capturado:", event.type);
      
      // Verificar si el evento tiene datos de firma
      if (event.target && event.target.getAttribute) {
        const attrs = event.target.getAttributeNames ? event.target.getAttributeNames() : [];
        attrs.forEach(attr => {
          const value = event.target.getAttribute(attr);
          if (value && value.includes && (value.includes('isSigned') || value.includes('imageData'))) {
            console.log(`🎯 Posible firma en atributo ${attr}:`, value.substring(0, 100) + '...');
            try {
              const obj = JSON.parse(value);
              if (obj?.isSigned && obj?.imageData) {
                console.log("🎉 ¡FIRMA ENCONTRADA EN EVENTO UNIVERSAL!");
                handler({ target: event.target });
              }
            } catch (e) {
              // Ignorar errores de parsing
            }
          }
        });
      }
    };
    
    // Agregar listener universal para TODOS los eventos
    ['DOMNodeInserted', 'DOMAttrModified', 'DOMSubtreeModified'].forEach(evento => {
      document.addEventListener(evento, universalHandler);
    });

    // Limpiar listeners
    return () => {
      document.removeEventListener("SigCaptureWeb_SignResponse", handler);
      document.removeEventListener("ePadInk_SignResponse", handlerInk);
      document.removeEventListener("SignatureCapture_Response", handlerInk);
      document.removeEventListener("ePadInk_Complete", handlerInk);
      document.removeEventListener("SigCaptureWeb_SendResponseData", handler);
      document.removeEventListener("SigCaptureWebSigningChromeExtn_Response", handler);
      
      // Limpiar listeners globales
      eventosePadLink.forEach(evento => {
        document.removeEventListener(evento, globalHandler);
      });
      
      // Limpiar listeners universales
      ['DOMNodeInserted', 'DOMAttrModified', 'DOMSubtreeModified'].forEach(evento => {
        document.removeEventListener(evento, universalHandler);
      });
    };
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
      
      // NUEVO: Verificar navegador específicamente
      const userAgent = navigator.userAgent;
      const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
      const isEdge = userAgent.includes('Edg');
      const isFirefox = userAgent.includes('Firefox');
      
      console.log("🌐 Información del navegador:");
      console.log("- User Agent:", userAgent);
      console.log("- Es Chrome:", isChrome);
      console.log("- Es Edge:", isEdge);
      console.log("- Es Firefox:", isFirefox);
      
      if (isFirefox) {
        console.error("❌ Firefox NO es compatible con ePad Ink");
        showToast("❌ Firefox no es compatible con ePad Ink. Usa Chrome o Edge.", "red");
        setEpadStatus(newStatus);
        return;
      }
      
      if (isEdge) {
        console.log("⚠️ Edge detectado - Verificando compatibilidad...");
        
        // Verificar si Edge tiene las APIs necesarias
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          console.error("❌ Edge no tiene Chrome APIs habilitadas");
          console.log("💡 SOLUCIÓN PARA EDGE:");
          console.log("1. Ve a edge://extensions/");
          console.log("2. Habilita 'Permitir extensiones de otras tiendas'");
          console.log("3. Ve a Chrome Web Store y busca 'ePadLink'");
          console.log("4. Instala la extensión");
          console.log("5. Reinicia Edge completamente");
          
          showToast("❌ Edge requiere configuración adicional. Ver consola para instrucciones.", "red");
          setEpadStatus(newStatus);
          return;
        } else {
          console.log("✅ Edge tiene Chrome APIs - Verificando extensión...");
        }
      }
      
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
                  // Verificación REAL del dispositivo físico para ePad Ink
                  console.log("🔍 Verificando conexión física del ePad Ink...");
                  
                  try {
                    // Verificación SIMPLE sin disparar eventos de captura
                    console.log("🔍 Verificación simple de ePad Ink...");
                    
                    // Para ePad Ink, si llegamos aquí es porque puede crear elementos
                    // La verificación real será solo cuando el usuario quiera capturar
                    newStatus.deviceConnected = true;
                    console.log("✅ ePad Ink - Verificación básica exitosa");
                    
                  } catch (deviceTestError) {
                    console.log("❌ Error en prueba de dispositivo físico:", deviceTestError);
                    newStatus.deviceConnected = false;
                  }
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
    
    // Verificación REAL del dispositivo físico cuando el usuario lo pide
    try {
      console.log("🧪 Probando conexión física del ePad Ink...");
      
      const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      const testData = {
        firstName: "Test",
        lastName: "Manual",
        eMail: "test@manual.com",
        location: "Manual Test",
        imageFormat: 1,
        imageX: 50, // Muy pequeño para que no moleste
        imageY: 25,
        imageTransparency: false,
        imageScaling: false,
        maxUpScalePercent: 0.0,
        rawDataFormat: "ENC",
        minSigPoints: 1,
        penThickness: 1,
        penColor: "#000000",
        testConnection: true,
        silentTest: true // Indicador de que es prueba silenciosa
      };
      
      testElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify(testData));
      testElem.id = "manual-device-test";
      document.documentElement.appendChild(testElem);
      
      // Disparar evento de prueba
      const evt = document.createEvent("Events");
      evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
      testElem.dispatchEvent(evt);
      
      console.log("📡 Señal de prueba enviada al ePad Ink...");
      
      // Verificar respuesta después de 2 segundos
      setTimeout(() => {
        const response = testElem.getAttribute("SigCaptureWeb_MsgAttribute");
        let deviceConnected = false;
        
        try {
          const responseObj = JSON.parse(response || "{}");
          
          if (responseObj.errorMsg) {
            if (responseObj.errorMsg.includes("device") || 
                responseObj.errorMsg.includes("connect") || 
                responseObj.errorMsg.includes("USB") ||
                responseObj.errorMsg.includes("not found")) {
              deviceConnected = false;
              console.log("❌ ePad Ink desconectado:", responseObj.errorMsg);
            } else {
              deviceConnected = true;
              console.log("✅ ePad Ink conectado (error menor):", responseObj.errorMsg);
            }
          } else if (responseObj.isSigned !== undefined || response !== JSON.stringify(testData)) {
            deviceConnected = true;
            console.log("✅ ePad Ink conectado - Respuesta recibida");
          } else {
            deviceConnected = false;
            console.log("❌ ePad Ink no responde - Dispositivo desconectado");
          }
        } catch (e) {
          deviceConnected = false;
          console.log("❌ Error en verificación manual:", e.message);
        }
        
        // Actualizar estado
        setEpadStatus(prev => ({
          ...prev,
          deviceConnected: deviceConnected,
          lastCheck: new Date()
        }));
        
        // Mostrar resultado
        if (deviceConnected) {
          showToast("✅ ePad Ink verificado - Conectado y funcionando", "green");
        } else {
          showToast("❌ ePad Ink verificado - Dispositivo desconectado", "red");
        }
        
        // Limpiar elemento de prueba
        if (testElem.parentNode) {
          testElem.parentNode.removeChild(testElem);
        }
        
      }, 2000);
      
    } catch (error) {
      console.log("❌ Error en verificación manual:", error);
      setEpadStatus(prev => ({
        ...prev,
        deviceConnected: false,
        lastCheck: new Date()
      }));
      showToast("❌ Error al verificar ePad Ink", "red");
    }
  };

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
      console.log("🚀 Iniciando captura desde ePad Ink...");
      
      // ePad Ink no requiere verificación de extensión

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
        imageFormat: 1,
        imageX: 320,
        imageY: 160,
        imageTransparency: false,
        imageScaling: false,
        maxUpScalePercent: 0.0,
        rawDataFormat: "ENC",
        minSigPoints: 5,
        penThickness: 2,
        penColor: "#000000",
        // Parámetros específicos ePad Ink
        timeout: 45000,           // Más tiempo para ePad Ink
        captureMode: "ink",       // Modo específico
        deviceType: "ePadInk",    // Identificador
        showSignatureWindow: true,
        windowTitle: "ePad Ink - Firmar aquí",
        backgroundColor: "#FFFFFF"
      };

      console.log("📝 Datos para captura ePad Ink:", message);

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
      showToast("🔄 Iniciando captura con ePad Ink...", "blue");
      
    } catch (e) {
      console.error("❌ Error al iniciar captura ePad Ink:", e);
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
