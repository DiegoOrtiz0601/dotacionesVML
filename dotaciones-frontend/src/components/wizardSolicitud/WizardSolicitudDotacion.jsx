import { useEffect, useState } from 'react'
import PasoSeleccionEmpresaSede from './pasos/PasoSeleccionEmpresaSede'
import PasoAgregarEmpleados from './pasos/PasoAgregarEmpleados'
import PasoElementosDotacion from './pasos/PasoElementosDotacion'
import ResumenSolicitud from './ResumenSolicitud'
import api from '../../api/axios'

const WizardSolicitudDotacion = () => {
  // Estados de navegación del wizard
  const [pasoActual, setPasoActual] = useState(1)

  // Estado para manejar ID real (PK autoincremental) y número visual (DOT-000X)
  const [idSolicitud, setIdSolicitud] = useState(null)
  const [numeroSolicitud, setNumeroSolicitud] = useState('')

  // Estado para datos básicos
  const [empresa, setEmpresa] = useState(null)
  const [sede, setSede] = useState(null)
  const [usuario, setUsuario] = useState(null)

  // Estado para empleados y dotaciones
  const [cargoSeleccionado, setCargoSeleccionado] = useState('')
  const [empleadoActual, setEmpleadoActual] = useState(null)
  const [elementosEditados, setElementosEditados] = useState(null)
  const [resumenSolicitud, setResumenSolicitud] = useState([])

  // Listados globales
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])

  // Cargar datos iniciales del usuario autenticado y sus empresas/sedes
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

  // Paso siguiente/anterior
  const irAlSiguientePaso = () => setPasoActual(prev => prev + 1)
  const irAlPasoAnterior = () => setPasoActual(prev => prev - 1)

  // Guardar empleado con sus elementos asignados
  const agregarEmpleadoAResumen = (elementos) => {
    if (!empleadoActual) return
    const nuevoEmpleado = {
      ...empleadoActual,
      elementos
    }
    setResumenSolicitud(prev => [...prev, nuevoEmpleado])
    setElementosEditados(null)
  }

  // Volver al paso 2 a agregar otro empleado
  const agregarOtroEmpleado = () => {
    setEmpleadoActual(null)
    setCargoSeleccionado('')
    setElementosEditados(null)
    setPasoActual(2)
  }

  // Modificar empleado ya agregado
  const modificarEmpleado = (index) => {
    const empleado = resumenSolicitud[index]
    setEmpleadoActual(empleado)
    setCargoSeleccionado(empleado.idCargo || '')
    setElementosEditados(empleado.elementos || [])
    setResumenSolicitud(prev => prev.filter((_, i) => i !== index))
    setPasoActual(3)
  }

  // Eliminar empleado de la lista
  const eliminarEmpleado = (index) => {
    const nuevos = [...resumenSolicitud]
    nuevos.splice(index, 1)
    setResumenSolicitud(nuevos)
  }

  // Enviar la solicitud final con todos los empleados
  const enviarSolicitudFinal = async () => {
    try {
      // 1️⃣ Se guarda la solicitud y se obtiene el ID real y el número DOT-000X
      const response = await api.post('/solicitudes', {
        idUsuario: usuario.idUsuario,
        idEmpresa: empresa.IdEmpresa,
        idSede: sede.IdSede,
        estadoSolicitud: 'En revisión',
        fechaSolicitud: new Date().toISOString()
      })

      const idSol = response.data.id         // ← FK real para detalle
      const numeroSol = response.data.idSolicitud  // ← visible al usuario

      setIdSolicitud(idSol)
      setNumeroSolicitud(numeroSol)

      // 2️⃣ Se guarda cada empleado con sus datos vinculados a la solicitud
      for (const emp of resumenSolicitud) {
        try {
          await api.post('/detalle-solicitud-empleado', {
            idSolicitud: idSol, // ← FK a tbl_solicitudes (campo id)
            nombresEmpleado: emp.nombresEmpleado,
            documentoEmpleado: emp.documentoEmpleado,
            idCargo: emp.idCargo,
            idTipoSolicitud: emp.IdTipoSolicitud,
            observaciones: emp.observaciones || '',
            EstadoSolicitudEmpleado: 'En revisión',
          })

          // 3️⃣ Si hay evidencias (y tipo ≠ 1), se suben
          if (
            emp.evidencias &&
            emp.evidencias.length > 0 &&
            emp.IdTipoSolicitud !== 1
          ) {
            for (const evidencia of emp.evidencias) {
              const formData = new FormData()
              formData.append('idSolicitud', idSol)
              formData.append('documentoEmpleado', emp.documentoEmpleado)
              formData.append('nombreEmpresa', empresa.NombreEmpresa)
              formData.append('archivo', evidencia)

              await api.post('/guardar-evidencia', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
            }
          }
        } catch (error) {
          console.error('🛑 Error detalle empleado:', error.response?.data || error)
          alert('🛑 Error guardando un empleado:\n' + JSON.stringify(error.response?.data?.errors, null, 2))
          return
        }
      }

      // 4️⃣ Confirmación final
      alert(`✅ Solicitud #${numeroSol} enviada correctamente.`)
    } catch (error) {
      console.error('❌ Error global al guardar la solicitud:', error.response?.data || error)
      alert('❌ Error global:\n' + JSON.stringify(error.response?.data?.errors, null, 2))
    }
  }

  // Render del wizard paso a paso
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
            onContinue={({
              idSolicitud,           // ← id real (autoincremental)
              numeroSolicitud,       // ← visible tipo DOT-0001
              empresaSeleccionada,
              sedeSeleccionada
            }) => {
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
            idSolicitud={idSolicitud}
            idEmpresa={empresa?.IdEmpresa}
            idCargo={cargoSeleccionado}
            onBack={irAlPasoAnterior}
            onAgregarOtroEmpleado={agregarOtroEmpleado}
            agregarEmpleadoAResumen={agregarEmpleadoAResumen}
            elementosPrecargados={elementosEditados}
          />
        )}
      </div>

      {/* Resumen general al final del wizard */}
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
