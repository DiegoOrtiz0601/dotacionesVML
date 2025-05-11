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
  const [usuario, setUsuario] = useState(null)
  const [cargoSeleccionado, setCargoSeleccionado] = useState('')
  const [empleadoActual, setEmpleadoActual] = useState(null)
  const [elementosEditados, setElementosEditados] = useState(null)
  const [resumenSolicitud, setResumenSolicitud] = useState([])

  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [empresaSedesRes, usuarioRes] = await Promise.all([
          api.get('/mis-empresas-sedes'),
          api.get('/usuario-autenticado')
        ])
        setEmpresas(empresaSedesRes.data.empresas)
        setSedes(empresaSedesRes.data.sedes)
        setUsuario(usuarioRes.data)
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
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
    console.log('🧪 Elementos que se van al resumen:', elementos)
    setResumenSolicitud(prev => [...prev, nuevoEmpleado])
    setElementosEditados(null)
  }

  const agregarOtroEmpleado = () => {
    setEmpleadoActual(null)
    setCargoSeleccionado('')
    setElementosEditados(null)
    setPasoActual(2)
  }

  const modificarEmpleado = (index) => {
    const empleado = resumenSolicitud[index]
    setEmpleadoActual(empleado)
    setCargoSeleccionado(empleado.idCargo || '')
    setElementosEditados(empleado.elementos || [])
    setResumenSolicitud(prev => prev.filter((_, i) => i !== index))
    setPasoActual(3)
  }

  const eliminarEmpleado = (index) => {
    const nuevos = [...resumenSolicitud]
    nuevos.splice(index, 1)
    setResumenSolicitud(nuevos)
  }

  const enviarSolicitudFinal = () => {
    alert(`✅ Solicitud #${numeroSolicitud} enviada correctamente (función simulada).`)
    console.log({
      idSolicitud,
      empresa,
      sede,
      usuario,
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
            usuario={usuario}
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
            elementosPrecargados={elementosEditados}
          />
        )}
      </div>

      <ResumenSolicitud
        numeroSolicitud={numeroSolicitud}
        empresa={empresa}
        sede={sede}
        usuario={usuario}
        resumenSolicitud={resumenSolicitud}
        onEnviarSolicitudFinal={enviarSolicitudFinal}
        onModificarEmpleado={modificarEmpleado}
        onEliminarEmpleado={eliminarEmpleado}
      />
    </>
  )
}

export default WizardSolicitudDotacion
