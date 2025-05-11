import { useEffect, useState } from 'react'
import api from '../../../api/axios'

const PasoElementosDotacion = ({
  idSolicitud,
  idEmpresa,
  idCargo,
  onBack,
  onAgregarOtroEmpleado,
  agregarEmpleadoAResumen,
  elementosPrecargados = null
}) => {
  const [elementos, setElementos] = useState([])
  const [seleccionados, setSeleccionados] = useState({})

  useEffect(() => {
    const cargarElementos = async () => {
      try {
        const empresaId = typeof idEmpresa === 'object' ? idEmpresa.IdEmpresa : idEmpresa
        const cargoId = typeof idCargo === 'object' ? idCargo.IdCargo : idCargo
        
if (!empresaId || !cargoId) {
  console.warn('❌ idEmpresa o idCargo no definidos correctamente')
  return
}
        const response = await api.get('/elementos-dotacion', {
          params: {
            idEmpresa: empresaId,
            idCargo: cargoId
          }
        })

        setElementos(response.data)
      } catch (error) {
        console.error('Error cargando elementos de dotación:', error)
      }
    }

    cargarElementos()
  }, [idEmpresa, idCargo])

  useEffect(() => {
    if (elementosPrecargados && elementos.length > 0) {
      const precargadosMap = {}
      elementosPrecargados.forEach(el => {
        const elementoReal = elementos.find(e => Number(e.idElemento) === Number(el.idElemento))

        precargadosMap[el.idElemento] = {
          checked: true,
          talla: el.talla,
          cantidad: el.cantidad,
          nombreElemento: elementoReal?.nombreElemento || el.nombreElemento || 'Elemento desconocido'
        }
      })
      setSeleccionados(precargadosMap)
    }
  }, [elementosPrecargados, elementos])

  const manejarSeleccion = (idElemento, checked) => {
    const id = Number(idElemento)
    setSeleccionados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        checked
      }
    }))
  }

  const actualizarTalla = (idElemento, talla) => {
    const id = Number(idElemento)
    setSeleccionados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        talla
      }
    }))
  }

  const actualizarCantidad = (idElemento, cantidad) => {
    const id = Number(idElemento)
    setSeleccionados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        cantidad
      }
    }))
  }

  const manejarAgregar = () => {
    const elementosFinales = Object.entries(seleccionados)
      .filter(([_, val]) => val.checked && val.talla && val.cantidad)
      .map(([idElemento, val]) => {
        const id = Number(idElemento)
        const elementoRef = elementos.find(e => Number(e.idElemento) === id)
        const nombreElemento = elementoRef?.nombreElemento || val.nombreElemento || 'Elemento no encontrado'

        return {
          idElemento: id,
          nombreElemento,
          talla: val.talla,
          cantidad: val.cantidad
        }
      })

    console.log('🧪 Elementos agregados al resumen:', elementosFinales)

    if (elementosFinales.length === 0) {
      alert('⚠️ Debes seleccionar al menos un elemento con talla y cantidad.')
      return
    }

    agregarEmpleadoAResumen(elementosFinales)

    if (confirm('¿Deseas agregar otro empleado?')) {
      onAgregarOtroEmpleado()
    } else {
      alert('✅ Solicitud preparada para enviar (simulado)')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar Elementos de Dotación</h3>

      {elementos.map((elemento) => (
        <div key={elemento.idElemento} className="border p-4 mb-2 rounded shadow-sm">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={seleccionados[elemento.idElemento]?.checked || false}
              onChange={(e) => manejarSeleccion(elemento.idElemento, e.target.checked)}
            />
            <span className="font-semibold">{elemento.nombreElemento}</span>
          </label>

          {seleccionados[elemento.idElemento]?.checked && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm">Talla</label>
                <select
                  className="w-full border px-2 py-1"
                  value={seleccionados[elemento.idElemento]?.talla || ''}
                  onChange={(e) => actualizarTalla(elemento.idElemento, e.target.value)}
                >
                  <option value="">Seleccione talla</option>
                  {elemento.tallas?.split(',').map((talla, i) => (
                    <option key={i} value={talla.trim()}>{talla.trim()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border px-2 py-1"
                  value={seleccionados[elemento.idElemento]?.cantidad || ''}
                  onChange={(e) => actualizarCantidad(elemento.idElemento, e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          ⬅️ Volver
        </button>
        <button
          onClick={manejarAgregar}
          className="bg-primario text-white px-4 py-2 rounded"
        >
          Agregar
        </button>
      </div>
    </div>
  )
}

export default PasoElementosDotacion
