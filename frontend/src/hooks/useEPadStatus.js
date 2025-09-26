import { useState, useEffect, useCallback } from 'react';
import { ePadService } from '../services/ePadService';
import { showToast } from '../utils/toastUtils';

const initialState = {
  extensionInstalled: false,
  serviceAvailable: false,
  deviceConnected: false,
  lastCheck: null,
  isChecking: false
};

export const useEPadStatus = () => {
  const [epadStatus, setEpadStatus] = useState(initialState);

  const verificarEstadoEPad = useCallback(async () => {
    if (epadStatus.isChecking) return;
    
    setEpadStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const newStatus = await ePadService.verificarEstadoCompleto();
      
      // Detectar cambios de estado
      const wasConnected = epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected;
      const isConnected = newStatus.extensionInstalled && newStatus.serviceAvailable && newStatus.deviceConnected;

      if (wasConnected && !isConnected) {
        showToast("⚠️ ePad desconectado", "yellow");
      } else if (!wasConnected && isConnected) {
        showToast("✅ ePad conectado", "green");
      }

      setEpadStatus(newStatus);
    } catch (error) {
      console.error("❌ Error verificando estado del ePad:", error);
      setEpadStatus(prev => ({ ...prev, isChecking: false }));
    }
  }, []); // Remover dependencias para evitar verificaciones excesivas

  const verificarManualmente = useCallback(async () => {
    try {
      const deviceConnected = await ePadService.verificarDispositivoFisico();
      
      setEpadStatus(prev => ({
        ...prev,
        deviceConnected: deviceConnected,
        lastCheck: new Date()
      }));
      
      if (deviceConnected) {
        showToast("✅ ePad Ink verificado - Conectado y funcionando", "green");
      } else {
        showToast("❌ ePad Ink verificado - Dispositivo desconectado", "red");
      }
    } catch (error) {
      console.error("❌ Error en verificación manual:", error);
      setEpadStatus(prev => ({
        ...prev,
        deviceConnected: false,
        lastCheck: new Date()
      }));
      showToast("❌ Error al verificar ePad Ink", "red");
    }
  }, []);

  const getStatusText = useCallback(() => {
    if (epadStatus.isChecking) return 'Verificando...';
    if (epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected) {
      return 'Conectado';
    }
    if (epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected) {
      return 'Desconectado';
    }
    if (epadStatus.extensionInstalled && !epadStatus.serviceAvailable) {
      return 'Servicio no disponible';
    }
    if (epadStatus.extensionInstalled) {
      return 'Verificando...';
    }
    return 'Extensión no instalada';
  }, [epadStatus]);

  const getStatusColor = useCallback(() => {
    if (epadStatus.extensionInstalled && epadStatus.serviceAvailable && epadStatus.deviceConnected) {
      return 'bg-green-500 animate-pulse';
    }
    if (epadStatus.extensionInstalled && epadStatus.serviceAvailable && !epadStatus.deviceConnected) {
      return 'bg-yellow-500 animate-pulse';
    }
    if (epadStatus.extensionInstalled && !epadStatus.serviceAvailable) {
      return 'bg-red-500';
    }
    if (epadStatus.extensionInstalled) {
      return 'bg-blue-500 animate-pulse';
    }
    return 'bg-gray-500';
  }, [epadStatus]);

  // Verificación automática al cargar
  useEffect(() => {
    const initialCheck = setTimeout(() => {
      verificarEstadoEPad();
    }, 1000);
    
    return () => clearTimeout(initialCheck);
  }, [verificarEstadoEPad]);

  return {
    epadStatus,
    verificarEstadoEPad,
    verificarManualmente,
    getStatusText,
    getStatusColor
  };
};
