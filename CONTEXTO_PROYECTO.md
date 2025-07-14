# DotacionesVML - Contexto Completo del Proyecto

## 📋 Descripción General
**DotacionesVML** es un sistema integral de gestión de dotaciones empresariales desarrollado con arquitectura moderna separada en frontend y backend. El sistema permite a las empresas gestionar solicitudes de dotación de uniformes y equipos para sus empleados, con un flujo completo desde la solicitud hasta la entrega.

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto
```
DotacionesVML/
├── dotaciones-frontend/    # Aplicación React del cliente
└── dotaciones-backend/     # API Laravel y servidor
```

## 🎯 Funcionalidades Principales

### 1. Gestión de Solicitudes de Dotación
- **Creación de solicitudes**: Los usuarios pueden crear solicitudes de dotación para empleados
- **Wizard de solicitud**: Proceso paso a paso para crear solicitudes completas
- **Gestión de empleados**: Agregar empleados a las solicitudes con sus datos y cargos
- **Elementos de dotación**: Selección de uniformes, equipos y tallas por empleado

### 2. Flujo de Aprobación
- **Revisión de solicitudes**: Los administradores pueden revisar y aprobar/rechazar solicitudes
- **Aprobación parcial**: Posibilidad de aprobar elementos específicos con cantidades modificadas
- **Historial de cambios**: Registro completo de modificaciones en elementos
- **Notificaciones por email**: Envío automático de notificaciones a compras y usuarios

### 3. Entrega de Dotaciones
- **Generación de PDFs**: Creación automática de documentos de entrega
- **Firmas digitales**: Captura de firmas de empleados en la entrega
- **Control de entregas**: Seguimiento del estado de entrega por empleado
- **Almacenamiento de documentos**: Guardado seguro de PDFs de entrega

### 4. Gestión de Usuarios y Empresas
- **Multi-empresa**: Soporte para múltiples empresas y sedes
- **Roles de usuario**: Diferentes niveles de acceso (usuario, administrador, talento)
- **Autenticación segura**: Sistema de login con Laravel Sanctum

## 🛠️ Stack Tecnológico

### Frontend (dotaciones-frontend)
- **Framework**: React v19 con Vite v6.3
- **Estilizado**: TailwindCSS v3.4 + HeadlessUI
- **Rutas**: React Router DOM v7
- **HTTP Client**: Axios
- **PDFs**: jsPDF + jsPDF-AutoTable
- **Firmas**: react-signature-canvas
- **Notificaciones**: SweetAlert2
- **Iconos**: Lucide React
- **Utilidades**: dayjs, html2canvas

### Backend (dotaciones-backend)
- **Framework**: Laravel v12 con PHP ^8.2
- **Autenticación**: Laravel Sanctum
- **Base de datos**: MySQL/MariaDB con migraciones
- **PDFs**: Laravel DomPDF
- **Monitoreo**: Laravel Telescope
- **Email**: Sistema de notificaciones con plantillas Blade
- **Testing**: PHPUnit
- **Logging**: Laravel Pail

## 🗄️ Modelo de Datos

### Entidades Principales
1. **Usuarios del Sistema** (`tbl_usuarios_sistema`)
2. **Empresas** (`tbl_empresa`)
3. **Sedes** (`tbl_sedes`)
4. **Cargos** (`tbl_cargo`)
5. **Solicitudes** (`tbl_solicitudes`)
6. **Detalle Solicitud Empleado** (`tbl_detalle_solicitud_empleado`)
7. **Elementos** (`tbl_elementos`)
8. **Detalle Solicitud Elemento** (`tbl_detalle_solicitud_elemento`)
9. **Historial Aprobación** (`tbl_historial_aprobacion_elemento`)

### Relaciones Clave
- Usuario → Empresa → Sede → Cargo (relación jerárquica)
- Solicitud → Empleados → Elementos (flujo de dotación)
- Historial de cambios en elementos aprobados

## 🔄 Flujo de Trabajo del Sistema

### 1. Creación de Solicitud
```
Usuario → Selecciona Empresa/Sede → Agrega Empleados → Selecciona Elementos → Revisa y Envía
```

### 2. Proceso de Aprobación
```
Administrador → Revisa Solicitud → Aprueba/Rechaza Elementos → Notifica por Email
```

### 3. Entrega de Dotación
```
Usuario → Selecciona Solicitud Aprobada → Genera PDF → Captura Firma → Marca como Entregado
```

## 📱 Módulos del Frontend

