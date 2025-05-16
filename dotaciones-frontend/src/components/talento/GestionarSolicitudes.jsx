import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

 
const GestionarSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [estados] = useState(['Pendiente', 'Aprobada', 'Rechazada', 'En revisión'])
  const [filtros, setFiltros] = useState({
    empresa: '',
    sede: '',
    estado: '',
    pagina: 1
  })

  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    cargarEmpresasYSedes()
  }, [])

  useEffect(() => {
    console.log('📡 Cargando solicitudes con filtros:', filtros)
    cargarSolicitudes()
  }, [filtros])

  const cargarEmpresasYSedes = async () => {
    try {
      const [resEmpresas, resSedes] = await Promise.all([
        api.get('/empresas'),
        api.get('/sedes')
      ])
      setEmpresas(resEmpresas.data)
      setSedes(resSedes.data)
    } catch (error) {
      console.error('❌ Error cargando empresas y sedes:', error)
    }
  }

  const cargarSolicitudes = async () => {
    try {
      const response = await api.get('/solicitudes-gestion', { params: filtros })
       console.log('✅ Respuesta de solicitudes:', response.data)
      setSolicitudes(response.data.data)
      setTotalPaginas(response.data.last_page)
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
    }
  }

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value, pagina: 1 })
  }

  const cambiarPagina = (nuevaPagina) => {
    setFiltros({ ...filtros, pagina: nuevaPagina })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Gestionar Solicitudes</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select name="empresa" value={filtros.empresa} onChange={handleFiltro} className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200">
          <option value="">Todas las empresas</option>
          {empresas.map((e) => (
            <option key={e.IdEmpresa} value={e.IdEmpresa}>{e.NombreEmpresa}</option>
          ))}
        </select>

        <select name="sede" value={filtros.sede} onChange={handleFiltro} className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200">
          <option value="">Todas las sedes</option>
          {sedes.map((s) => (
            <option key={s.IdSede} value={s.IdSede}>{s.NombreSede}</option>
          ))}
        </select>

        
      </div>

      {/* Tabla de solicitudes */}
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
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay resultados</td>
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

      {/* Paginación */}
      <div className="mt-6 flex justify-end gap-2">
        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i}
            onClick={() => cambiarPagina(i + 1)}
            className={`px-3 py-1 text-sm rounded border ${
              filtros.pagina === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GestionarSolicitudes
