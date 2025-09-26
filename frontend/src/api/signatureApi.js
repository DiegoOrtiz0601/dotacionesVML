import api from './axios';

/**
 * Servicio para manejo de firma electrónica con QR
 */
class SignatureApiService {
  /**
   * Generar token de firma y QR
   * @param {Object} documentData - Datos del documento
   * @param {number} expirationMinutes - Minutos de expiración (default: 5)
   * @returns {Promise<Object>} - Respuesta con token y QR
   */
  async generateSignatureToken(documentData, expirationMinutes = 5) {
    try {
      const payload = {
        document_id: documentData.document_id,
        document_type: documentData.document_type,
        document_data: documentData,
        expiration_minutes: expirationMinutes
      };
      
      const response = await api.post('/signature/generate-token', payload);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generando token de firma:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error generando token de firma',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Obtener estado del token
   * @param {string} token - Token de firma
   * @returns {Promise<Object>} - Estado del token
   */
  async getTokenStatus(token) {
    try {
      const response = await api.get(`/signature/status/${token}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo estado del token:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error obteniendo estado',
        status: error.response?.status
      };
    }
  }

  /**
   * Obtener firma por token
   * @param {string} token - Token de firma
   * @returns {Promise<Object>} - Datos de la firma
   */
  async getSignature(token) {
    try {
      const response = await api.get(`/signature/get/${token}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo firma:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error obteniendo firma',
        status: error.response?.status
      };
    }
  }

  /**
   * Limpiar tokens expirados
   * @returns {Promise<Object>} - Resultado de la limpieza
   */
  async cleanupExpiredTokens() {
    try {
      const response = await api.post('/signature/cleanup');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error limpiando tokens:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error limpiando tokens'
      };
    }
  }

  /**
   * Verificar si una URL es válida
   * @param {string} url - URL a verificar
   * @returns {boolean} - Si la URL es válida
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generar URL de firma móvil
   * @param {string} token - Token de firma
   * @returns {string} - URL completa de firma
   */
  getSignatureUrl(token) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/firma/${token}`;
  }

  /**
   * Abrir URL de firma en nueva ventana
   * @param {string} token - Token de firma
   * @returns {Window|null} - Ventana abierta o null si falla
   */
  openSignatureWindow(token) {
    try {
      const url = this.getSignatureUrl(token);
      const windowFeatures = 'width=400,height=600,scrollbars=yes,resizable=yes';
      return window.open(url, 'signature', windowFeatures);
    } catch (error) {
      console.error('Error abriendo ventana de firma:', error);
      return null;
    }
  }

  /**
   * Verificar si el dispositivo es móvil
   * @returns {boolean} - Si es dispositivo móvil
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Generar datos del documento para firma
   * @param {Object} empleado - Datos del empleado
   * @param {Object} solicitud - Datos de la solicitud
   * @param {string} tipoDocumento - Tipo de documento
   * @returns {Object} - Datos del documento
   */
  generateDocumentData(empleado, solicitud, tipoDocumento = 'entrega') {
    // Validar datos requeridos
    if (!empleado) {
      throw new Error('Datos del empleado son requeridos');
    }
    
    if (!solicitud) {
      throw new Error('Datos de la solicitud son requeridos');
    }
    
    const documentId = solicitud.numeroSolicitud || solicitud.id;
    if (!documentId) {
      throw new Error('ID del documento es requerido');
    }

    return {
      document_id: documentId,
      document_type: tipoDocumento,
      empleado: {
        id: empleado.id,
        documento: empleado.documento,
        nombres: empleado.nombres,
        apellidos: empleado.apellidos || '',
        cargo: empleado.cargo || ''
      },
      solicitud: {
        id: solicitud.id,
        numeroSolicitud: solicitud.numeroSolicitud,
        empresa: solicitud.empresa,
        sede: solicitud.sede,
        fecha: solicitud.fecha || new Date().toISOString()
      },
      metadata: {
        generated_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        platform: navigator.platform
      }
    };
  }
}

// Exportar instancia singleton
export const signatureApi = new SignatureApiService();
export default signatureApi;
