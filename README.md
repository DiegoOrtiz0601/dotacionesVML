# DotacionesVML - Ficha Técnica

## Descripción General
Sistema de gestión de dotaciones empresariales con arquitectura moderna dividida en frontend y backend.

## Estructura del Proyecto
```
DotacionesVML/
├── dotaciones-frontend/    # Aplicación del cliente
└── dotaciones-backend/     # Servidor y API
```

## Especificaciones Técnicas

### Frontend (dotaciones-frontend)
- **Framework Principal**: React v19
- **Bundler**: Vite v6.3
- **Estilizado**: 
  - TailwindCSS v3.4
  - HeadlessUI
- **Características Principales**:
  - Sistema de rutas con React Router DOM v7
  - Generación de PDFs con jsPDF
  - Captura de firmas con react-signature-canvas
  - Cliente HTTP con Axios
  - Interfaz de usuario moderna con Lucide React
  - Notificaciones con SweetAlert2

### Backend (dotaciones-backend)
- **Framework Principal**: Laravel v12
- **Versión de PHP**: ^8.2
- **Características Principales**:
  - Autenticación con Laravel Sanctum
  - Generación de PDFs con Laravel DomPDF
  - Sistema de monitoreo con Laravel Telescope
  - Integración con Inertia.js
  - Sistema de migraciones y seeders
  - Tests unitarios con PHPUnit

## Requisitos del Sistema
- PHP >= 8.2
- Node.js (versión LTS recomendada)
- Composer
- MySQL/MariaDB

## Configuración del Entorno de Desarrollo

### Frontend
```bash
cd dotaciones-frontend
npm install
npm run dev
```

### Backend
```bash
cd dotaciones-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Características del Sistema
- Gestión de dotaciones empresariales
- Generación de documentos PDF
- Sistema de firmas digitales
- Interfaz de usuario moderna y responsiva
- API RESTful
- Sistema de autenticación seguro

## Herramientas de Desarrollo
- ESLint para linting de JavaScript/React
- Laravel Pint para formateo de código PHP
- Laravel Sail para entorno Docker (opcional)
- Laravel Pail para logging mejorado

## Mantenimiento y Desarrollo
- Sistema de control de versiones: Git
- Pruebas automatizadas con PHPUnit
- Scripts de desarrollo concurrente disponibles
- Optimización de autoloader en producción

## Licencia
Este proyecto está bajo la Licencia MIT. 