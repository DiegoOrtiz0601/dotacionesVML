import { Link } from 'react-router-dom'
import { useGestionarSolicitudes } from '../../hooks/useGestionarSolicitudes'

const GestionarSolicitudes = () => {
  const estados = ['Pendiente', 'Aprobada', 'Rechazada', 'En revisión']
  
  const {
    solicitudes,
    empresas,
    sedes,
    filtros,
    filtrosAplicados,
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
  } = useGestionarSolicitudes()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Gestionar Solicitudes</h1>
        
        {/* Botones de acción */}
        <div className="flex gap-2">
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

             {/* Información de estado */}
       <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
         <div className="flex justify-between items-center text-sm text-blue-800">
           <div className="flex items-center gap-4">
             <span>📊 Total de solicitudes: {totalSolicitudes}</span>
             {cargando && (
               <span className="flex items-center">
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                 Cargando...
               </span>
             )}
           </div>
           <div className="flex items-center gap-4">
             <span>📄 Página {filtros.pagina} de {totalPaginas}</span>
             {tieneFiltros && (
               <span className="text-orange-600">🔍 Filtros activos</span>
             )}
           </div>
         </div>
       </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <select 
            name="empresa" 
            value={filtros.empresa} 
            onChange={handleFiltro} 
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            disabled={cargandoFiltros}
          >
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e.IdEmpresa} value={e.IdEmpresa}>
                {e.NombreEmpresa}
              </option>
            ))}
          </select>
          {cargandoFiltros && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        <div className="relative">
          <select 
            name="sede" 
            value={filtros.sede} 
            onChange={handleFiltro} 
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            disabled={cargandoFiltros}
          >
                         <option value="">Todas las sedes</option>
             {sedes.map((s) => (
               <option key={s.IdSede} value={s.IdSede}>
                 {s.NombreSede}
               </option>
             ))}
          </select>
        </div>

        <div className="relative">
          <select 
            name="estado" 
            value={filtros.estado} 
            onChange={handleFiltro} 
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manejo de errores */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <span className="mr-2">❌</span>
            <span>{error}</span>
            <button
              onClick={recargarDatos}
              className="ml-auto px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

             {/* Indicador de carga */}
       {cargando && (
         <div className="text-center py-8">
           <div className="inline-flex items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
             <span className="text-gray-600">
               {filtros.pagina !== filtrosAplicados.pagina 
                 ? `Cargando página ${filtros.pagina}...` 
                 : 'Cargando solicitudes...'
               }
             </span>
           </div>
         </div>
       )}

             {/* Tabla de solicitudes */}
       {!cargando && solicitudes.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-600 text-white uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Solicitante</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Sede</th>
                <th className="px-6 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
                             {solicitudes.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                     {cargando ? (
                       <div className="flex items-center justify-center">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                         Cargando solicitudes...
                       </div>
                     ) : (
                       <div className="text-center">
                         <div className="text-lg mb-2">📭 No hay solicitudes</div>
                         <div className="text-sm text-gray-400">
                           {tieneFiltros 
                             ? 'No se encontraron solicitudes con los filtros aplicados' 
                             : 'No hay solicitudes pendientes de revisión'
                           }
                         </div>
                       </div>
                     )}
                   </td>
                 </tr>
               ) : solicitudes.map((s) => (
                <tr key={s.idSolicitud} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-700">{s.codigo}</td>
                  <td className="px-6 py-4">{s.nombreSolicitante}</td>
                  <td className="px-6 py-4">{s.empresa}</td>
                  <td className="px-6 py-4">{s.sede}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/talento/solicitud/${s.idSolicitud}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold transition"
                    >
                      Tramitar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

             {/* Paginación */}
       {!cargando && totalPaginas > 1 && (
         <div className="mt-6 flex justify-center items-center gap-4">
           {/* Botón anterior */}
           <button
             onClick={() => cambiarPagina(Math.max(1, filtros.pagina - 1))}
             disabled={filtros.pagina <= 1}
             className={`px-3 py-1 text-sm rounded border ${
               filtros.pagina <= 1 
                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                 : 'bg-white text-gray-700 hover:bg-gray-100'
             }`}
           >
             ← Anterior
           </button>

           {/* Números de página */}
           <div className="flex gap-2">
             {[...Array(totalPaginas)].map((_, i) => {
               const numeroPagina = i + 1
               // Mostrar solo algunas páginas para evitar demasiados botones
               if (
                 numeroPagina === 1 || 
                 numeroPagina === totalPaginas || 
                 (numeroPagina >= filtros.pagina - 1 && numeroPagina <= filtros.pagina + 1)
               ) {
                 return (
                   <button
                     key={i}
                     onClick={() => cambiarPagina(numeroPagina)}
                     className={`px-3 py-1 text-sm rounded border ${
                       filtros.pagina === numeroPagina 
                         ? 'bg-blue-500 text-white' 
                         : 'bg-white text-gray-700 hover:bg-gray-100'
                     }`}
                   >
                     {numeroPagina}
                   </button>
                 )
               } else if (
                 numeroPagina === filtros.pagina - 2 || 
                 numeroPagina === filtros.pagina + 2
               ) {
                 return <span key={i} className="px-2 text-gray-400">...</span>
               }
               return null
             })}
           </div>

           {/* Botón siguiente */}
           <button
             onClick={() => cambiarPagina(Math.min(totalPaginas, filtros.pagina + 1))}
             disabled={filtros.pagina >= totalPaginas}
             className={`px-3 py-1 text-sm rounded border ${
               filtros.pagina >= totalPaginas 
                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                 : 'bg-white text-gray-700 hover:bg-gray-100'
             }`}
           >
             Siguiente →
           </button>
         </div>
       )}
    </div>
  )
}

export default GestionarSolicitudes