### Componentes Principales
- **Login**: Autenticación de usuarios
- **Dashboard**: Panel principal con estadísticas
- **Nueva Solicitud**: Wizard para crear solicitudes
- **Mis Solicitudes**: Historial de solicitudes del usuario
- **Gestionar Solicitudes**: Panel de administración (rol talento)
- **Entrega Solicitud**: Proceso de entrega con PDF y firmas

### Componentes Especializados
- **WizardSolicitudDotacion**: Flujo paso a paso para crear solicitudes
- **ModalDocumentoEntrega**: Generación y descarga de PDFs
- **ModalFirma**: Captura de firmas digitales
- **ResumenSolicitud**: Vista previa antes de enviar

## 🔌 API Endpoints Principales

### Autenticación
- `POST /api/login` - Inicio de sesión
- `POST /api/logout` - Cerrar sesión

### Gestión de Solicitudes
- `POST /api/solicitudes` - Crear nueva solicitud
- `GET /api/solicitudes-gestion` - Listar para administración
- `POST /api/solicitudes/{id}/aprobar` - Aprobar solicitud
- `POST /api/solicitudes/{id}/rechazar` - Rechazar solicitud

### Empleados y Elementos
- `POST /api/detalle-solicitud-empleado` - Agregar empleado
- `POST /api/detalle-solicitud-elemento` - Agregar elementos
- `GET /api/elementos-dotacion` - Obtener catálogo de elementos

### Entrega
- `GET /api/solicitudes-entrega` - Solicitudes listas para entrega
- `POST /api/generar-pdf-entrega` - Generar PDF de entrega

## 🎨 Características de UX/UI

### Diseño Moderno
- Interfaz limpia y responsiva con TailwindCSS
- Componentes reutilizables y modulares
- Navegación intuitiva con breadcrumbs
- Feedback visual con SweetAlert2

### Experiencia de Usuario
- Wizard paso a paso para crear solicitudes
- Validaciones en tiempo real
- Carga asíncrona de datos
- Estados de carga y error claros

## 🔒 Seguridad

### Autenticación y Autorización
- Tokens JWT con Laravel Sanctum
- Middleware de verificación de tokens
- Roles y permisos por usuario
- Validación de datos en frontend y backend

### Protección de Datos
- Validación estricta de inputs
- Sanitización de datos
- Logs de auditoría para cambios críticos
- Almacenamiento seguro de documentos

## 📊 Monitoreo y Logs

### Laravel Telescope
- Monitoreo de requests y responses
- Logs de errores y excepciones
- Métricas de rendimiento
- Debug de queries SQL

### Logs Personalizados
- Logs de evidencia para cambios importantes
- Trazabilidad de aprobaciones/rechazos
- Registro de generación de PDFs

## 🚀 Configuración y Despliegue

### Requisitos del Sistema
- PHP >= 8.2
- Node.js (versión LTS)
- Composer
- MySQL/MariaDB
- Servidor web (Apache/Nginx)

### Variables de Entorno
- Configuración de base de datos
- Credenciales de email
- Configuración de Laravel Sanctum
- URLs de la aplicación

## 📈 Escalabilidad y Mantenimiento

### Optimizaciones
- Autoloader optimizado en producción
- Caché de configuraciones
- Lazy loading de componentes
- Paginación en listados grandes

### Herramientas de Desarrollo
- ESLint para linting de JavaScript
- Laravel Pint para formateo de PHP
- Scripts de desarrollo concurrente
- Tests automatizados con PHPUnit

## 🎯 Casos de Uso Principales

### Para Usuarios Regulares
1. Crear solicitudes de dotación para empleados
2. Revisar estado de solicitudes enviadas
3. Generar documentos de entrega
4. Capturar firmas de empleados

### Para Administradores (Talento)
1. Revisar solicitudes pendientes
2. Aprobar/rechazar elementos específicos
3. Gestionar catálogo de elementos
4. Monitorear entregas realizadas

### Para Empresas
1. Configurar sedes y cargos
2. Gestionar usuarios por sede
3. Definir elementos de dotación disponibles
4. Obtener reportes de solicitudes

## 🔮 Características Futuras Potenciales

- Dashboard con métricas y estadísticas
- Reportes avanzados y exportación
- Integración con sistemas de nómina
- App móvil para entregas en campo
- Notificaciones push en tiempo real
- Integración con proveedores de uniformes

---

*Este documento proporciona una visión completa del sistema DotacionesVML, su arquitectura, funcionalidades y flujos de trabajo principales.* 