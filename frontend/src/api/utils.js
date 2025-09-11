import optimizedApi from './optimizedAxios'

// Caché para datos de usuario y empresas/sedes
let userDataCache = null
let empresasSedesCache = null

// Función para obtener empresas y sedes con caché optimizada
export const obtenerEmpresasYSedes = async () => {
  // Verificar caché antes de hacer consulta
  if (empresasSedesCache && Date.now() < empresasSedesCache.expiry) {
    return empresasSedesCache.data
  }

  try {
    // Realizar consulta y guardar en caché
    const result = await optimizedApi.getCached('/mis-empresas-sedes', {}, 15 * 60 * 1000) // 15 minutos
    
    empresasSedesCache = {
      data: result.data,
      expiry: Date.now() + (15 * 60 * 1000)
    }

    return result.data
  } catch (error) {
    console.error('❌ Error en obtenerEmpresasYSedes:', error)
    throw error
  }
}

// Función para obtener usuario autenticado con caché
export const obtenerUsuarioAutenticado = async () => {
  // Verificar caché antes de hacer consulta
  if (userDataCache && Date.now() < userDataCache.expiry) {
    return userDataCache.data
  }

  try {
    const response = await optimizedApi.getCached('/usuario-autenticado', {}, 2 * 60 * 1000) // 2 minutos
    
    userDataCache = {
      data: response.data,
      expiry: Date.now() + (2 * 60 * 1000)
    }

    return response.data
  } catch (error) {
    console.error('❌ Error en obtenerUsuarioAutenticado:', error)
    throw error
  }
}

// Función para limpiar caché específica
export const limpiarCacheUsuario = () => {
  userDataCache = null
  optimizedApi.clearCache('/usuario-autenticado')
}

// Función para limpiar caché de empresas y sedes
export const limpiarCacheEmpresasSedes = () => {
  empresasSedesCache = null
  optimizedApi.clearCache('/mis-empresas-sedes')
}

// Función para limpiar toda la caché
export const limpiarTodaCache = () => {
  userDataCache = null
  empresasSedesCache = null
  optimizedApi.clearAllCache()
  console.log('🧹 Caché limpiada completamente')
}

// Función para obtener estadísticas del caché
export const obtenerEstadisticasCache = () => {
  return {
    api: optimizedApi.getCacheStats(),
    usuario: userDataCache ? {
      tieneCache: true,
      expiraEn: userDataCache.expiry - Date.now()
    } : { tieneCache: false },
    empresasSedes: empresasSedesCache ? {
      tieneCache: true,
      expiraEn: empresasSedesCache.expiry - Date.now()
    } : { tieneCache: false }
  }
}

// Función para precargar datos comunes
export const precargarDatosComunes = async () => {
  try {
    console.log('🚀 Precargando datos comunes...')
    await Promise.all([
      obtenerEmpresasYSedes(),
      obtenerUsuarioAutenticado()
    ])
    console.log('✅ Datos comunes precargados')
  } catch (error) {
    console.error('❌ Error precargando datos:', error)
  }
}
