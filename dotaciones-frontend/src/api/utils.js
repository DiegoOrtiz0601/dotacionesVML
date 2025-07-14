import optimizedApi from './optimizedAxios'

// Caché para datos de usuario y empresas/sedes
let userDataCache = null;
let empresasSedesCache = null;
let cacheExpiry = 5 * 60 * 1000; // 5 minutos

export const obtenerEmpresasYSedes = async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const rol = usuario?.RolUsuario?.toLowerCase()

  // Verificar caché
  if (empresasSedesCache && Date.now() < empresasSedesCache.expiry) {
    console.log('📦 Usando caché de empresas y sedes');
    return empresasSedesCache.data;
  }

  let result;

  if (rol === 'usuario') {
    // Si es usuario común, trae solo lo asignado
    const res = await optimizedApi.getCached('/mis-empresas-sedes', {}, 10 * 60 * 1000); // 10 minutos para datos de usuario
    result = {
      empresas: res.data.empresas || [],
      sedes: res.data.sedes || []
    };
  } else {
    // Si es talento_humano u otro rol, trae todo
    const [resEmpresas, resSedes] = await Promise.all([
      optimizedApi.getCached('/empresas', {}, 15 * 60 * 1000), // 15 minutos para datos maestros
      optimizedApi.getCached('/sedes', {}, 15 * 60 * 1000)
    ]);

    result = {
      empresas: resEmpresas.data,
      sedes: resSedes.data
    };
  }

  // Guardar en caché
  empresasSedesCache = {
    data: result,
    expiry: Date.now() + cacheExpiry
  };

  return result;
}

export const obtenerUsuarioAutenticado = async () => {
  // Verificar caché
  if (userDataCache && Date.now() < userDataCache.expiry) {
    console.log('📦 Usando caché de usuario');
    return userDataCache.data;
  }

  const response = await optimizedApi.getCached('/usuario-autenticado', {}, 2 * 60 * 1000); // 2 minutos para datos de usuario
  
  // Guardar en caché
  userDataCache = {
    data: response.data,
    expiry: Date.now() + (2 * 60 * 1000)
  };

  return response.data;
}

export const limpiarCache = () => {
  userDataCache = null;
  empresasSedesCache = null;
  optimizedApi.clearAllCache();
}

export const limpiarCacheUsuario = () => {
  userDataCache = null;
  optimizedApi.clearCache('/usuario-autenticado');
}

export const limpiarCacheEmpresasSedes = () => {
  empresasSedesCache = null;
  optimizedApi.clearCache('/mis-empresas-sedes');
  optimizedApi.clearCache('/empresas');
  optimizedApi.clearCache('/sedes');
}
