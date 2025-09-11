import { useState, useEffect, useCallback, useMemo } from 'react'
import optimizedApi from '../api/optimizedAxios'

export const useGestionarSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [filtros, setFiltros] = useState({
    empresa: '',
    sede: '',
    estado: '',
    pagina: 1
  })
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    empresa: '',
    sede: '',
    estado: '',
    pagina: 1
  })
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [cargandoFiltros, setCargandoFiltros] = useState(false)
  const [error, setError] = useState(null)

  // Caché local para empresas y sedes
  const [cacheEmpresasSedes, setCacheEmpresasSedes] = useState({
    empresas: null,
    sedes: null,
    timestamp: null
  })

  // Debounce para filtros (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(filtros) !== JSON.stringify(filtrosAplicados)) {
        setFiltrosAplicados({ ...filtros, pagina: 1 })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [filtros])

  // Cargar empresas y sedes con caché
  const cargarEmpresasYSedes = useCallback(async () => {
    const ahora = Date.now()
    const cacheValido = 5 * 60 * 1000 // 5 minutos

    // Verificar caché
    if (cacheEmpresasSedes.empresas && 
        cacheEmpresasSedes.sedes && 
        (ahora - cacheEmpresasSedes.timestamp) < cacheValido) {
      setEmpresas(cacheEmpresasSedes.empresas)
      setSedes(cacheEmpresasSedes.sedes)
      return
    }

    setCargandoFiltros(true)
    setError(null)

    try {
      const [resEmpresas, resSedes] = await Promise.all([
        optimizedApi.getCached('/empresas', {}, 10 * 60 * 1000),
        optimizedApi.getCached('/sedes', {}, 10 * 60 * 1000)
      ])
      
      const empresasData = resEmpresas.data
      const sedesData = resSedes.data
      
      setEmpresas(empresasData)
      setSedes(sedesData)
      
      // Actualizar caché
      setCacheEmpresasSedes({
        empresas: empresasData,
        sedes: sedesData,
        timestamp: ahora
      })
    } catch (error) {
      console.error('❌ Error cargando empresas y sedes:', error)
      setError('Error cargando filtros')
    } finally {
      setCargandoFiltros(false)
    }
  }, [cacheEmpresasSedes])

  // Cargar solicitudes con caché
  const cargarSolicitudes = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      console.log('📡 Cargando solicitudes con filtros:', filtrosAplicados)
      console.log('📄 Página solicitada:', filtrosAplicados.pagina)
      
      const response = await optimizedApi.getCached(
        '/solicitudes-gestion', 
        filtrosAplicados, 
        2 * 60 * 1000 // 2 minutos de caché
      )
      
      console.log('✅ Respuesta de solicitudes:', response.data)
      console.log('📊 Total de páginas:', response.data.last_page)
      console.log('📄 Página actual:', response.data.current_page)
      
      setSolicitudes(response.data.data)
      setTotalPaginas(response.data.last_page)
      
      // Verificar que la página solicitada coincida con la recibida
      if (response.data.current_page !== filtrosAplicados.pagina) {
        console.warn('⚠️ La página solicitada no coincide con la recibida')
      }
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
      setError('Error cargando solicitudes')
    } finally {
      setCargando(false)
    }
  }, [filtrosAplicados])

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresasYSedes()
  }, [cargarEmpresasYSedes])

  // Cargar solicitudes cuando cambien los filtros aplicados
  useEffect(() => {
    if (JSON.stringify(filtrosAplicados) !== JSON.stringify(filtros)) {
      cargarSolicitudes()
    }
  }, [filtrosAplicados, cargarSolicitudes])

  // Cargar solicitudes cuando cambie la página
  useEffect(() => {
    if (filtros.pagina !== filtrosAplicados.pagina) {
      setFiltrosAplicados(prev => ({ ...prev, pagina: filtros.pagina }))
    }
  }, [filtros.pagina, filtrosAplicados.pagina])

  // Cargar solicitudes iniciales automáticamente
  useEffect(() => {
    cargarSolicitudes()
  }, []) // Solo se ejecuta al montar el componente

  // Memoizar sedes filtradas por empresa
  const sedesFiltradas = useMemo(() => {
    if (!filtros.empresa) return sedes
    return sedes.filter(s => s.IdEmpresa == filtros.empresa)
  }, [sedes, filtros.empresa])

  // Función para cambiar filtros
  const handleFiltro = useCallback((e) => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }, [])

  // Función para cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    console.log('🔄 Cambiando a página:', nuevaPagina)
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }))
  }, [])

  // Función para recargar datos
  const recargarDatos = useCallback(() => {
    setError(null)
    cargarEmpresasYSedes()
    cargarSolicitudes()
  }, [cargarEmpresasYSedes, cargarSolicitudes])

  // Función para limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      empresa: '',
      sede: '',
      estado: '',
      pagina: 1
    })
  }, [])

  return {
    // Estado
    solicitudes,
    empresas,
    sedes: sedesFiltradas,
    filtros,
    filtrosAplicados,
    totalPaginas,
    cargando,
    cargandoFiltros,
    error,
    
    // Funciones
    handleFiltro,
    cambiarPagina,
    recargarDatos,
    limpiarFiltros,
    
    // Estados computados
    tieneFiltros: filtros.empresa || filtros.sede || filtros.estado,
    totalSolicitudes: solicitudes.length
  }
}
