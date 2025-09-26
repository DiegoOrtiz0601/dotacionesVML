import React, { useState, useEffect } from 'react';
import { signatureApi } from '../api/signatureApi';
import { useSignaturePolling } from '../hooks/useSignaturePolling';
import { showToast } from '../utils/toastUtils';

/**
 * Modal para firma electrónica con QR
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando la firma es exitosa
 * @param {Object} props.empleado - Datos del empleado
 * @param {Object} props.solicitud - Datos de la solicitud
 * @param {string} props.tipoDocumento - Tipo de documento
 * @param {number} props.expirationMinutes - Minutos de expiración
 */
const QRSignatureModal = ({
  isOpen,
  onClose,
  onSuccess,
  empleado,
  solicitud,
  tipoDocumento = 'entrega',
  expirationMinutes = 5
}) => {
  const [qrData, setQrData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureWindow, setSignatureWindow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Hook de polling para verificar estado de la firma
  const {
    status,
    signatureData,
    error,
    isPolling,
    getTimeRemaining,
    isNearExpiration,
    getPollingStatus,
    startPolling,
    stopPolling,
    isSigned,
    isExpired,
    hasError
  } = useSignaturePolling(qrData?.token, {
    interval: 3000, // Verificar cada 3 segundos
    maxAttempts: 100, // Máximo 5 minutos
    onSuccess: (data) => {
      showToast('✅ Firma recibida correctamente', 'green');
      if (onSuccess) {
        onSuccess(data.signature_data);
      }
      handleClose();
    },
    onError: (errorMsg) => {
      showToast(`❌ Error: ${errorMsg}`, 'red');
    },
    onExpired: () => {
      showToast('⏰ Token expirado. Genere uno nuevo.', 'yellow');
      stopPolling();
    },
    autoStart: false // Iniciar manualmente
  });

  // Verificar si es dispositivo móvil
  useEffect(() => {
    setIsMobile(signatureApi.isMobileDevice());
  }, []);

  /**
   * Generar token y QR
   */
  const generateQR = async () => {
    if (!empleado || !solicitud) {
      showToast('❌ Faltan datos del empleado o solicitud', 'red');
      return;
    }

    setIsGenerating(true);
    
    try {
      const documentData = signatureApi.generateDocumentData(empleado, solicitud, tipoDocumento);
      const result = await signatureApi.generateSignatureToken(documentData, expirationMinutes);

      if (result.success) {
        setQrData(result.data);
        showToast('✅ QR generado correctamente', 'green');
        
        // Iniciar polling
        startPolling();
      } else {
        showToast(`❌ Error generando QR: ${result.error}`, 'red');
        if (result.details) {
          console.error('Detalles del error:', result.details);
        }
      }
    } catch (error) {
      console.error('Error generando QR:', error);
      showToast(`❌ Error: ${error.message}`, 'red');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Abrir ventana de firma móvil
   */
  const openSignatureWindow = () => {
    if (!qrData?.token) return;

    const window = signatureApi.openSignatureWindow(qrData.token);
    if (window) {
      setSignatureWindow(window);
      showToast('📱 Ventana de firma abierta', 'blue');
    } else {
      showToast('❌ Error abriendo ventana de firma', 'red');
    }
  };

  /**
   * Copiar URL al portapapeles
   */
  const copyUrlToClipboard = async () => {
    if (!qrData?.signature_url) return;

    try {
      await navigator.clipboard.writeText(qrData.signature_url);
      showToast('📋 URL copiada al portapapeles', 'green');
    } catch (error) {
      console.error('Error copiando URL:', error);
      showToast('❌ Error copiando URL', 'red');
    }
  };

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    stopPolling();
    setQrData(null);
    setSignatureWindow(null);
    onClose();
  };

  /**
   * Obtener estado del polling formateado
   */
  const pollingStatus = getPollingStatus();
  const timeRemaining = getTimeRemaining();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            📱 Firma Electrónica QR
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del empleado */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Información del Empleado</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nombre:</strong> {empleado?.nombres}</p>
              <p><strong>Documento:</strong> {empleado?.documento}</p>
              <p><strong>Cargo:</strong> {empleado?.cargo || 'N/A'}</p>
            </div>
          </div>

          {/* Generar QR */}
          {!qrData && (
            <div className="text-center">
              <button
                onClick={generateQR}
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors w-full"
              >
                {isGenerating ? '🔄 Generando QR...' : '📱 Generar QR para Firma'}
              </button>
            </div>
          )}

          {/* QR Code y controles */}
          {qrData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={qrData.qr_code}
                    alt="QR Code para firma"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Escanee el QR con su dispositivo móvil
                </p>
              </div>

              {/* Estado del polling */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-800">Estado:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'signed' ? 'bg-green-100 text-green-800' :
                    status === 'expired' ? 'bg-red-100 text-red-800' :
                    status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status === 'signed' ? '✅ Firmado' :
                     status === 'expired' ? '⏰ Expirado' :
                     status === 'error' ? '❌ Error' :
                     '⏳ Esperando'}
                  </span>
                </div>
                
                {timeRemaining && (
                  <div className="text-sm text-blue-700">
                    <p>Tiempo restante: {timeRemaining.formatted}</p>
                    {isNearExpiration() && (
                      <p className="text-red-600 font-medium">⚠️ Pronto expirará</p>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 mt-1">❌ {error}</p>
                )}
              </div>

              {/* Controles */}
              <div className="space-y-2">
                <button
                  onClick={openSignatureWindow}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  📱 Abrir en Ventana Nueva
                </button>
                
                <button
                  onClick={copyUrlToClipboard}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  📋 Copiar URL
                </button>
              </div>

              {/* Información adicional */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Escanee el QR con la cámara de su móvil</p>
                <p>• O abra la ventana nueva para firmar</p>
                <p>• El token expira en {expirationMinutes} minutos</p>
                {isMobile && (
                  <p className="text-blue-600 font-medium">📱 Detectado dispositivo móvil</p>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            
            {qrData && !isSigned && (
              <button
                onClick={() => {
                  stopPolling();
                  generateQR();
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Generar Nuevo QR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRSignatureModal;
