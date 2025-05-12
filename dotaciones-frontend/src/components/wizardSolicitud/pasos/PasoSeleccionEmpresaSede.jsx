import { useEffect, useMemo, useState } from 'react'
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
  const [numeroSolicitud, setNumeroSolicitud] = useState(null)
  const [idSolicitud, setIdSolicitud] = useState(null)

  const empresaId = empresaSeleccionada?.IdEmpresa || ''
  const sedeId = sedeSeleccionada?.IdSede || ''

  const sedesFiltradas = useMemo(() => {
    return sedes?.filter(s => s.IdEmpresa == empresaId)
  }, [sedes, empresaId])

  // ⏳ Pre-cargar número solicitud cuando haya empresa y sede seleccionadas
  useEffect(() => {
    const generarNumero = async () => {
      if (empresaSeleccionada && sedeSeleccionada) {
        try {
          const response = await api.get('/generar-numero-solicitud')
          setNumeroSolicitud(response.data.numeroSolicitud)
          setIdSolicitud(response.data.idSolicitud)
        } catch (err) {
          console.error('⚠️ Error precargando número de solicitud:', err)
          setNumeroSolicitud(null)
          setIdSolicitud(null)
        }
      }
    }
    generarNumero()
  }, [empresaSeleccionada, sedeSeleccionada])

  const handleContinuar = () => {
    if (!empresaSeleccionada || !sedeSeleccionada || !idSolicitud || !numeroSolicitud) {
      alert('Debes seleccionar empresa y sede, y esperar a que cargue el número de solicitud.')
      return
    }

    onContinue({
      idSolicitud,
      numeroSolicitud,
      empresaSeleccionada,
      sedeSeleccionada,
      usuario
    })
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

      <div className="col-span-2 mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 italic">
          {numeroSolicitud ? `Número generado: ${numeroSolicitud}` : 'Generando número...'}
        </div>
        <button
          className={`bg-primario text-white px-4 py-2 rounded ${!numeroSolicitud ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleContinuar}
          disabled={!numeroSolicitud}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  )
}

export default PasoSeleccionEmpresaSede
