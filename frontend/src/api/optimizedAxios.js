import api from './axios'

// Sistema de caché simple para mejorar rendimiento
class ApiCache {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = new Map()
    this.defaultExpiry = 5 * 60 * 1000 // 5 minutos por defecto
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${url}?${sortedParams}`
  }

  has(key) {
    if (!this.cache.has(key)) return false
    const expiry = this.cacheExpiry.get(key)
    if (Date.now() > expiry) {
      this.delete(key)
      return false
    }
    return true
  }

  get(key) {
    return this.cache.get(key)
  }

  set(key, value, expiryMs = this.defaultExpiry) {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + expiryMs)
  }

  delete(key) {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }

  clear() {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.delete(key)
      }
    }
  }
}

// Instancia global del caché
const apiCache = new ApiCache()

// Limpiar caché expirado cada 5 minutos
setInterval(() => apiCache.cleanup(), 5 * 60 * 1000)

// API optimizada con caché
const optimizedApi = {
  // GET con caché automática
  async get(url, config = {}) {
    const { useCache = true, cacheExpiry, ...axiosConfig } = config
    
    if (useCache) {
      const cacheKey = apiCache.generateKey(url, axiosConfig.params)
      if (apiCache.has(cacheKey)) {
        return { data: apiCache.get(cacheKey) }
      }
    }

    try {
      const response = await api.get(url, axiosConfig)
      
      if (useCache && response.data) {
        const cacheKey = apiCache.generateKey(url, axiosConfig.params)
        apiCache.set(cacheKey, response.data, cacheExpiry)
      }
      
      return response
    } catch (error) {
      console.error('❌ Error en llamada API:', error)
      throw error
    }
  },

  // POST sin caché
  async post(url, data, config = {}) {
    return api.post(url, data, config)
  },

  // PUT sin caché
  async put(url, data, config = {}) {
    return api.put(url, data, config)
  },

  // DELETE sin caché
  async delete(url, config = {}) {
    return api.delete(url, config)
  },

  // Métodos especializados con caché
  async getCached(url, params = {}, expiry = 5 * 60 * 1000) {
    return this.get(url, { params, useCache: true, cacheExpiry: expiry })
  },

  async getNoCache(url, params = {}) {
    return this.get(url, { params, useCache: false })
  },

  // Limpiar caché específica
  clearCache(url, params = {}) {
    const cacheKey = apiCache.generateKey(url, params)
    apiCache.delete(cacheKey)
  },

  // Limpiar toda la caché
  clearAllCache() {
    apiCache.clear()
  },

  // Obtener estadísticas del caché
  getCacheStats() {
    return {
      size: apiCache.cache.size,
      keys: Array.from(apiCache.cache.keys())
    }
  }
}

export default optimizedApi 