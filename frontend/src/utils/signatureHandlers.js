import { showToast } from './toastUtils';

// Configuración de atributos para buscar datos de firma
const SIGNATURE_ATTRIBUTES = [
  "SigCaptureWeb_MsgAttribute",
  "SigCaptureWeb_ResponseData",
  "SigCaptureWeb_Response", 
  "ePadLink_Response",
  "SignatureData",
  "ResponseData",
  "ePadInk_Response",
  "SignatureCapture_Response"
];

// Eventos de firma para listeners
const SIGNATURE_EVENTS = [
  "SigCaptureWeb_SignResponse",
  "ePadInk_SignResponse",
  "SignatureCapture_Response",
  "ePadInk_Complete",
  "SigCaptureWeb_SendResponseData",
  "SigCaptureWebSigningChromeExtn_Response",
  "SigCaptureWeb_SendResponseData",
  "SigCaptureWebSigningChromeExtn_Response", 
  "ePadLink_SignComplete",
  "ePadLink_Response",
  "SignatureComplete",
  "SignatureCaptured"
];

// Eventos universales para captura de cambios DOM
const UNIVERSAL_EVENTS = [
  'DOMNodeInserted', 
  'DOMAttrModified', 
  'DOMSubtreeModified'
];

/**
 * Busca datos de firma en los atributos de un elemento
 * @param {Element} element - Elemento DOM a buscar
 * @returns {string|null} - Datos de firma encontrados o null
 */
export const buscarDatosFirma = (element) => {
  if (!element || !element.getAttribute) return null;

  // Buscar en atributos específicos primero
  for (const attr of SIGNATURE_ATTRIBUTES) {
    const data = element.getAttribute(attr);
    if (data) {
      console.log(`📝 Datos encontrados en ${attr}:`, data);
      return data;
    }
  }

  // Buscar en todos los atributos si no se encontró
  const attrs = element.getAttributeNames ? element.getAttributeNames() : [];
  for (const attr of attrs) {
    const value = element.getAttribute(attr);
    if (value && value.includes && (value.includes('isSigned') || value.includes('imageData'))) {
      console.log(`🎯 ¡Datos de firma encontrados en ${attr}!`);
      return value;
    }
  }

  return null;
};

/**
 * Procesa datos de firma y ejecuta callback de éxito
 * @param {string} signatureData - Datos de firma en formato JSON
 * @param {Function} onSuccess - Callback a ejecutar en caso de éxito
 * @param {string} source - Fuente de los datos (para logging)
 */
export const procesarDatosFirma = (signatureData, onSuccess, source = 'unknown') => {
  try {
    const obj = JSON.parse(signatureData);
    console.log(`📊 Objeto parseado desde ${source}:`, obj);

    // Verificar diferentes formatos de respuesta
    const isSigned = obj?.isSigned || obj?.signatureData || obj?.signature;
    const imageData = obj.imageData || obj.signatureData || obj.signature;

    if (isSigned && imageData) {
      console.log("✅ Firma confirmada:", isSigned);
      console.log("🖼️ imageData presente:", !!imageData);
      console.log("📏 Tamaño imageData:", imageData.length);

      if (!imageData || typeof imageData !== "string" || imageData.trim() === "") {
        showToast("⚠️ Firma capturada pero sin imagen. Revisa configuración del SDK.", "yellow");
        return;
      }

      let dataURL = imageData;
      if (!dataURL.startsWith("data:image")) {
        dataURL = `data:image/png;base64,${imageData}`;
      }

      onSuccess(dataURL);
    }
  } catch (error) {
    console.log(`⚠️ Error procesando datos de ${source}:`, error.message);
    if (!error.message.includes('runtime.lastError') && !error.message.includes('message channel')) {
      showToast(`❌ Error al procesar firma desde ${source}: ${error.message}`, "red");
    }
  }
};

/**
 * Crea handler principal para eventos de firma
 * @param {Function} onSignatureSuccess - Callback para firma exitosa
 * @returns {Function} - Handler de eventos
 */
export const crearHandlerPrincipal = (onSignatureSuccess) => {
  return (event) => {
    try {
      console.log("📨 Handler principal activado:", event.type, event);
      console.log("🔍 Elemento target:", event.target.tagName, event.target.id);
      
      const signatureData = buscarDatosFirma(event.target);
      
      if (!signatureData) {
        console.log("⚠️ No se encontraron datos de firma en ningún atributo");
        return;
      }

      procesarDatosFirma(signatureData, (dataURL) => {
        onSignatureSuccess(dataURL);
        showToast("✅ Firma capturada correctamente.", "green");
      }, "handler principal");

    } catch (error) {
      console.log("⚠️ Error en handler principal:", error.message);
      if (!error.message.includes('runtime.lastError') && !error.message.includes('message channel')) {
        showToast("❌ Error al procesar firma: " + error.message, "red");
      }
    }
  };
};

/**
 * Crea handler específico para ePad Ink
 * @param {Function} onSignatureSuccess - Callback para firma exitosa
 * @returns {Function} - Handler de eventos
 */
