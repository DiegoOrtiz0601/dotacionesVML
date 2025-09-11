// src/components/talento/HistorialSolicitudes.jsx

import React, { useState } from 'react';
import { useHistorialSolicitudes } from '../../hooks/useHistorialSolicitudes';
import optimizedApi from '../../api/optimizedAxios';

const HistorialSolicitudes = () => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleSolicitud, setDetalleSolicitud] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  
  const {
    solicitudes,
    empresas,
    sedes,
    estadisticas,
    filtros,
    totalPaginas,
    cargando,
    cargandoFiltros,
    error,
    handleFiltro,
    cambiarPagina,
    recargarDatos,
    limpiarFiltros,
    tieneFiltros,
    totalSolicitudes
  } = useHistorialSolicitudes();

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const verDetalleSolicitud = async (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
    setCargandoDetalle(true);
    
    try {
      // Usar el endpoint existente para obtener detalles completos
      const response = await optimizedApi.getCached(
        `/solicitudes/${solicitud.idSolicitud}`, 
        {}, 
        2 * 60 * 1000 // 2 minutos de caché
      );
      
      setDetalleSolicitud(response.data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      setDetalleSolicitud(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSolicitudSeleccionada(null);
    setDetalleSolicitud(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={recargarDatos}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Historial de Solicitudes</h1>
          <p className="text-gray-600 mt-1">Consulta el historial de todas las solicitudes de dotación ya gestionadas</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          >
            {mostrarFiltros ? '🔽 Ocultar Filtros' : '🔍 Mostrar Filtros'}
          </button>
          
          {tieneFiltros && (
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              🗑️ Limpiar Filtros
            </button>
          )}
          
          <button
            onClick={recargarDatos}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            disabled={cargando}
          >
            {cargando ? '⏳ Cargando...' : '🔄 Recargar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.aprobadas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <span className="text-blue-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parcial</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.aprobadas_parcial}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.rechazadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Filtros de Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltro('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Aprobado Parcial">Aprobado Parcial</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                value={filtros.empresa}
                onChange={(e) => handleFiltro('empresa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={cargandoFiltros}
              >
                <option value="">Todas las empresas</option>
                {empresas.map((empresa) => (
                  <option key={empresa.IdEmpresa} value={empresa.IdEmpresa}>
                    {empresa.NombreEmpresa}
                  </option>
                ))}
              </select>
            </div>

            {/* Sede */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
              <select
                value={filtros.sede}
                onChange={(e) => handleFiltro('sede', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={cargandoFiltros}
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.IdSede} value={sede.IdSede}>
                    {sede.NombreSede}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleFiltro('fecha_desde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFiltro('fecha_hasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Actualización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron solicitudes con los filtros aplicados
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr key={solicitud.idSolicitud} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {solicitud.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{solicitud.empresa}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{solicitud.sede}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{solicitud.nombreSolicitante}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${obtenerColorEstado(solicitud.estado)}`}>
                        {obtenerIconoEstado(solicitud.estado)} {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(solicitud.fechaSolicitud)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(solicitud.fechaActualizacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => verDetalleSolicitud(solicitud)}
                        className="text-blue-600 hover:text-blue-900 mr-3 hover:underline"
                      >
                        👁️ Ver
                      </button>
                      {solicitud.estado === 'Rechazado' && solicitud.MotivoRechazo && (
                        <span className="text-xs text-gray-500" title={solicitud.MotivoRechazo}>
                          💬 Motivo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Mostrando página {filtros.pagina} de {totalPaginas}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => cambiarPagina(filtros.pagina - 1)}
              disabled={filtros.pagina <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              const pagina = i + 1;
              return (
                <button
                  key={pagina}
                  onClick={() => cambiarPagina(pagina)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pagina === filtros.pagina
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pagina}
                </button>
              );
            })}
            
            <button
              onClick={() => cambiarPagina(filtros.pagina + 1)}
              disabled={filtros.pagina >= totalPaginas}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Detalles de la Solicitud
                </h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✖
                </button>
              </div>

              {cargandoDetalle ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando detalles...</span>
                </div>
              ) : detalleSolicitud ? (
                <div className="space-y-6">
                  {/* Información General */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Código de Solicitud</p>
                        <p className="font-medium">{detalleSolicitud.codigo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estado</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${obtenerColorEstado(detalleSolicitud.estadoSolicitud)}`}>
                          {obtenerIconoEstado(detalleSolicitud.estadoSolicitud)} {detalleSolicitud.estadoSolicitud}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Empresa</p>
                        <p className="font-medium">{detalleSolicitud.empresa}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sede</p>
                        <p className="font-medium">{detalleSolicitud.sede}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Solicitante</p>
                        <p className="font-medium">{detalleSolicitud.nombreSolicitante}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                        <p className="font-medium">{formatearFecha(detalleSolicitud.fechaSolicitud)}</p>
                      </div>
                    </div>
                    
                    {detalleSolicitud.MotivoRechazo && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Motivo de Rechazo:</strong> {detalleSolicitud.MotivoRechazo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Empleados y Elementos */}
                  {detalleSolicitud.empleados && detalleSolicitud.empleados.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Empleados y Elementos</h3>
                      <div className="space-y-4">
                        {detalleSolicitud.empleados.map((empleado, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{empleado.nombreEmpleado}</h4>
                                <p className="text-sm text-gray-600">Documento: {empleado.documentoEmpleado}</p>
                                {empleado.cargo && (
                                  <p className="text-sm text-gray-600">Cargo: {empleado.cargo}</p>
                                )}
                              </div>
                              {empleado.tipoSolicitud && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {empleado.tipoSolicitud}
                                </span>
                              )}
                            </div>
                            
                            {empleado.elementos && empleado.elementos.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Elementos Solicitados:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {empleado.elementos.map((elemento, elemIndex) => (
                                    <div key={elemIndex} className="text-sm bg-gray-50 p-2 rounded">
                                      <p className="font-medium">{elemento.nombreElemento}</p>
                                      <p className="text-gray-600">
                                        Cantidad: {elemento.cantidadSolicitada}
                                        {elemento.talla && ` | Talla: ${elemento.talla}`}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historial */}
                  {detalleSolicitud.empleados && detalleSolicitud.empleados.some(emp => emp.historial && emp.historial.length > 0) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📜 Historial de Solicitudes</h3>
                      <div className="space-y-3">
                        {detalleSolicitud.empleados.map((empleado, index) => 
                          empleado.historial && empleado.historial.map((historial, histIndex) => (
                            <div key={`${index}-${histIndex}`} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {empleado.nombreEmpleado} - {historial.evento}
                                  </p>
                                  {historial.codigoSolicitud && (
                                    <p className="text-xs text-gray-600">Solicitud: {historial.codigoSolicitud}</p>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">{historial.fecha}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se pudieron cargar los detalles de la solicitud</p>
                  <button
                    onClick={() => verDetalleSolicitud(solicitudSeleccionada)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialSolicitudes;
