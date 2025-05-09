// import { useEffect, useState } from 'react'
// import api from '../api/axios'

// function PasoEmpleadoSolicitud({ documentoEmpleado, tipoSolicitudSeleccionado, setTipoSolicitudSeleccionado }) {
//   const [tiposSolicitud, setTiposSolicitud] = useState([])
//   const [historial, setHistorial] = useState([])
//   const [observaciones, setObservaciones] = useState('')
//   const [evidencias, setEvidencias] = useState([])

//   useEffect(() => {
//     const cargarTipos = async () => {
//       try {
//         const response = await api.get('/tipo-solicitud')
//         setTiposSolicitud(response.data)
//       } catch (error) {
//         console.error('Error cargando tipos de solicitud:', error)
//       }
//     }
//     cargarTipos()
//   }, [])

//   useEffect(() => {
//     const cargarHistorial = async () => {
//       if (documentoEmpleado && tipoSolicitudSeleccionado && tipoSolicitudSeleccionado !== 'nueva') {
//         try {
//           const response = await api.get('/historial-solicitudes', {
//             params: { documento: documentoEmpleado, tipo: tipoSolicitudSeleccionado }
//           })
//           setHistorial(response.data)
//         } catch (error) {
//           console.error('Error cargando historial:', error)
//         }
//       }
//     }
//     cargarHistorial()
//   }, [documentoEmpleado, tipoSolicitudSeleccionado])

//   const handleFileChange = (e) => {
//     const archivos = Array.from(e.target.files)
//     setEvidencias(prev => [...prev, ...archivos])
//   }

//   const eliminarEvidencia = (index) => {
//     setEvidencias(prev => prev.filter((_, i) => i !== index))
//   }

//   return (
//     <div className="space-y-4">
//       {/* Tipo de solicitud */}
//       <div>
//         <label className="block font-semibold text-sm mb-1">Tipo de solicitud</label>
//         <select
//           className="w-full border border-gray-300 rounded px-3 py-2"
//           value={tipoSolicitudSeleccionado}
//           onChange={e => setTipoSolicitudSeleccionado(e.target.value)}
//           disabled={!documentoEmpleado}
//         >
//           <option value="">Seleccione tipo</option>
//           {tiposSolicitud.map(t => (
//             <option key={t.id} value={t.id}>
//               {t.NombreTipo}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Solo si no es Solicitud Nueva */}
//       {tipoSolicitudSeleccionado && tipoSolicitudSeleccionado !== 'nueva' && (
//         <>
//           {/* Historial */}
//           <div>
//             <label className="block font-semibold text-sm mb-1">Historial de solicitudes</label>
//             <select className="w-full border border-gray-300 rounded px-3 py-2">
//               <option value="">{historial.length > 0 ? 'Seleccione una solicitud' : 'Sin solicitudes anteriores'}</option>
//               {historial.map(s => (
//                 <option key={s.idDetalleSolicitud} value={s.idDetalleSolicitud}>
//                   #{s.idDetalleSolicitud} - {s.nombreEmpleado}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Observaciones */}
//           <div>
//             <label className="block font-semibold text-sm mb-1">Observaciones</label>
//             <textarea
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               rows={3}
//               value={observaciones}
//               onChange={e => setObservaciones(e.target.value)}
//               placeholder="Escriba aquí observaciones sobre la solicitud"
//             ></textarea>
//           </div>

//           {/* Evidencias */}
//           <div>
//             <label className="block font-semibold text-sm mb-1">Evidencias (PDF/JPG)</label>
//             <input
//               type="file"
//               accept="application/pdf,image/*"
//               multiple
//               onChange={handleFileChange}
//               className="block w-full mb-2"
//             />
//             <ul className="text-sm text-gray-700 space-y-1">
//               {evidencias.map((file, i) => (
//                 <li key={i} className="flex justify-between items-center">
//                   <span>{file.name}</span>
//                   <button onClick={() => eliminarEvidencia(i)} className="text-red-500 hover:underline">Eliminar</button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default PasoEmpleadoSolicitud
