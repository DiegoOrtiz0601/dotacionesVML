import { useEffect, useState } from 'react'
import api from '../../../api/axios'

const PasoElementosDotacion = ({ idSolicitud, onBack }) => {
  const [elementos, setElementos] = useState([])
  const [seleccionados, setSeleccionados] = useState([])

  useEffect(() => {
    const cargarElementos = async () => {
      try {
        const response = await api.get('/elementos-dotacion', {
          params: { idSolicitud }
        })
        setElementos(response.data)
      } catch (error) {
        console.error('Error cargando elementos:', error)
      }
    }
    cargarElementos()
  }, [idSolicitud])

  const toggleSeleccion = (idElemento) => {
    setSeleccionados(prev => {
      if (prev.includes(idElemento)) {
        return prev.filter(id => id !== idElemento)
      } else {
        return [...prev, idElemento]
      }
    })
  }

  const enviarElementos = async () => {
    try {
      await api.post('/asignar-elementos', {
        idSolicitud,
        elementos: seleccionados
      })
      alert('Elementos asignados exitosamente')
    } catch (error) {
      console.error('Error al asignar elementos:', error)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Seleccionar Elementos de Dotación</h3>

      <ul className="space-y-2 mb-6">
        {elementos.map(el => (
          <li key={el.idElemento} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seleccionados.includes(el.idElemento)}
              onChange={() => toggleSeleccion(el.idElemento)}
            />
            <span>{el.nombreElemento} ({el.talla})</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-300 px-4 py-2 rounded">⬅️ Volver</button>
        <button onClick={enviarElementos} className="bg-primario text-white px-4 py-2 rounded">Finalizar</button>
      </div>
    </div>
  )
}

export default PasoElementosDotacion