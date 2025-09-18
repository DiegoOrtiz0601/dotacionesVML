/**
 * Servicio ePad para WebSigner
 * Este archivo proporciona la funcionalidad necesaria para la integración con la extensión WebSigner
 */

// Verificar si la extensión WebSigner está instalada
function verificarExtensionWebSigner() {
    // Método 1: Verificar atributo en documentElement
    const attrValue = document.documentElement.getAttribute("SigCaptureWebExtension-installed");
    if (attrValue === "true" || attrValue === true) {
        console.log("✅ Extensión detectada por atributo documentElement");
        return true;
    }
    
    // Método 2: Verificar si existe el objeto global SigCaptureWeb
    if (typeof window.SigCaptureWeb !== 'undefined') {
        console.log("✅ Extensión detectada por objeto global SigCaptureWeb");
        return true;
    }
    
    // Método 3: Verificar si se pueden crear elementos específicos
    try {
        const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
        if (testElem && testElem.tagName === "SIGCAPTUREWEB_EXTNDATAELEM") {
            console.log("✅ Extensión detectada por creación de elemento");
            return true;
        }
    } catch (e) {
        console.log("🔍 No se pudo crear elemento de prueba:", e.message);
    }
    
    // Método 4: Verificar si hay scripts de la extensión cargados
    const scripts = document.querySelectorAll('script[src*="websigner"], script[src*="SigCapture"]');
    if (scripts.length > 0) {
        console.log("✅ Extensión detectada por scripts cargados");
        return true;
    }
    
    console.log("❌ Extensión WebSigner no detectada con ningún método");
    console.log("🔍 Debug info:");
    console.log("- Atributo documentElement:", attrValue);
    console.log("- Objeto SigCaptureWeb:", typeof window.SigCaptureWeb);
    console.log("- Scripts encontrados:", scripts.length);
    
    return false;
}

// Función para inicializar el servicio ePad
function inicializarEPad() {
    console.log("🔧 Inicializando servicio ePad...");
    
    const extensionDetected = verificarExtensionWebSigner();
    if (!extensionDetected) {
        console.warn("⚠️ Extensión WebSigner no detectada");
        console.log("💡 Para instalar WebSigner, visita: http://localhost:8000/instalar-websigner.html");
        return false;
    }
    
    console.log("✅ Servicio ePad inicializado correctamente");
    
    // Verificar dispositivo automáticamente después de la inicialización
    setTimeout(async () => {
        console.log("🔄 Verificación automática del dispositivo...");
        const deviceConnected = await verificarDispositivoEPad();
        console.log(`📱 Estado del dispositivo: ${deviceConnected ? 'Conectado' : 'Desconectado'}`);
    }, 1000);
    
    return true;
}

