# Optimizaciones de Consultas Repetidas - DotacionesVML

## 🚀 Resumen de Optimizaciones

Este documento describe las optimizaciones implementadas para eliminar consultas repetidas y mejorar el rendimiento del sistema DotacionesVML.

## 📊 Problemas Identificados

### 1. Rutas API Duplicadas
- **Problema**: Múltiples rutas apuntando al mismo endpoint
- **Impacto**: Confusión en el código y posibles conflictos
- **Ubicación**: `routes/api.php`

### 2. Consultas Repetidas en Frontend
- **Problema**: Múltiples llamadas a las mismas APIs sin caché
- **Impacto**: Consumo innecesario de ancho de banda y tiempo de respuesta lento
- **Ubicación**: Componentes React

### 3. Falta de Sistema de Caché
- **Problema**: Datos consultados repetidamente sin almacenamiento temporal
- **Impacto**: Consultas innecesarias al servidor
- **Ubicación**: Toda la aplicación frontend

## 🔧 Optimizaciones Implementadas

### 1. Eliminación de Rutas Duplicadas

#### Antes:
```php
// Rutas duplicadas
Route::apiResource('tipo-solicitud', TblTipoSolicitudController::class);
Route::get('/tipo-solicitud', [TblTipoSolicitudController::class, 'getTiposSolicitud']);

Route::apiResource('solicitudes', TblSolicitudController::class);
Route::post('/solicitudes', [TblSolicitudController::class, 'store']);
Route::get('/solicitudes/{id}', [TblSolicitudController::class, 'show']);
```

#### Después:
```php
// Rutas optimizadas sin duplicación
Route::apiResource('tipo-solicitud', TblTipoSolicitudController::class);
Route::apiResource('solicitudes', TblSolicitudController::class);

// Solo rutas específicas adicionales
Route::get('/solicitudes-gestion', [TblSolicitudController::class, 'indexGestionar']);
Route::put('/solicitudes/{id}/elementos', [TblSolicitudController::class, 'actualizarElementos']);
Route::post('/solicitudes/{id}/aprobar', [TblSolicitudController::class, 'aprobar']);
Route::post('/solicitudes/{id}/rechazar', [TblSolicitudController::class, 'rechazar']);
```

### 2. Sistema de Caché Inteligente

#### Archivo: `src/api/cache.js`
```javascript
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Métodos para gestión de caché
  has(key) { /* verificar existencia */ }
  get(key) { /* obtener valor */ }
  set(key, value, expiryMs) { /* guardar con expiración */ }
  delete(key) { /* eliminar */ }
  clear() { /* limpiar todo */ }
  cleanup() { /* limpiar expirados */ }
}
```

#### Archivo: `src/api/optimizedAxios.js`
```javascript
const optimizedApi = {
  // GET con caché automática
  async get(url, config = {}) {
    const { useCache = true, cacheExpiry, ...axiosConfig } = config;
    
    if (useCache) {
      const cacheKey = apiCache.generateKey(url, axiosConfig.params);
      if (apiCache.has(cacheKey)) {
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

  // Métodos especializados
  async getCached(url, params = {}, expiry = 5 * 60 * 1000) {
    return this.get(url, { params, useCache: true, cacheExpiry: expiry });
  },

  async getNoCache(url, params = {}) {
    return this.get(url, { params, useCache: false });
  }
};
```

### 3. Funciones Utilitarias Optimizadas

#### Archivo: `src/api/utils.js`
```javascript
// Caché para datos de usuario y empresas/sedes
let userDataCache = null;
let empresasSedesCache = null;

export const obtenerEmpresasYSedes = async () => {
  // Verificar caché antes de hacer consulta
  if (empresasSedesCache && Date.now() < empresasSedesCache.expiry) {
    return empresasSedesCache.data;
  }

  // Realizar consulta y guardar en caché
  const result = await optimizedApi.getCached('/mis-empresas-sedes', {}, 10 * 60 * 1000);
  
  empresasSedesCache = {
    data: result,
    expiry: Date.now() + cacheExpiry
  };

  return result;
};

export const obtenerUsuarioAutenticado = async () => {
  // Verificar caché antes de hacer consulta
  if (userDataCache && Date.now() < userDataCache.expiry) {
    return userDataCache.data;
  }

  const response = await optimizedApi.getCached('/usuario-autenticado', {}, 2 * 60 * 1000);
  
  userDataCache = {
    data: response.data,
    expiry: Date.now() + (2 * 60 * 1000)
  };

  return response.data;
};
```

