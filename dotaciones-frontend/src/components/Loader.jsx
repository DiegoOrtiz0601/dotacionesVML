import React from 'react'

export default function Loader({ mensaje = "Guardando solicitud, por favor espere..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-sm font-medium">{mensaje}</p>
      </div>
    </div>
  );
}