import { useEffect, useMemo, useState, useCallback } from 'react'
import { obtenerEmpresasYSedes, limpiarTodaCache } from '../../../api/utils'
import api from '../../../api/axios'
import optimizedApi from '../../../api/optimizedAxios'

function PasoSeleccionEmpresaSede({ usuario, onContinue }) {
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null)
  const [numeroSolicitud, setNumeroSolicitud] = useState(null)
  const [idSolicitud, setIdSolicitud] = useState(null)
  const [generandoNumero, setGenerandoNumero] = useState(false)
  const [cacheNumeros, setCacheNumeros] = useState({})
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  const empresaId = empresaSeleccionada?.IdEmpresa || ''
  const sedeId = sedeSeleccionada?.IdSede || ''

  const sedesFiltradas = useMemo(() => {
    return sedes?.filter(s => s.IdEmpresa == empresaId)
  }, [sedes, empresaId])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        setError(null)
        console.log('🔄 Cargando empresas y sedes para usuario...')
        console.log('🔍 Usuario actual:', usuario)
        
        // Limpiar caché antes de hacer la petición
        limpiarTodaCache()
        
        // Usar API directa sin caché para asegurar datos frescos
        console.log('📡 Haciendo petición directa a la API...')
        const response = await optimizedApi.getNoCache('/mis-empresas-sedes')
        console.log('📊 Respuesta directa de la API:', response)
        
        // La respuesta de optimizedApi.getNoCache tiene la estructura { data: ... }
        const data = response.data || response
        console.log('📊 Datos extraídos:', data)
        console.log('📊 Tipo de datos:', typeof data)
        console.log('📊 Estructura de datos:', Object.keys(data || {}))
        
        // Verificar la estructura de la respuesta
        if (data && typeof data === 'object') {
          console.log('📊 data.empresas:', data.empresas)
          console.log('📊 data.sedes:', data.sedes)
          console.log('📊 data.message:', data.message)
          
          // Verificar si hay empresas y sedes
          if (data.empresas && Array.isArray(data.empresas) && data.empresas.length > 0) {
            setEmpresas(data.empresas)
            console.log('✅ Empresas establecidas:', data.empresas)
          } else {
            console.warn('⚠️ No hay empresas en la respuesta')
            setEmpresas([])
          }
          
          if (data.sedes && Array.isArray(data.sedes) && data.sedes.length > 0) {
            setSedes(data.sedes)
            console.log('✅ Sedes establecidas:', data.sedes)
          } else {
            console.warn('⚠️ No hay sedes en la respuesta')
            setSedes([])
          }
          
          // Verificar si hay mensaje de error del backend
          if (data.message) {
            console.warn('⚠️ Mensaje del backend:', data.message)
            setError(data.message)
          }
          
          console.log('✅ Empresas cargadas:', data.empresas?.length || 0)
          console.log('✅ Sedes cargadas:', data.sedes?.length || 0)
          console.log('✅ Estado final - empresas:', data.empresas)
          console.log('✅ Estado final - sedes:', data.sedes)
        } else {
          console.error('❌ Respuesta inválida:', data)
          setError('Respuesta inválida del servidor')
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err)
        console.error('❌ Detalles del error:', err.response?.data || err.message)
        setError('Error al cargar las empresas y sedes. Intenta nuevamente.')
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  // Función optimizada para generar número con caché y debounce
  const generarNumeroOptimizado = useCallback(async () => {
    if (!empresaSeleccionada || !sedeSeleccionada) {
      setNumeroSolicitud(null)
      setIdSolicitud(null)
      return
    }

    const cacheKey = `${empresaSeleccionada.IdEmpresa}_${sedeSeleccionada.IdSede}`
    
    // Verificar caché
    if (cacheNumeros[cacheKey]) {
      console.log('📦 Usando número de solicitud en caché')
      setNumeroSolicitud(cacheNumeros[cacheKey].numeroSolicitud)
      setIdSolicitud(cacheNumeros[cacheKey].idSolicitud)
      return
    }

    // Evitar múltiples llamadas simultáneas
    if (generandoNumero) {
      console.log('⏳ Ya se está generando un número...')
      return
    }

    try {
      setGenerandoNumero(true)
      console.log('🔄 Generando número de solicitud...')
      
      const response = await api.get('/generar-numero-solicitud')
      
      const resultado = {
        numeroSolicitud: response.data.numeroSolicitud,
        idSolicitud: response.data.idSolicitud
      }
      
      // Guardar en caché
      setCacheNumeros(prev => ({
        ...prev,
        [cacheKey]: resultado
      }))
      
      setNumeroSolicitud(resultado.numeroSolicitud)
      setIdSolicitud(resultado.idSolicitud)
      
      console.log('✅ Número generado y cacheado:', resultado.numeroSolicitud)
    } catch (err) {
      console.error('❌ Error generando número de solicitud:', err)
      setNumeroSolicitud(null)
      setIdSolicitud(null)
    } finally {
      setGenerandoNumero(false)
    }
  }, [empresaSeleccionada, sedeSeleccionada, cacheNumeros, generandoNumero])

  // Debounce para evitar múltiples llamadas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generarNumeroOptimizado()
    }, 300) // 300ms de debounce

    return () => clearTimeout(timeoutId)
  }, [generarNumeroOptimizado])

  const handleContinuar = () => {
    // Validaciones más estrictas
    if (!empresaSeleccionada) {
      alert('⚠️ Debes seleccionar una empresa.')
      return
    }
    
    if (!sedeSeleccionada) {
      alert('⚠️ Debes seleccionar una sede.')
      return
    }
    
    if (!idSolicitud || !numeroSolicitud) {
      alert('⚠️ Debes esperar a que se genere el número de solicitud.')
      return
    }

    if (!usuario || !usuario.idUsuario) {
      alert('⚠️ Error: No se pudo obtener la información del usuario.')
      return
    }

    console.log('✅ Validaciones del paso 1 superadas, continuando...');
    
    onContinue({
      idSolicitud,
      numeroSolicitud,
      empresaSeleccionada,
      sedeSeleccionada,
      usuario
    })
  }

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas y sedes...</p>
        </div>
      </div>
    )
  }

  // Debug: Mostrar estado actual
  console.log('🔍 Estado actual del componente:')
  console.log('  - cargando:', cargando)
  console.log('  - error:', error)
  console.log('  - empresas.length:', empresas.length)
  console.log('  - empresas:', empresas)
  console.log('  - sedes.length:', sedes.length)
  console.log('  - sedes:', sedes)

  // Mostrar error si no hay empresas o hay un error
  if (error || empresas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No tienes empresas asignadas
          </h3>
          <p className="text-yellow-700 mb-4">
            {error || 'Tu usuario no tiene empresas asignadas. Contacta al administrador del sistema.'}
          </p>
          <div className="text-sm text-yellow-600 mb-4">
            <p>Para poder crear solicitudes necesitas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tener al menos una empresa asignada</li>
              <li>Tener al menos una sede asignada</li>
              <li>Estar activo en el sistema</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500 mb-4">
            <p>Debug info:</p>
            <p>Empresas: {empresas.length} | Sedes: {sedes.length}</p>
            <p>Error: {error || 'Ninguno'}</p>
          </div>
          <button
            onClick={() => {
              console.log('🔄 Limpiando caché y recargando...')
              limpiarTodaCache()
              window.location.reload()
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            🔄 Recargar y Limpiar Caché
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Empresa */}
      <div>
        <label className="block font-semibold text-sm mb-1 text-gray-700">Empresa</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={empresaId}
          onChange={e => {
            const empresa = empresas.find(emp => emp.IdEmpresa == e.target.value)
            setEmpresaSeleccionada(empresa)
            setSedeSeleccionada(null)
          }}
        >
          <option value="">Seleccione empresa</option>
          {empresas.map(e => (
            <option key={e.IdEmpresa} value={e.IdEmpresa}>
              {e.NombreEmpresa}
            </option>
          ))}
        </select>
      </div>

      {/* Sede */}
      <div>
        <label className="block font-semibold text-sm mb-1 text-gray-700">Sede</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={sedeId}
          onChange={e => {
            const sede = sedes.find(s => s.IdSede == e.target.value)
            setSedeSeleccionada(sede)
          }}
          disabled={!empresaSeleccionada}
        >
          <option value="">Seleccione sede</option>
          {sedesFiltradas.map(s => (
            <option key={s.IdSede} value={s.IdSede}>
              {s.NombreSede}
            </option>
          ))}
        </select>
      </div>

      {/* Info + botón */}
      <div className="col-span-2 mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {generandoNumero ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-600">Generando número...</p>
            </>
          ) : numeroSolicitud ? (
            <div className="text-sm text-green-600 font-medium">
              <p>✅ Número generado: <span className="font-bold">{numeroSolicitud}</span></p>
              <p className="text-xs text-gray-600">Empresa: {empresaSeleccionada?.NombreEmpresa} | Sede: {sedeSeleccionada?.NombreSede}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p className="italic">Selecciona empresa y sede para generar el número</p>
              <div className="text-xs mt-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${empresaSeleccionada ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Empresa seleccionada
                <span className={`inline-block w-2 h-2 rounded-full ml-2 mr-1 ${sedeSeleccionada ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Sede seleccionada
              </div>
            </div>
          )}
        </div>
        <button
          className={`font-medium px-5 py-2 rounded-lg transition ${
            !numeroSolicitud || generandoNumero || !empresaSeleccionada || !sedeSeleccionada
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={handleContinuar}
          disabled={!numeroSolicitud || generandoNumero || !empresaSeleccionada || !sedeSeleccionada}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  )
}

export default PasoSeleccionEmpresaSede

// import { useEffect, useMemo, useState } from 'react'
// import api from '../../../api/axios'

// function PasoSeleccionEmpresaSede({
//   empresas,
//   sedes,
//   empresaSeleccionada,
//   setEmpresaSeleccionada,
//   sedeSeleccionada,
//   setSedeSeleccionada,
//   usuario,
//   onContinue
// }) {
//   const [loading, setLoading] = useState(false)
//   const [numeroSolicitud, setNumeroSolicitud] = useState(null)
//   const [idSolicitud, setIdSolicitud] = useState(null)

//   const empresaId = empresaSeleccionada?.IdEmpresa || ''
//   const sedeId = sedeSeleccionada?.IdSede || ''

//   const sedesFiltradas = useMemo(() => {
//     return sedes?.filter(s => s.IdEmpresa == empresaId)
//   }, [sedes, empresaId])

//   // ⏳ Pre-cargar número solicitud cuando haya empresa y sede seleccionadas
//   useEffect(() => {
//     const generarNumero = async () => {
//       if (empresaSeleccionada && sedeSeleccionada) {
//         try {
//           const response = await api.get('/generar-numero-solicitud')
//           setNumeroSolicitud(response.data.numeroSolicitud)
//           setIdSolicitud(response.data.idSolicitud)
//         } catch (err) {
//           console.error('⚠️ Error precargando número de solicitud:', err)
//           setNumeroSolicitud(null)
//           setIdSolicitud(null)
//         }
//       }
//     }
//     generarNumero()
//   }, [empresaSeleccionada, sedeSeleccionada])

//   const handleContinuar = () => {
//     if (!empresaSeleccionada || !sedeSeleccionada || !idSolicitud || !numeroSolicitud) {
//       alert('Debes seleccionar empresa y sede, y esperar a que cargue el número de solicitud.')
//       return
//     }

//     onContinue({
//       idSolicitud,
//       numeroSolicitud,
//       empresaSeleccionada,
//       sedeSeleccionada,
//       usuario
//     })
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block font-semibold text-sm mb-1">Empresa</label>
//         <select
//           className="w-full border border-gray-300 rounded px-3 py-2"
//           value={empresaId}
//           onChange={e => {
//             const empresa = empresas.find(emp => emp.IdEmpresa == e.target.value)
//             setEmpresaSeleccionada(empresa)
//             setSedeSeleccionada(null)
//           }}
//         >
//           <option value="">Seleccione empresa</option>
//           {empresas.map(e => (
//             <option key={e.IdEmpresa} value={e.IdEmpresa}>
//               {e.NombreEmpresa}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block font-semibold text-sm mb-1">Sede</label>
//         <select
//           className="w-full border border-gray-300 rounded px-3 py-2"
//           value={sedeId}
//           onChange={e => {
//             const sede = sedes.find(s => s.IdSede == e.target.value)
//             setSedeSeleccionada(sede)
//           }}
//           disabled={!empresaSeleccionada}
//         >
//           <option value="">Seleccione sede</option>
//           {sedesFiltradas.map(s => (
//             <option key={s.IdSede} value={s.IdSede}>
//               {s.NombreSede}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="col-span-2 mt-4 flex justify-between items-center">
//         <div className="text-sm text-gray-500 italic">
//           {numeroSolicitud ? `Número generado: ${numeroSolicitud}` : 'Generando número...'}
//         </div>
//         <button
//           className={`bg-primario text-white px-4 py-2 rounded ${!numeroSolicitud ? 'opacity-50 cursor-not-allowed' : ''}`}
//           onClick={handleContinuar}
//           disabled={!numeroSolicitud}
//         >
//           Siguiente ➡️
//         </button>
//       </div>
//     </div>
//   )
// }

// export default PasoSeleccionEmpresaSede
