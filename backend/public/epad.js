/**
 * Servicio ePad para WebSigner
 * Este archivo proporciona la funcionalidad necesaria para la integración con la extensión WebSigner
 */

// Verificar si la extensión WebSigner está instalada
function verificarExtensionWebSigner() {
    return document.documentElement.hasAttribute("SigCaptureWebExtension-installed");
}

// Función para inicializar el servicio ePad
function inicializarEPad() {
    console.log("🔧 Inicializando servicio ePad...");
    
    if (!verificarExtensionWebSigner()) {
        console.warn("⚠️ Extensión WebSigner no detectada");
        return false;
    }
    
    console.log("✅ Servicio ePad inicializado correctamente");
    return true;
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
    inicializar: inicializarEPad,
    capturarFirma: capturarFirma
};

// Auto-inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
    inicializarEPad();
});

console.log("📦 Servicio ePad cargado correctamente");
