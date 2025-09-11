import { useState, useEffect, useCallback, useMemo } from 'react';
import optimizedApi from '../api/optimizedAxios';

export const useHistorialSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    aprobadas: 0,
    aprobadas_parcial: 0,
    rechazadas: 0
  });
  const [filtros, setFiltros] = useState({
    estado: '',
    empresa: '',
    sede: '',
    fecha_desde: '',
    fecha_hasta: '',
    pagina: 1
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    estado: '',
    empresa: '',
    sede: '',
    fecha_desde: '',
    fecha_hasta: '',
    pagina: 1
  });
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [cargandoFiltros, setCargandoFiltros] = useState(false);
  const [error, setError] = useState(null);

  // Caché local para empresas y sedes
  const [cacheEmpresasSedes, setCacheEmpresasSedes] = useState({
    empresas: null,
    sedes: null,
    timestamp: null
  });

  // Debounce para filtros (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(filtros) !== JSON.stringify(filtrosAplicados)) {
        setFiltrosAplicados({ ...filtros, pagina: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros]);

  // Cargar empresas y sedes con caché
  const cargarEmpresasYSedes = useCallback(async () => {
    const ahora = Date.now();
    const cacheExpirado = !cacheEmpresasSedes.timestamp || 
                          (ahora - cacheEmpresasSedes.timestamp) > 5 * 60 * 1000; // 5 minutos

    if (cacheExpirado) {
      setCargandoFiltros(true);
      try {
        const [empresasRes, sedesRes] = await Promise.all([
          optimizedApi.getCached('/empresas', {}, 5 * 60 * 1000),
          optimizedApi.getCached('/sedes', {}, 5 * 60 * 1000)
        ]);

        setEmpresas(empresasRes.data);
        setSedas(sedesRes.data);
        setCacheEmpresasSedes({
          empresas: empresasRes.data,
          sedes: sedesRes.data,
          timestamp: ahora
        });
      } catch (error) {
        console.error('❌ Error cargando empresas y sedes:', error);
      } finally {
        setCargandoFiltros(false);
      }
    }
  }, [cacheEmpresasSedes]);

  // Cargar historial de solicitudes
  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      console.log('📡 Cargando historial con filtros:', filtrosAplicados);
      
      const response = await optimizedApi.getCached(
        '/solicitudes-historial', 
        filtrosAplicados, 
        2 * 60 * 1000 // 2 minutos de caché
      );
      
      console.log('✅ Respuesta del historial:', response.data);
      
      setSolicitudes(response.data.data);
      setTotalPaginas(response.data.pagination.last_page);
      setEstadisticas(response.data.estadisticas);
      
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      setError('Error cargando historial de solicitudes');
    } finally {
      setCargando(false);
    }
  }, [filtrosAplicados]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresasYSedes();
  }, [cargarEmpresasYSedes]);

  // Cargar historial cuando cambien los filtros aplicados
  useEffect(() => {
    if (JSON.stringify(filtrosAplicados) !== JSON.stringify(filtros)) {
      cargarHistorial();
    }
  }, [filtrosAplicados, cargarHistorial]);

  // Cargar historial cuando cambie la página
  useEffect(() => {
    if (filtros.pagina !== filtrosAplicados.pagina) {
      setFiltrosAplicados(prev => ({ ...prev, pagina: filtros.pagina }));
    }
  }, [filtros.pagina, filtrosAplicados.pagina]);

  // Cargar historial inicial automáticamente
  useEffect(() => {
    cargarHistorial();
  }, []); // Solo se ejecuta al montar el componente

  // Memoizar sedes filtradas por empresa
  const sedesFiltradas = useMemo(() => {
    if (!filtros.empresa) return sedes;
    return sedes.filter(sede => sede.IdEmpresa == filtros.empresa);
  }, [sedes, filtros.empresa]);

  const handleFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor, pagina: 1 }));
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }));
  };

  const recargarDatos = () => {
    cargarHistorial();
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      empresa: '',
      sede: '',
      fecha_desde: '',
      fecha_hasta: '',
      pagina: 1
    });
  };

  const tieneFiltros = Object.values(filtros).some(valor => 
    valor !== '' && valor !== null && valor !== undefined
  );

  return {
    solicitudes,
    empresas,
    sedes: sedesFiltradas,
    estadisticas,
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
    totalSolicitudes: estadisticas.total
  };
};
