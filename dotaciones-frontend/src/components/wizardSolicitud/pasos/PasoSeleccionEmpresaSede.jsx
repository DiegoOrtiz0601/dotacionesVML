import { useState } from 'react'
import api from '../../../api/axios'

function PasoSeleccionEmpresaSede({
  empresas,
  sedes,
  empresaSeleccionada,
  setEmpresaSeleccionada,
  sedeSeleccionada,
  setSedeSeleccionada,
  usuario,
  onContinue
}) {
  const [loading, setLoading] = useState(false)

  // Si empresaSeleccionada es objeto, accede al ID
  const empresaId = empresaSeleccionada?.IdEmpresa || ''
  const sedeId = sedeSeleccionada?.IdSede || ''

  const sedesFiltradas = sedes?.filter(s => s.IdEmpresa == empresaId)

  const handleContinuar = async () => {
  if (!empresaSeleccionada || !sedeSeleccionada) {
    alert('Debes seleccionar empresa y sede antes de continuar.')
    return
  }

  try {
    setLoading(true)
    const response = await api.get('/generar-numero-solicitud')
    const { idSolicitud, numeroSolicitud } = response.data

    onContinue({
      idSolicitud,           // ✅ este es el ID FK real para registrar detalle
      numeroSolicitud,       // ✅ este se muestra al usuario (DOT-000X)
      empresaSeleccionada,
      sedeSeleccionada,
      usuario
    })
  } catch (error) {
    console.error('❌ Error generando número de solicitud:', error)
    alert('Error al generar número de solicitud. Intente nuevamente.')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold text-sm mb-1">Empresa</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
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

      <div>
        <label className="block font-semibold text-sm mb-1">Sede</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
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

      <div className="col-span-2 mt-4 flex justify-end">
        <button
          className={`bg-primario text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleContinuar}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Siguiente ➡️'}
        </button>
      </div>
    </div>
  )
}

export default PasoSeleccionEmpresaSede
