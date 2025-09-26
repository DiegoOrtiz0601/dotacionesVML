import { showToast } from '../utils/toastUtils';

/**
 * Servicio para manejo de comunicación y verificación con ePad
 */
class EPadService {
  constructor() {
    this.serviceUrl = 'http://localhost:8000/epad.js';
  }

  /**
   * Detecta el tipo de navegador
   * @returns {Object} - Información del navegador
   */
  detectarNavegador() {
    const userAgent = navigator.userAgent;
    return {
      userAgent,
      isChrome: userAgent.includes('Chrome') && !userAgent.includes('Edg'),
      isEdge: userAgent.includes('Edg'),
      isFirefox: userAgent.includes('Firefox')
    };
  }

  /**
   * Verifica si Firefox es compatible
   * @returns {boolean} - true si es compatible
   */
  verificarCompatibilidadFirefox() {
    const { isFirefox } = this.detectarNavegador();
    
    if (isFirefox) {
      console.error("❌ Firefox NO es compatible con ePad Ink");
      showToast("❌ Firefox no es compatible con ePad Ink. Usa Chrome o Edge.", "red");
      return false;
    }
    
    return true;
  }

  /**
   * Verifica compatibilidad de Edge
   * @returns {boolean} - true si es compatible
   */
  verificarCompatibilidadEdge() {
    const { isEdge } = this.detectarNavegador();
    
    if (isEdge) {
      console.log("⚠️ Edge detectado - Verificando compatibilidad...");
      
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.error("❌ Edge no tiene Chrome APIs habilitadas");
        console.log("💡 SOLUCIÓN PARA EDGE:");
        console.log("1. Ve a edge://extensions/");
        console.log("2. Habilita 'Permitir extensiones de otras tiendas'");
        console.log("3. Ve a Chrome Web Store y busca 'ePadLink'");
        console.log("4. Instala la extensión");
        console.log("5. Reinicia Edge completamente");
        
        showToast("❌ Edge requiere configuración adicional. Ver consola para instrucciones.", "red");
        return false;
      } else {
        console.log("✅ Edge tiene Chrome APIs - Verificando extensión...");
        return true;
      }
    }
    
