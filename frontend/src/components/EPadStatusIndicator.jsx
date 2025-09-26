import React from 'react';

/**
 * Componente para mostrar el estado del ePad con indicadores visuales
 */
const EPadStatusIndicator = ({ 
  epadStatus, 
  getStatusText, 
  getStatusColor, 
  verificarManualmente 
}) => {
  return (
    <>
      {/* Indicador de estado del ePad en tiempo real */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 border rounded">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium">
            Estado del ePad: {getStatusText()}
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
    </>
  );
};

export default EPadStatusIndicator;