export const crearHandlerInk = (onSignatureSuccess) => {
  return (event) => {
    try {
      console.log("📨 Respuesta de ePad Ink recibida:", event);
      
      const signatureData = buscarDatosFirma(event.target);
      
      if (!signatureData) {
        console.log("⚠️ Sin datos de respuesta ePad Ink");
        return;
      }

      procesarDatosFirma(signatureData, (dataURL) => {
        onSignatureSuccess(dataURL);
        showToast("✅ Firma ePad Ink capturada correctamente.", "green");
      }, "ePad Ink");

    } catch (error) {
      console.log("⚠️ Error en handlerInk:", error.message);
      if (!error.message.includes('runtime.lastError') && !error.message.includes('message channel')) {
        showToast("❌ Error al procesar firma ePad Ink: " + error.message, "red");
      }
    }
  };
};

/**
 * Crea handler global para eventos de firma
 * @param {Function} handlerPrincipal - Handler principal a usar
 * @returns {Function} - Handler global
 */
export const crearHandlerGlobal = (handlerPrincipal) => {
  return (event) => {
    try {
      console.log("🔍 Evento global capturado:", event.type, event);
      if (event.type.includes('SignResponse') || event.type.includes('Response')) {
        handlerPrincipal(event);
      }
    } catch (error) {
      console.log("⚠️ Error en globalHandler (ignorado):", error.message);
    }
  };
};

/**
 * Crea handler universal para capturar cualquier evento con datos de firma
 * @param {Function} handlerPrincipal - Handler principal a usar
 * @returns {Function} - Handler universal
 */
export const crearHandlerUniversal = (handlerPrincipal) => {
  return (event) => {
    console.log("🌍 Evento universal capturado:", event.type);
    
    if (event.target && event.target.getAttribute) {
      const signatureData = buscarDatosFirma(event.target);
      if (signatureData) {
        try {
          const obj = JSON.parse(signatureData);
          if (obj?.isSigned && obj?.imageData) {
            console.log("🎉 ¡FIRMA ENCONTRADA EN EVENTO UNIVERSAL!");
            handlerPrincipal({ target: event.target });
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }
  };
};

/**
 * Configura todos los listeners de firma
 * @param {Function} onSignatureSuccess - Callback para firma exitosa
 * @returns {Function} - Función de limpieza de listeners
 */
export const configurarListenersFirma = (onSignatureSuccess) => {
  const handlerPrincipal = crearHandlerPrincipal(onSignatureSuccess);
  const handlerInk = crearHandlerInk(onSignatureSuccess);
  const globalHandler = crearHandlerGlobal(handlerPrincipal);
  const universalHandler = crearHandlerUniversal(handlerPrincipal);

  // Agregar listeners principales
  document.addEventListener("SigCaptureWeb_SignResponse", handlerPrincipal);
  document.addEventListener("ePadInk_SignResponse", handlerInk);
  document.addEventListener("SignatureCapture_Response", handlerInk);
  document.addEventListener("ePadInk_Complete", handlerInk);
  document.addEventListener("SigCaptureWeb_SendResponseData", handlerPrincipal);
  document.addEventListener("SigCaptureWebSigningChromeExtn_Response", handlerPrincipal);

  // Agregar listeners globales
  SIGNATURE_EVENTS.forEach(evento => {
    document.addEventListener(evento, globalHandler);
    console.log(`👂 Listener agregado para: ${evento}`);
  });

  // Agregar listeners universales
  UNIVERSAL_EVENTS.forEach(evento => {
    document.addEventListener(evento, universalHandler);
  });

  // Configurar polling para elementos con datos de firma
  const intervalId = setInterval(() => {
    const elementos = document.querySelectorAll('[SigCaptureWeb_MsgAttribute]');
    elementos.forEach(elem => {
      const data = elem.getAttribute('SigCaptureWeb_MsgAttribute');
      if (data) {
        try {
          const obj = JSON.parse(data);
          if (obj?.isSigned && obj?.imageData) {
            console.log("🎉 Firma encontrada por polling:", obj);
            clearInterval(intervalId);
            handlerPrincipal({ target: elem });
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    });
  }, 500);

  // Limpiar interval después de 30 segundos
  setTimeout(() => clearInterval(intervalId), 30000);

  // Retornar función de limpieza
  return () => {
    document.removeEventListener("SigCaptureWeb_SignResponse", handlerPrincipal);
    document.removeEventListener("ePadInk_SignResponse", handlerInk);
    document.removeEventListener("SignatureCapture_Response", handlerInk);
    document.removeEventListener("ePadInk_Complete", handlerInk);
    document.removeEventListener("SigCaptureWeb_SendResponseData", handlerPrincipal);
    document.removeEventListener("SigCaptureWebSigningChromeExtn_Response", handlerPrincipal);
    
    SIGNATURE_EVENTS.forEach(evento => {
      document.removeEventListener(evento, globalHandler);
    });
    
    UNIVERSAL_EVENTS.forEach(evento => {
      document.removeEventListener(evento, universalHandler);
    });
  };
};