// Función para verificar si el dispositivo ePad está físicamente conectado
function verificarDispositivoEPad() {
    return new Promise((resolve) => {
        try {
            console.log("🔍 Verificando conexión física del ePad...");
            
            // VALIDACIÓN CRÍTICA: Verificar que la extensión WebSigner esté realmente instalada
            const attrValue = document.documentElement.getAttribute("SigCaptureWebExtension-installed");
            const hasGlobalObject = typeof window.SigCaptureWeb !== 'undefined';
            
            console.log("🔍 Validación crítica de extensión:");
            console.log("- Atributo documentElement:", attrValue);
            console.log("- Objeto SigCaptureWeb:", hasGlobalObject);
            
            if (!attrValue && !hasGlobalObject) {
                console.error("❌ PROBLEMA IDENTIFICADO: Extensión WebSigner NO está instalada");
                console.error("💡 SOLUCIÓN: Ve a http://localhost:8000/instalar-websigner.html");
                console.error("💡 O descarga desde: https://www.wacom.com/en-us/products/apps-services/websigner");
                resolve(false);
                return;
            }
            
            // Método 1: Verificación básica - solo verificar si la extensión puede crear elementos
            try {
                const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
                console.log("🔍 Elemento de prueba:");
                console.log("- Creado:", !!testElem);
                console.log("- TagName:", testElem?.tagName);
                console.log("- Constructor:", testElem?.constructor?.name);
                
                // IMPORTANTE: Si es HTMLUnknownElement, la extensión NO está funcionando
                if (testElem?.constructor?.name === 'HTMLUnknownElement') {
                    console.error("❌ PROBLEMA: Elementos creados como HTMLUnknownElement");
                    console.error("💡 Esto indica que la extensión WebSigner no está activa");
                    resolve(false);
                    return;
                }
                
                if (testElem && testElem.tagName === "SIGCAPTUREWEB_EXTNDATAELEM") {
                    console.log("✅ ePad: Elementos se pueden crear correctamente");
                    
                    // Método 2: Verificar si hay atributos específicos del dispositivo
                    const hasDeviceSupport = (attrValue === "true") || hasGlobalObject;
                    
                    if (hasDeviceSupport) {
                        console.log("✅ ePad: Soporte del dispositivo confirmado");
                        resolve(true);
                        return;
                    }
                }
            } catch (basicError) {
                console.log("❌ Error en verificación básica:", basicError.message);
            }
            
            // Método 3: Verificación avanzada con comunicación real
            console.log("🔄 Intentando comunicación directa con el ePad...");
            
            const testElem = document.createElement("SigCaptureWeb_ExtnDataElem");
            
            // Usar parámetros similares a una captura real pero mínimos
            const testData = {
                firstName: "Test",
                lastName: "Device",
                eMail: "test@device.com",
                location: "Test",
                imageFormat: 2,
                imageX: 100,
                imageY: 50,
                imageTransparency: false,
                imageScaling: false,
                maxUpScalePercent: 0.0,
                rawDataFormat: "ENC",
                minSigPoints: 1,
                penThickness: 1,
                penColor: "#000000",
                testMode: true
            };
            
            testElem.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify(testData));
            document.documentElement.appendChild(testElem);
            
            let timeoutId;
            let responseReceived = false;
            
            const cleanup = () => {
                if (testElem.parentNode) {
                    testElem.parentNode.removeChild(testElem);
                }
                if (timeoutId) clearTimeout(timeoutId);
                document.removeEventListener("SigCaptureWeb_SignResponse", responseHandler);
            };
            
            const responseHandler = (event) => {
                if (responseReceived) return; // Evitar múltiples respuestas
                responseReceived = true;
                
                try {
                    console.log("📨 Respuesta del ePad recibida");
                    const str = event.target.getAttribute("SigCaptureWeb_MsgAttribute");
                    console.log("📝 Datos de respuesta:", str ? str.substring(0, 100) + '...' : 'null');
                    
                    if (str) {
                        const obj = JSON.parse(str);
                        console.log("📊 Respuesta parseada - isSigned:", obj?.isSigned, "errorMsg:", obj?.errorMsg);
                        
                        // Cualquier respuesta del dispositivo indica que está conectado
                        // Incluso si es un error, significa que el dispositivo respondió
                        console.log("✅ ePad respondió - dispositivo físicamente conectado");
                        cleanup();
                        resolve(true);
                    } else {
                        console.log("⚠️ Respuesta vacía del ePad");
                        cleanup();
                        resolve(false);
                    }
                } catch (error) {
                    console.log("⚠️ Error al procesar respuesta del ePad:", error.message);
                    // Aún así, si hubo una respuesta, el dispositivo está conectado
                    cleanup();
                    resolve(true);
                }
            };
            
            // Timeout reducido a 3 segundos
            timeoutId = setTimeout(() => {
                if (responseReceived) return;
                console.log("⏰ Timeout - ePad no respondió en 3 segundos");
                console.log("💡 Esto puede indicar que el dispositivo no está conectado físicamente");
                cleanup();
                resolve(false);
            }, 3000);
            
            document.addEventListener("SigCaptureWeb_SignResponse", responseHandler);
            
            // Disparar evento de prueba
            const evt = document.createEvent("Events");
            evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
            testElem.dispatchEvent(evt);
            
            console.log("🎯 Evento de verificación enviado al ePad");
            
        } catch (error) {
            console.error("❌ Error al verificar dispositivo ePad:", error);
            resolve(false);
        }
    });
}

// Función para capturar firma
function capturarFirma(datos) {
    if (!verificarExtensionWebSigner()) {
        throw new Error("Extensión WebSigner no está instalada");
    }
    
    return new Promise((resolve, reject) => {
        try {
            console.log("🔧 Iniciando captura de firma con datos:", datos);
            
            // Crear elemento para la captura de firma
            const elementoFirma = document.createElement("SigCaptureWeb_ExtnDataElem");
            elementoFirma.setAttribute("SigCaptureWeb_MsgAttribute", JSON.stringify(datos));
            
            // Agregar al DOM temporalmente
            document.documentElement.appendChild(elementoFirma);
            console.log("📦 Elemento de firma agregado al DOM");
            
            // Configurar listener para la respuesta
            const handler = (event) => {
                try {
                    console.log("📨 Evento de respuesta recibido:", event);
                    const str = event.target.getAttribute("SigCaptureWeb_MsgAttribute");
                    console.log("📝 Datos de respuesta:", str);
                    
                    if (!str) {
                        console.warn("⚠️ No se encontraron datos en la respuesta");
                        return;
                    }
                    
                    const obj = JSON.parse(str);
                    console.log("📊 Objeto parseado:", obj);
                    
                    if (obj?.isSigned) {
                        console.log("✅ Firma capturada exitosamente");
                        resolve(obj);
                    } else {
                        console.warn("❌ Firma no válida");
                        reject(new Error("Error en la captura de firma"));
                    }
                } catch (error) {
                    console.error("❌ Error al procesar respuesta:", error);
                    reject(error);
                } finally {
                    // Limpiar elemento
                    if (elementoFirma.parentNode) {
                        elementoFirma.parentNode.removeChild(elementoFirma);
                    }
                    document.removeEventListener("SigCaptureWeb_SignResponse", handler);
                }
            };
            
            document.addEventListener("SigCaptureWeb_SignResponse", handler);
            console.log("👂 Listener de respuesta configurado");
            
            // Disparar evento de inicio de captura
            const evt = document.createEvent("Events");
            evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
            elementoFirma.dispatchEvent(evt);
            console.log("🎯 Evento de inicio disparado");
            
        } catch (error) {
            console.error("❌ Error en capturarFirma:", error);
            reject(error);
        }
    });
}

// Exportar funciones para uso global
window.ePadService = {
    verificarExtension: verificarExtensionWebSigner,
    verificarDispositivo: verificarDispositivoEPad,
    inicializar: inicializarEPad,
    capturarFirma: capturarFirma
};

// Auto-inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
    inicializarEPad();
});

console.log("📦 Servicio ePad cargado correctamente");
