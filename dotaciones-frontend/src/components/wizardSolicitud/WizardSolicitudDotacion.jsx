import { useEffect, useState } from 'react'
import PasoSeleccionEmpresaSede from './pasos/PasoSeleccionEmpresaSede'
import PasoAgregarEmpleados from './pasos/PasoAgregarEmpleados'
import PasoElementosDotacion from './pasos/PasoElementosDotacion'
import ResumenSolicitud from './ResumenSolicitud'
import Loader from '../Loader'

import api from '../../api/axios'

const WizardSolicitudDotacion = () => {
  const [cargando, setCargando] = useState(false)
  const [pasoActual, setPasoActual] = useState(1)

  const [idSolicitud, setIdSolicitud] = useState(null)
  const [numeroSolicitud, setNumeroSolicitud] = useState('')

  const [empresa, setEmpresa] = useState(null)
  const [sede, setSede] = useState(null)
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
        console.log('✅ Usuario y empresas cargadas:', usuarioRes.data)
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
    console.log('📌 Empleado agregado con elementos:', nuevoEmpleado)
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

  const enviarSolicitudFinal = async () => {
  console.log('🔥 Iniciando envío de solicitud')
  setCargando(true)

  try {
    const response = await api.post('/solicitudes', {
      idUsuario: usuario.idUsuario,
      idEmpresa: empresa.IdEmpresa,
      idSede: sede.IdSede,
      estadoSolicitud: 'En revisión',
      fechaSolicitud: new Date().toISOString()
    })

    const idSol = response.data.id
    const numeroSol = response.data.idSolicitud

    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 Solicitud creada con ID: ${idSol}, Número: ${numeroSol}`)
    }

    setIdSolicitud(idSol)
    setNumeroSolicitud(numeroSol)

    for (const emp of resumenSolicitud) {
      try {
        console.log('👤 Guardando empleado:', emp.nombresEmpleado)

        const responseDetalle = await api.post('/detalle-solicitud-empleado', {
          idSolicitud: idSol,
          nombresEmpleado: emp.nombresEmpleado,
          documentoEmpleado: emp.documentoEmpleado,
          idCargo: emp.idCargo,
          idTipoSolicitud: emp.IdTipoSolicitud,
          observaciones: emp.observaciones || '',
          EstadoSolicitudEmpleado: 'En revisión',
        })

        const idDetalleSolicitud = responseDetalle.data.idDetalleSolicitud
        emp.idDetalleSolicitud = idDetalleSolicitud

        console.log(`📌 Empleado guardado con ID detalle: ${idDetalleSolicitud}`)

        // Guardar elementos
        if (Array.isArray(emp.elementos) && emp.elementos.length > 0) {
          const peticionesElementos = emp.elementos.map((elemento) =>
            api.post('/detalle-solicitud-elemento', {
              idDetalleSolicitud,
              idElemento: elemento.idElemento,
              TallaElemento: elemento.talla,
              Cantidad: elemento.cantidad
            }).catch(err => {
              console.error(`❌ Error guardando elemento ${elemento.nombreElemento}:`, err.response?.data || err)
            })
          )
          await Promise.all(peticionesElementos)
          console.log(`🧾 Se registraron ${emp.elementos.length} elementos para ${emp.nombresEmpleado}`)
        }

        // Guardar evidencias (si aplica)
        if (emp.evidencias && emp.evidencias.length > 0 && emp.IdTipoSolicitud !== 1) {
          for (const evidencia of emp.evidencias) {
            const formData = new FormData()
            formData.append('idSolicitud', idSol)
            formData.append('documentoEmpleado', emp.documentoEmpleado)
            formData.append('nombreEmpresa', empresa.NombreEmpresa)
            formData.append('archivo', evidencia)

            try {
              await api.post('/guardar-evidencia', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
              console.log(`📁 Evidencia cargada para ${emp.nombresEmpleado}: ${evidencia.name}`)
            } catch (err) {
              console.error(`❌ Error subiendo evidencia ${evidencia.name}:`, err.response?.data || err)
            }
          }
        }

      } catch (error) {
        console.error(`🛑 Error con el empleado ${emp.nombresEmpleado}:`, error.response?.data || error)
        alert(`🛑 Error guardando empleado ${emp.nombresEmpleado}:\n` + JSON.stringify(error.response?.data?.errors, null, 2))
        // Continúa con el siguiente empleado
      }
    }

    alert(`✅ Solicitud #${numeroSol} enviada correctamente.`)

  } catch (error) {
    console.error('❌ Error global al guardar la solicitud:', error.response?.data || error)
    alert('❌ Error global:\n' + JSON.stringify(error.response?.data?.errors, null, 2))
  } finally {
    // Resetear el formulario
    setResumenSolicitud([])
    setEmpleadoActual(null)
    setElementosEditados(null)
    setCargoSeleccionado('')
    setIdSolicitud(null)
    setNumeroSolicitud('')
    setPasoActual(1)
    setCargando(false)
  }
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
            onContinue={({ idSolicitud, numeroSolicitud, empresaSeleccionada, sedeSeleccionada }) => {
              setIdSolicitud(idSolicitud)
              setNumeroSolicitud(numeroSolicitud)
              setEmpresa(empresaSeleccionada)
              setSede(sedeSeleccionada)
              irAlSiguientePaso()
            }}
          />
        )}

        {pasoActual === 2 && (
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

        {pasoActual === 3 && (
          <PasoElementosDotacion
            idEmpresa={empresa?.IdEmpresa}
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
      {cargando && <Loader />}
    </>
  )
}

export default WizardSolicitudDotacion
