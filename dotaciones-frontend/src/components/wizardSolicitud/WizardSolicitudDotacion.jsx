import { useEffect, useState } from 'react'
import PasoSeleccionEmpresaSede from './pasos/PasoSeleccionEmpresaSede'
import PasoAgregarEmpleados from './pasos/PasoAgregarEmpleados'
import PasoElementosDotacion from './pasos/PasoElementosDotacion'
import ResumenSolicitud from './ResumenSolicitud'
import api from '../../api/axios'

const WizardSolicitudDotacion = () => {
  const [pasoActual, setPasoActual] = useState(1)
  const [idSolicitud, setIdSolicitud] = useState(null)
  const [numeroSolicitud, setNumeroSolicitud] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [sede, setSede] = useState('')
  const [cargoSeleccionado, setCargoSeleccionado] = useState('')
  const [empleadoActual, setEmpleadoActual] = useState(null)
  const [resumenSolicitud, setResumenSolicitud] = useState([])

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

  const agregarEmpleadoAResumen = (elementos) => {
    if (!empleadoActual) return
    const nuevoEmpleado = {
      ...empleadoActual,
      elementos
    }
    setResumenSolicitud(prev => [...prev, nuevoEmpleado])
  }

  const agregarOtroEmpleado = () => {
    setEmpleadoActual(null)
    setCargoSeleccionado('')
    setPasoActual(2)
  }

  const enviarSolicitudFinal = () => {
    // 🔐 Aquí podrías hacer un POST al backend con todos los datos
    alert(`✅ Solicitud #${numeroSolicitud} enviada correctamente (función simulada).`)
    console.log({
      idSolicitud,
      empresa,
      sede,
      resumenSolicitud
    })
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primario">🧥 Wizard Solicitud de Dotación</h2>
          <p className="text-sm text-gray-500">Paso {pasoActual} de 3</p>
        </div>

        {pasoActual === 1 && (
          <PasoSeleccionEmpresaSede
            empresas={empresas}
            sedes={sedes}
            empresaSeleccionada={empresa}
            setEmpresaSeleccionada={setEmpresa}
            sedeSeleccionada={sede}
            setSedeSeleccionada={setSede}
            onContinue={(datos) => {
              setIdSolicitud(datos.idSolicitud)
              setNumeroSolicitud(datos.numeroSolicitud)
              setEmpresa(datos.empresaSeleccionada)
              setSede(datos.sedeSeleccionada)
              irAlSiguientePaso()
            }}
          />
        )}

        {pasoActual === 2 && idSolicitud && (
          <PasoAgregarEmpleados
            idSolicitud={idSolicitud}
            empresa={empresa}
            sede={sede}
            cargoSeleccionado={cargoSeleccionado}
            setCargoSeleccionado={setCargoSeleccionado}
            onContinue={irAlSiguientePaso}
            onBack={irAlPasoAnterior}
            setEmpleadoActual={setEmpleadoActual}
          />
        )}

        {pasoActual === 3 && idSolicitud && (
          <PasoElementosDotacion
            idSolicitud={idSolicitud}
            idEmpresa={empresa}
            idCargo={cargoSeleccionado}
            onBack={irAlPasoAnterior}
            onAgregarOtroEmpleado={agregarOtroEmpleado}
            agregarEmpleadoAResumen={agregarEmpleadoAResumen}
          />
        )}
      </div>

      {/* RESUMEN VISUAL */}
      <ResumenSolicitud
        numeroSolicitud={numeroSolicitud}
        empresa={empresa}
        sede={sede}
        resumenSolicitud={resumenSolicitud}
        onEnviarSolicitudFinal={enviarSolicitudFinal}
      />
    </>
  )
}

export default WizardSolicitudDotacion
