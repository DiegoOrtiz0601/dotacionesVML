import { useEffect, useState } from 'react'
import PasoSeleccionEmpresaSede from './pasos/PasoSeleccionEmpresaSede'
import PasoAgregarEmpleados from './pasos/PasoAgregarEmpleados'
import PasoElementosDotacion from './pasos/PasoElementosDotacion'
import api from '../../api/axios'

const WizardSolicitudDotacion = () => {
  const [pasoActual, setPasoActual] = useState(1)
  const [idSolicitud, setIdSolicitud] = useState(null)
  const [numeroSolicitud, setNumeroSolicitud] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [sede, setSede] = useState('')

  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await api.get('/mis-empresas-sedes')
        setEmpresas(response.data.empresas)
        setSedes(response.data.sedes)
      } catch (error) {
        console.error('Error cargando empresas y sedes:', error)
      }
    }

    cargarDatos()
  }, [])

  const irAlSiguientePaso = () => setPasoActual(prev => prev + 1)
  const irAlPasoAnterior = () => setPasoActual(prev => prev - 1)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-primario">🧥 Wizard Solicitud de Dotación</h2>
        <p className="text-sm text-gray-500">Paso {pasoActual} de 3</p>
        {numeroSolicitud && (
          <p className="text-sm text-secundario mt-1 font-medium">
            Número de Solicitud: <span className="font-semibold">{numeroSolicitud}</span>
          </p>
        )}
      </div>

      {pasoActual === 1 && (
        <PasoSeleccionEmpresaSede
          empresas={empresas}
          sedes={sedes}
          empresaSeleccionada={empresa}
          setEmpresaSeleccionada={setEmpresa}
          sedeSeleccionada={sede}
          setSedeSeleccionada={setSede}
          onContinue={({ idSolicitud, numeroSolicitud, empresaSeleccionada, sedeSeleccionada }) => {
            setIdSolicitud(idSolicitud)
            setNumeroSolicitud(numeroSolicitud)
            setEmpresa(empresaSeleccionada)
            setSede(sedeSeleccionada)
            irAlSiguientePaso()
          }}
        />
      )}

      {pasoActual === 2 && idSolicitud && (
        <PasoAgregarEmpleados
          idSolicitud={idSolicitud}
          numeroSolicitud={numeroSolicitud}
          empresa={empresa}
          sede={sede}
          onContinue={irAlSiguientePaso}
          onBack={irAlPasoAnterior}
        />
      )}

      {pasoActual === 3 && idSolicitud && (
        <PasoElementosDotacion
          idSolicitud={idSolicitud}
          onBack={irAlPasoAnterior}
        />
      )}
    </div>
  )
}

export default WizardSolicitudDotacion