### 4. Componentes Optimizados

#### MisSolicitudes.jsx
```javascript
// Antes: Consultas repetidas
const [usuarioRes, empresaSedeRes] = await Promise.all([
  api.get("/usuario-autenticado"),
  obtenerEmpresasYSedes(),
]);

// Después: Uso de funciones optimizadas
const [usuarioData, empresaSedeData] = await Promise.all([
  obtenerUsuarioAutenticado(),
  obtenerEmpresasYSedes(),
]);

// Consultas con caché
const response = await optimizedApi.getCached('/mis-solicitudes', params, 2 * 60 * 1000);
```

#### EntregaSolicitud.jsx
```javascript
// Antes: Consultas sin caché
const response = await api.get("/solicitudes-entrega", {
  params: { idEmpresa: empresaSeleccionada, idSede: sedeSeleccionada }
});

// Después: Consultas con caché
const response = await optimizedApi.getCached("/solicitudes-entrega", {
  idEmpresa: empresaSeleccionada,
  idSede: sedeSeleccionada,
}, 1 * 60 * 1000); // 1 minuto de caché
```

## 📈 Resultados Esperados

### Mejoras de Rendimiento
- **Reducción del 60-80%** en consultas repetidas
- **Mejora del 40-60%** en tiempo de carga de componentes
- **Reducción significativa** en consumo de ancho de banda
- **Mejor experiencia de usuario** con respuestas más rápidas

### Métricas Específicas
- **Consultas a `/usuario-autenticado`**: De múltiples por sesión a 1 por 2 minutos
- **Consultas a `/mis-empresas-sedes`**: De múltiples por sesión a 1 por 10 minutos
- **Consultas a `/solicitudes-entrega`**: Con caché de 1 minuto
- **Consultas a `/mis-solicitudes`**: Con caché de 2 minutos

## 🔍 Configuración de Caché

### Tiempos de Caché por Endpoint
- **Datos de usuario**: 2 minutos
- **Empresas y sedes (usuario)**: 10 minutos
- **Empresas y sedes (admin)**: 15 minutos
- **Solicitudes de entrega**: 1 minuto
- **Mis solicitudes**: 2 minutos
- **Detalle de solicitud**: 1 minuto

### Gestión de Caché
```javascript
// Limpiar caché específica
optimizedApi.clearCache('/usuario-autenticado');

// Limpiar toda la caché
optimizedApi.clearAllCache();

// Limpiar caché de utilidades
limpiarCacheUsuario();
limpiarCacheEmpresasSedes();
```

## 🚀 Implementación

### Archivos Creados/Modificados
1. **`src/api/cache.js`** - Sistema de caché
2. **`src/api/optimizedAxios.js`** - Wrapper de axios optimizado
3. **`src/api/utils.js`** - Funciones utilitarias optimizadas
4. **`routes/api.php`** - Rutas optimizadas sin duplicación
5. **Componentes actualizados** - Uso del nuevo sistema

### Migración de Componentes
Para migrar un componente existente:

1. **Importar el nuevo sistema**:
```javascript
import optimizedApi from "../api/optimizedAxios";
import { obtenerUsuarioAutenticado, obtenerEmpresasYSedes } from "../api/utils";
```

2. **Reemplazar consultas**:
```javascript
// Antes
const response = await api.get('/endpoint');

// Después
const response = await optimizedApi.getCached('/endpoint', {}, 5 * 60 * 1000);
```

3. **Usar funciones utilitarias**:
```javascript
// Antes
const usuarioRes = await api.get('/usuario-autenticado');

// Después
const usuarioData = await obtenerUsuarioAutenticado();
```

## 🔮 Próximos Pasos

### Optimizaciones Futuras
1. **Caché en servidor** con Redis
2. **Invalidación inteligente** de caché
3. **Compresión de respuestas** HTTP
4. **Lazy loading** de componentes pesados

### Monitoreo
1. **Métricas de caché** (hit rate, miss rate)
2. **Tiempos de respuesta** por endpoint
3. **Uso de ancho de banda** antes y después
4. **Experiencia de usuario** (tiempo de carga)

---

*Estas optimizaciones eliminan consultas repetidas innecesarias y mejoran significativamente el rendimiento del sistema.* 