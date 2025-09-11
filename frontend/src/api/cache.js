// Sistema de caché para evitar consultas repetidas
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultExpiry = 5 * 60 * 1000; // 5 minutos por defecto
  }

  // Generar clave única para la caché
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}${sortedParams ? '?' + sortedParams : ''}`;
  }

  // Verificar si existe en caché y no ha expirado
  has(key) {
    if (!this.cache.has(key)) return false;
    
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Obtener valor de caché
  get(key) {
    return this.cache.get(key);
  }

  // Guardar en caché
  set(key, value, expiryMs = this.defaultExpiry) {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + expiryMs);
  }

  // Eliminar de caché
  delete(key) {
    this.cache.delete(key);
    this.cacheExpiry.set(key, null);
  }

  // Limpiar toda la caché
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Limpiar caché expirada
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry && now > expiry) {
        this.delete(key);
      }
    }
  }
}

// Instancia global de caché
const apiCache = new ApiCache();

// Limpiar caché expirada cada minuto
setInterval(() => {
  apiCache.cleanup();
}, 60 * 1000);

export default apiCache; 