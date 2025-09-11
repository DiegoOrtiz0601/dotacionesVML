// src/components/usuario/ResumenEmpleado.jsx
import React from "react";
import { PencilLine, FileSignature } from "lucide-react";


const ResumenEmpleado = ({ emp, index, desplegado, toggleEmpleado, mostrarModalFirma }) => (
  <div key={index} className="mb-4 border rounded overflow-hidden">
    <button
      className="w-full text-left bg-blue-100 hover:bg-blue-200 p-4 font-medium flex justify-between items-center"
      onClick={() => toggleEmpleado(index)}
    >
      <span>
        👤 {emp.nombres} - {emp.documento} ({emp.tipo_solicitud})
      </span>
      <span className="text-xl">{desplegado[index] ? "▲" : "▼"}</span>
    </button>
    {desplegado[index] && (
      <div className="p-4 bg-white">
        <table className="w-full text-sm mt-2 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-1 px-2 text-left">Elemento</th>
              <th className="py-1 px-2 text-left">Talla</th>
              <th className="py-1 px-2 text-left">Solicitado</th>
              <th className="py-1 px-2 text-left">Aprobado</th>
            </tr>
          </thead>
          <tbody>
            {emp.elementos.map((el, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-1 px-2">{el.nombre}</td>
                <td className="py-1 px-2">{el.talla}</td>
                <td className="py-1 px-2">{el.cantidad_anterior}</td>
                <td className="py-1 px-2">{el.cantidad_aprobada}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-all duration-300">
            <PencilLine className="w-4 h-4" />
            Reportar Novedad
          </button>
          <button
            onClick={() => mostrarModalFirma(emp)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all duration-300"
          >
            <FileSignature className="w-4 h-4" />
            Generar Entrega
          </button>
        </div>
      </div>
    )}
  </div>
);

export default ResumenEmpleado;
