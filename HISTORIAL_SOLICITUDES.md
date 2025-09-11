# 📋 Historial de Solicitudes

## Descripción

El componente `HistorialSolicitudes` permite consultar el historial completo de todas las solicitudes de dotación que han sido procesadas (aprobadas, aprobadas parcialmente o rechazadas) en el sistema.

## Características

### 🎯 Funcionalidades Principales
- **Visualización completa**: Muestra todas las solicitudes ya gestionadas
- **Filtros avanzados**: Por estado, empresa, sede y rango de fechas
- **Estadísticas en tiempo real**: Contadores de solicitudes por estado
- **Paginación**: Navegación eficiente entre grandes volúmenes de datos
- **Búsqueda contextual**: Filtros que se adaptan a la selección del usuario

### 📊 Estados de Solicitudes
- **✅ Aprobado**: Solicitud completamente aprobada
- **⚠️ Aprobado Parcial**: Solicitud aprobada con modificaciones
- **❌ Rechazado**: Solicitud completamente rechazada

### 🔍 Filtros Disponibles
1. **Estado**: Filtrar por estado específico
2. **Empresa**: Filtrar por empresa
3. **Sede**: Filtrar por sede (se filtra automáticamente por empresa)
4. **Fecha Desde**: Fecha de inicio del rango
5. **Fecha Hasta**: Fecha de fin del rango

## Arquitectura

### Backend
- **Endpoint**: `GET /api/solicitudes-historial`
- **Controlador**: `TblSolicitudController@historialSolicitudes`
- **Modelo**: `TblSolicitud`
- **Base de datos**: Consultas optimizadas con JOINs y paginación

### Frontend
- **Componente**: `HistorialSolicitudes.jsx`
- **Hook**: `useHistorialSolicitudes.js`
- **API**: Integración con `optimizedAxios` para caché y optimización

## Uso

### 1. Importar el Componente
```jsx
import HistorialSolicitudes from './components/talento/HistorialSolicitudes';
```

### 2. Usar en la Aplicación
```jsx
function App() {
  return (
    <div>
      <HistorialSolicitudes />
    </div>
  );
}
```

### 3. Hook Personalizado
```jsx
import { useHistorialSolicitudes } from './hooks/useHistorialSolicitudes';

function MiComponente() {
  const {
    solicitudes,
    estadisticas,
    filtros,
    cargando,
    handleFiltro,
    cambiarPagina
  } = useHistorialSolicitudes();
  
  // Usar los datos y funciones
}
```

## Estructura de Datos

### Respuesta de la API
```json
{
  "data": [
    {
      "idSolicitud": 1,
      "codigo": "DOT-0001",
      "estado": "Aprobado",
      "MotivoRechazo": null,
      "fechaSolicitud": "2024-01-15",
      "fechaActualizacion": "2024-01-16T10:30:00",
      "nombreSolicitante": "Juan Pérez",
      "empresa": "Empresa ABC",
      "sede": "Sede Principal"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  },
  "estadisticas": {
    "total": 75,
    "aprobadas": 45,
    "aprobadas_parcial": 20,
    "rechazadas": 10
  }
}
```

## Optimizaciones Implementadas

### 🚀 Performance
- **Caché local**: Empresas y sedes se cachean por 5 minutos
- **Debounce**: Los filtros se aplican con retraso de 500ms
- **Paginación**: Carga eficiente de datos grandes
- **Consultas optimizadas**: JOINs eficientes en el backend

### 🔄 Estado
- **Gestión de estado local**: Filtros y paginación
- **Sincronización**: Filtros aplicados vs. filtros en edición
- **Manejo de errores**: Estados de error y reintentos

## Personalización

### Colores de Estados
```jsx
const obtenerColorEstado = (estado) => {
  switch (estado) {
    case 'Aprobado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Aprobado Parcial':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Rechazado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
```

### Iconos de Estados
```jsx
const obtenerIconoEstado = (estado) => {
  switch (estado) {
    case 'Aprobado':
      return '✅';
    case 'Aprobado Parcial':
      return '⚠️';
    case 'Rechazado':
      return '❌';
    default:
      return '❓';
  }
};
```

## Dependencias

### Backend
- Laravel 10+
- Base de datos SQLite/MySQL
- Sanctum para autenticación

### Frontend
- React 18+
- Tailwind CSS
- optimizedAxios para API calls

## Consideraciones de Seguridad

- **Autenticación**: Todas las rutas requieren autenticación Sanctum
- **Autorización**: Los usuarios solo ven solicitudes de sus empresas/sedes
- **Validación**: Filtros validados en el backend
- **Sanitización**: Datos escapados en el frontend

## Mantenimiento

### Logs
El sistema registra todas las operaciones importantes:
- Carga de historial
- Aplicación de filtros
- Errores de API
- Rendimiento de consultas

### Monitoreo
- Tiempo de respuesta de consultas
- Uso de caché
- Errores de usuario
- Métricas de uso

## Roadmap

### Próximas Funcionalidades
- [ ] Exportación a Excel/PDF
- [ ] Búsqueda por texto libre
- [ ] Filtros guardados por usuario
- [ ] Notificaciones en tiempo real
- [ ] Dashboard de tendencias

### Mejoras Técnicas
- [ ] Virtualización de tabla para grandes volúmenes
- [ ] Caché más inteligente con Redis
- [ ] Compresión de respuestas API
- [ ] Lazy loading de datos