    return true;
  }

  /**
   * Verifica si la extensión está instalada usando múltiples métodos
   * @returns {Object} - {installed: boolean, method: string}
   */
  verificarExtensionInstalada() {
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

    console.log("📦 Extensión instalada:", extensionInstalled, "Método:", detectionMethod);
    console.log("🔍 Atributo documentElement:", attrValue);
    console.log("🔍 Objeto SigCaptureWeb:", typeof window.SigCaptureWeb);
    console.log("🔍 Scripts encontrados:", document.querySelectorAll('script[src*="websigner"], script[src*="SigCapture"]').length);

    return { installed: extensionInstalled, method: detectionMethod };
  }

  /**
   * Verifica si el servicio está disponible
   * @returns {Promise<boolean>} - true si está disponible
   */
  async verificarServicioDisponible() {
    try {
      const serviceResponse = await fetch(this.serviceUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log("✅ Servicio ePad disponible");
      return true;
    } catch (error) {
      console.warn("❌ Servicio ePad no disponible:", error);
      return false;
    }
  }

  /**
   * Verifica si el dispositivo está conectado
   * @returns {Promise<boolean>} - true si está conectado
   */
  async verificarDispositivoConectado() {
    try {
      const extensionInstalled = document.documentElement.getAttribute("SigCaptureWebExtension-installed");
      
      if (extensionInstalled !== "true") {
        console.warn("❌ Extensión no está activa");
        return false;
      }

      // Verificar si podemos crear elementos del ePad
      const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      testElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify({
        test: true,
        firstName: "Test",
        lastName: "User"
      }));

      if (!testElem || !testElem.getAttribute("SigCaptureWeb_MsgAttribute")) {
        console.warn("❌ No se pudo crear elemento de prueba");
        return false;
      }

      // Verificación adicional: intentar acceder a propiedades específicas del ePad
      const hasEpadSupport = typeof window.SigCaptureWeb !== 'undefined' || 
                           document.documentElement.hasAttribute("SigCaptureWebExtension-installed");
      
      if (!hasEpadSupport) {
        console.warn("❌ ePad no tiene soporte completo");
        return false;
      }

      // Para ePad Ink, si llegamos aquí es porque puede crear elementos
      console.log("✅ ePad Ink - Verificación básica exitosa");
      
      // Limpiar elemento de prueba
      if (testElem.parentNode) {
        testElem.parentNode.removeChild(testElem);
      }

      return true;
    } catch (error) {
      console.warn("❌ Error verificando dispositivo:", error);
      return false;
    }
  }

  /**
   * Verifica el estado completo del ePad
   * @returns {Promise<Object>} - Estado completo del ePad
   */
  async verificarEstadoCompleto() {
    console.log("🔍 Iniciando verificación del ePad...");
    
    const browserInfo = this.detectarNavegador();
    console.log("🌐 Información del navegador:", browserInfo);

    // Verificar compatibilidad del navegador
    if (!this.verificarCompatibilidadFirefox()) {
      return {
        extensionInstalled: false,
        serviceAvailable: false,
        deviceConnected: false,
        lastCheck: new Date(),
        isChecking: false
      };
    }

    if (!this.verificarCompatibilidadEdge()) {
      return {
        extensionInstalled: false,
        serviceAvailable: false,
        deviceConnected: false,
        lastCheck: new Date(),
        isChecking: false
      };
    }

    // Verificar extensión
    const extensionStatus = this.verificarExtensionInstalada();
    if (!extensionStatus.installed) {
      console.warn("❌ Extensión WebSigner no detectada con ningún método");
      console.log("💡 Sugerencia: Visita http://localhost:8000/instalar-websigner.html para instrucciones de instalación");
      return {
        extensionInstalled: false,
        serviceAvailable: false,
        deviceConnected: false,
        lastCheck: new Date(),
        isChecking: false
      };
    }

    // Verificar servicio
    const serviceAvailable = await this.verificarServicioDisponible();

    // Verificar dispositivo
    const deviceConnected = serviceAvailable ? await this.verificarDispositivoConectado() : false;

    const newStatus = {
      extensionInstalled: extensionStatus.installed,
      serviceAvailable,
      deviceConnected,
      lastCheck: new Date(),
      isChecking: false
    };

    console.log("📊 Estado final del ePad:", newStatus);
    return newStatus;
  }

  /**
   * Verifica el dispositivo físico mediante prueba real
   * @returns {Promise<boolean>} - true si está conectado
   */
  async verificarDispositivoFisico() {
    console.log("🔄 Verificación manual iniciada...");
    console.log("🧪 Probando conexión física del ePad Ink...");
    
    try {
      const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      const testData = {
        firstName: "Test",
        lastName: "Manual",
        eMail: "test@manual.com",
        location: "Manual Test",
        imageFormat: 1,
        imageX: 50,
        imageY: 25,
        imageTransparency: false,
        imageScaling: false,
        maxUpScalePercent: 0.0,
        rawDataFormat: "ENC",
        minSigPoints: 1,
        penThickness: 1,
        penColor: "#000000",
        testConnection: true,
        silentTest: true
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
      return new Promise((resolve) => {
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
          
          // Limpiar elemento de prueba
          if (testElem.parentNode) {
            testElem.parentNode.removeChild(testElem);
          }
          
          resolve(deviceConnected);
        }, 2000);
      });
      
    } catch (error) {
      console.log("❌ Error en verificación manual:", error);
      return false;
    }
  }

  /**
   * Inicia captura de firma desde ePad
   * @param {Object} empleadoSeleccionado - Datos del empleado
   * @param {string} sede - Sede actual
   * @returns {Promise<void>}
   */
  async iniciarCapturaFirma(empleadoSeleccionado, sede) {
    try {
      console.log("🚀 Iniciando captura desde ePad Ink...");
      console.log("📋 Datos recibidos:");
      console.log("  - empleadoSeleccionado:", empleadoSeleccionado);
      console.log("  - sede:", sede);
      
      if (!empleadoSeleccionado) {
        console.error("❌ No hay empleado seleccionado");
        showToast("❌ No hay empleado seleccionado", "red");
        return;
      }

      const message = {
        firstName: empleadoSeleccionado?.nombres?.split(' ')[0] || empleadoSeleccionado?.nombre || "",
        lastName: empleadoSeleccionado?.nombres?.split(' ').slice(1).join(' ') || empleadoSeleccionado?.apellido || "",
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
        timeout: 45000,
        captureMode: "ink",
        deviceType: "ePadInk",
        showSignatureWindow: true,
        windowTitle: "ePad Ink - Firmar aquí",
        backgroundColor: "#FFFFFF",
        // Parámetros adicionales para ePad Ink
        sigCaptureMode: "ink",
        sigCaptureDevice: "ePadInk",
        sigCaptureTimeout: 45000,
        sigCaptureShowWindow: true
      };

      console.log("📝 Datos para captura ePad Ink:", message);
      console.log("👤 Procesamiento de nombres:");
      console.log("  - nombres original:", empleadoSeleccionado?.nombres);
      console.log("  - firstName:", message.firstName);
      console.log("  - lastName:", message.lastName);

      // Crear elemento con el mensaje
      const dataElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      console.log("🔧 Elemento creado:", dataElem);
      
      dataElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify(message));
      console.log("📝 Atributo establecido:", dataElem.getAttribute("SigCaptureWeb_MsgAttribute"));
      
      // Agregar al DOM
      document.documentElement.appendChild(dataElem);
      console.log("📦 Elemento agregado al DOM:", document.documentElement.contains(dataElem));

      // Crear y lanzar el evento de captura
      const evt = document.createEvent("Events");
      evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
      console.log("🎯 Evento creado:", evt);
      
      dataElem.dispatchEvent(evt);
      console.log("📡 Evento disparado");
      
      // Verificar si el elemento tiene respuesta después de un momento
      setTimeout(() => {
        const response = dataElem.getAttribute("SigCaptureWeb_MsgAttribute");
        console.log("🔍 Respuesta después de 2 segundos:", response);
        
        if (response && response !== JSON.stringify(message)) {
          console.log("✅ Respuesta recibida del ePad");
        } else {
          console.log("⚠️ Sin respuesta del ePad después de 2 segundos");
          console.log("💡 Posibles causas:");
          console.log("  1. El dispositivo ePad no está conectado físicamente");
          console.log("  2. El software ePad Ink no está ejecutándose");
          console.log("  3. La extensión no puede comunicarse con el dispositivo");
          console.log("  4. Configuración incorrecta del dispositivo");
        }
      }, 2000);
      
      showToast("🔄 Iniciando captura con ePad Ink...", "blue");
      
      // Método alternativo: Intentar con configuración más simple
      setTimeout(() => {
        console.log("🔄 Intentando método alternativo...");
        this.intentarCapturaAlternativa(empleadoSeleccionado, sede);
      }, 3000);
      
    } catch (e) {
      console.error("❌ Error al iniciar captura ePad Ink:", e);
      showToast("❌ Error al iniciar captura: " + e.message, "red");
    }
  }

  /**
   * Método alternativo para captura de firma
   * @param {Object} empleadoSeleccionado - Datos del empleado
   * @param {string} sede - Sede actual
   */
  intentarCapturaAlternativa(empleadoSeleccionado, sede) {
    try {
      console.log("🔄 Método alternativo iniciado");
      
      const messageSimple = {
        firstName: empleadoSeleccionado?.nombres?.split(' ')[0] || "Usuario",
        lastName: empleadoSeleccionado?.nombres?.split(' ').slice(1).join(' ') || "Prueba",
        eMail: "",
        location: sede,
        imageFormat: 1,
        imageX: 300,
        imageY: 150,
        imageTransparency: false,
        imageScaling: false,
        maxUpScalePercent: 0.0,
        rawDataFormat: "ENC",
        minSigPoints: 25,
        penThickness: 3,
        penColor: "#000000",
        timeout: 30000
      };

      console.log("📝 Configuración simple:", messageSimple);

      const dataElem = document.createElement("SigCaptureWeb_ExtnDataElem");
      dataElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify(messageSimple));
      document.documentElement.appendChild(dataElem);

      const evt = document.createEvent("Events");
      evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
      dataElem.dispatchEvent(evt);
      
      console.log("📡 Método alternativo ejecutado");
      
    } catch (e) {
      console.error("❌ Error en método alternativo:", e);
    }
  }
}

// Exportar instancia singleton
export const ePadService = new EPadService();
