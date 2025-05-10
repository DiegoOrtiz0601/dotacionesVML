import { useEffect, useState } from 'react'
import api from '../../../api/axios'

const PasoElementosDotacion = ({ idSolicitud, idEmpresa, idCargo, onBack, onAgregarOtroEmpleado, agregarEmpleadoAResumen }) => {
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
        console.error('Error cargando elementos de dotación:', error)
      }
    }

    cargarElementos()
  }, [idEmpresa, idCargo])

  const manejarSeleccion = (idElemento, checked) => {
    setSeleccionados(prev => ({
      ...prev,
      [idElemento]: {
        ...prev[idElemento],
        checked
      }
    }))
  }

  const actualizarTalla = (idElemento, talla) => {
    setSeleccionados(prev => ({
      ...prev,
      [idElemento]: {
        ...prev[idElemento],
        talla
      }
    }))
  }

  const actualizarCantidad = (idElemento, cantidad) => {
    setSeleccionados(prev => ({
      ...prev,
      [idElemento]: {
        ...prev[idElemento],
        cantidad
      }
    }))
  }

  const manejarAgregar = () => {
    const elementosFinales = Object.entries(seleccionados)
      .filter(([_, val]) => val.checked && val.talla && val.cantidad)
      .map(([idElemento, val]) => {
        const nombreElemento = elementos.find(e => e.idElemento === parseInt(idElemento))?.nombreElemento
        return {
          idElemento: parseInt(idElemento),
          nombreElemento,
          talla: val.talla,
          cantidad: val.cantidad
        }
      })

    if (elementosFinales.length === 0) {
      alert('⚠️ Debes seleccionar al menos un elemento con talla y cantidad.')
      return
    }

    if (typeof agregarEmpleadoAResumen === 'function') {
      agregarEmpleadoAResumen(elementosFinales)
    } else {
      console.error('❌ agregarEmpleadoAResumen no es una función válida')
      return
    }

    if (confirm('¿Deseas agregar otro empleado?')) {
      onAgregarOtroEmpleado()
    } else {
      alert('✅ Solicitud preparada para enviar (simulado)')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar Elementos de Dotación</h3>

      {elementos.map((elemento, index) => (
        <div key={index} className="border p-4 mb-2 rounded shadow-sm">
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
                  onChange={(e) => actualizarTalla(elemento.idElemento, e.target.value)}
                >
                  <option value="">Seleccione talla</option>
                  {elemento.tallas.split(',').map((talla, i) => (
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

export default PasoElementosDotacion;
