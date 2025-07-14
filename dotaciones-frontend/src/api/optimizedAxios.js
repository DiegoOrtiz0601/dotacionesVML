import axios from 'axios';
import apiCache from './cache';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Error en API:', error);
    return Promise.reject(error);
  }
);

// Wrapper optimizado con caché
const optimizedApi = {
  // GET con caché automática
  async get(url, config = {}) {
    const { useCache = true, cacheExpiry, ...axiosConfig } = config;
    
    if (useCache) {
      const cacheKey = apiCache.generateKey(url, axiosConfig.params);
      
      if (apiCache.has(cacheKey)) {
        console.log('📦 Usando caché para:', url);
        return { data: apiCache.get(cacheKey) };
      }
    }

    const response = await api.get(url, axiosConfig);
    
    if (useCache && response.data) {
      const cacheKey = apiCache.generateKey(url, axiosConfig.params);
      apiCache.set(cacheKey, response.data, cacheExpiry);
    }
    
    return response;
  },

  // POST sin caché (operaciones de escritura)
  async post(url, data, config = {}) {
    return api.post(url, data, config);
  },

  // PUT sin caché (operaciones de escritura)
  async put(url, data, config = {}) {
    return api.put(url, data, config);
  },

  // DELETE sin caché (operaciones de escritura)
  async delete(url, config = {}) {
    return api.delete(url, config);
  },

  // Métodos especializados para consultas frecuentes
  async getCached(url, params = {}, expiry = 5 * 60 * 1000) {
    return this.get(url, { params, useCache: true, cacheExpiry: expiry });
  },

  async getNoCache(url, params = {}) {
    return this.get(url, { params, useCache: false });
  },

  // Limpiar caché específica
  clearCache(url, params = {}) {
    const cacheKey = apiCache.generateKey(url, params);
    apiCache.delete(cacheKey);
  },

  // Limpiar toda la caché
  clearAllCache() {
    apiCache.clear();
  }
};

export default optimizedApi; 