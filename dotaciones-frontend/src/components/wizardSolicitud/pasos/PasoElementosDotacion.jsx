import { useEffect, useState } from 'react'
import api from '../../../api/axios'

const PasoElementosDotacion = ({
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
        const response = await api.get('/elementos-dotacion', {
          params: { idEmpresa, idCargo }
        })
        setElementos(response.data)
      } catch (error) {
        console.error('❌ Error cargando elementos:', error)
      }
    }
    if (idEmpresa && idCargo) {
      cargarElementos()
    }
  }, [idEmpresa, idCargo])

  useEffect(() => {
    if (elementosPrecargados?.length && elementos.length > 0) {
      const map = {}
      elementosPrecargados.forEach(el => {
        map[el.idElemento] = {
          checked: true,
          talla: el.talla,
          cantidad: el.cantidad,
          nombreElemento: el.nombreElemento
        }
      })
      setSeleccionados(map)
    }
  }, [elementosPrecargados, elementos])

  const manejarSeleccion = (id, checked) => {
    setSeleccionados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        checked
      }
    }))
  }

  const actualizarTalla = (id, talla) => {
    setSeleccionados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        talla
      }
    }))
  }

  const actualizarCantidad = (id, cantidad) => {
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
      .filter(([_, val]) => val.checked && val.talla?.trim() && Number(val.cantidad) > 0)
      .map(([idElemento, val]) => ({
        idElemento: Number(idElemento),
        talla: val.talla,
        cantidad: Number(val.cantidad),
        nombreElemento: val.nombreElemento
      }))

    if (elementosFinales.length === 0) {
      alert('⚠️ Debes seleccionar al menos un elemento con talla y cantidad.')
      return
    }

    agregarEmpleadoAResumen(elementosFinales)

    if (confirm('¿Deseas agregar otro empleado?')) {
      onAgregarOtroEmpleado()
    } else {
      alert('✅ Elementos cargados. Listo para enviar.')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar Elementos de Dotación</h3>

      {elementos.map((el) => {
        const tallas = el.tallas?.split(',') || []

        return (
          <div key={el.idElemento} className="border p-4 mb-2 rounded shadow-sm">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={seleccionados[el.idElemento]?.checked || false}
                onChange={(e) => manejarSeleccion(el.idElemento, e.target.checked)}
              />
              <span className="font-semibold">{el.nombreElemento}</span>
            </label>

            {seleccionados[el.idElemento]?.checked && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm">Talla</label>
                  <select
                    className="w-full border px-2 py-1"
                    value={seleccionados[el.idElemento]?.talla || ''}
                    onChange={(e) => actualizarTalla(el.idElemento, e.target.value)}
                  >
                    <option value="">Seleccione talla</option>
                    {tallas.map((talla, i) => (
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
                    value={seleccionados[el.idElemento]?.cantidad || ''}
                    onChange={(e) => actualizarCantidad(el.idElemento, e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}

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
