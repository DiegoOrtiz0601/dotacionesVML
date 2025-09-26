import { useState, useEffect, useCallback, useRef } from 'react';
import { signatureApi } from '../api/signatureApi';

/**
 * Hook para manejar polling de estado de firma QR
 * @param {string} token - Token de firma
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Estado y funciones del polling
 */
export const useSignaturePolling = (token, options = {}) => {
  const {
    interval = 5000, // 5 segundos por defecto
    maxAttempts = 60, // Máximo 5 minutos (60 * 5 segundos)
    onSuccess = null,
    onError = null,
    onExpired = null,
    autoStart = true
  } = options;

  const [status, setStatus] = useState('pending'); // pending, signed, expired, error
  const [signatureData, setSignatureData] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [expiresInSeconds, setExpiresInSeconds] = useState(null);

  const intervalRef = useRef(null);
  const attemptsRef = useRef(0);

  /**
   * Verificar estado del token
   */
  const checkStatus = useCallback(async () => {
    if (!token) return;

    try {
      const result = await signatureApi.getTokenStatus(token);
      
      if (result.success) {
        const data = result.data;
        setStatus(data.status);
        setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
        setExpiresInSeconds(data.expires_in_seconds || null);

        if (data.status === 'signed') {
          // Obtener datos de la firma
          const signatureResult = await signatureApi.getSignature(token);
          if (signatureResult.success) {
            setSignatureData(signatureResult.data);
          }
          
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          if (onSuccess) {
            onSuccess(signatureResult.data);
          }
        } else if (data.status === 'expired') {
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          if (onExpired) {
            onExpired();
          }
        }
        
        setError(null);
      } else {
        setError(result.error);
        setStatus('error');
        
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('Error verificando estado:', err);
      setError('Error de conexión');
      setStatus('error');
      
      if (onError) {
        onError('Error de conexión');
      }
    }
  }, [token, onSuccess, onError, onExpired]);

  /**
   * Iniciar polling
   */
  const startPolling = useCallback(() => {
    if (!token || isPolling) return;

    setIsPolling(true);
    setAttempts(0);
    attemptsRef.current = 0;

    // Verificación inmediata
    checkStatus();

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      // Verificar límite de intentos
      if (attemptsRef.current >= maxAttempts) {
        setIsPolling(false);
        clearInterval(intervalRef.current);
        setError('Tiempo de espera agotado');
        setStatus('error');
        
        if (onError) {
          onError('Tiempo de espera agotado');
        }
        return;
      }

      checkStatus();
    }, interval);
  }, [token, interval, maxAttempts, checkStatus, isPolling, onError]);

  /**
   * Detener polling
   */
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Reiniciar polling
   */
  const restartPolling = useCallback(() => {
    stopPolling();
    setTimeout(() => {
      startPolling();
    }, 1000);
  }, [stopPolling, startPolling]);

  /**
   * Obtener tiempo restante formateado
   */
  const getTimeRemaining = useCallback(() => {
    if (!expiresInSeconds) return null;
    
    const minutes = Math.floor(expiresInSeconds / 60);
    const seconds = expiresInSeconds % 60;
    
    return {
      minutes,
      seconds,
      total: expiresInSeconds,
      formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
    };
  }, [expiresInSeconds]);

  /**
   * Verificar si está cerca de expirar
   */
  const isNearExpiration = useCallback(() => {
    if (!expiresInSeconds) return false;
    return expiresInSeconds < 60; // Menos de 1 minuto
  }, [expiresInSeconds]);

  /**
   * Obtener estado del polling
   */
  const getPollingStatus = useCallback(() => {
    return {
      isPolling,
      status,
      attempts,
      maxAttempts,
      remainingAttempts: maxAttempts - attempts,
      timeRemaining: getTimeRemaining(),
      isNearExpiration: isNearExpiration(),
      hasError: !!error,
      isSigned: status === 'signed',
      isExpired: status === 'expired',
      isPending: status === 'pending'
    };
  }, [isPolling, status, attempts, maxAttempts, error, getTimeRemaining, isNearExpiration]);

  // Efectos
  useEffect(() => {
    if (autoStart && token) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [token, autoStart, startPolling, stopPolling]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    status,
    signatureData,
    error,
    attempts,
    isPolling,
    expiresAt,
    expiresInSeconds,
    
    // Funciones
    startPolling,
    stopPolling,
    restartPolling,
    checkStatus,
    
    // Utilidades
    getTimeRemaining,
    isNearExpiration,
    getPollingStatus,
    
    // Estado computado
    isSigned: status === 'signed',
    isExpired: status === 'expired',
    isPending: status === 'pending',
    hasError: !!error
  };
};


