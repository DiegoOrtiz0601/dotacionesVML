import React from "react";

const ModalPDFResultado = ({ modalPDF, setModalPDF, onCerrarEmpleadoEntregado }) => {
  if (!modalPDF) return null;

  const manejarCerrar = () => {
    setModalPDF(null);
    if (typeof onCerrarEmpleadoEntregado === 'function') {
      onCerrarEmpleadoEntregado();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
        <p className="text-lg font-semibold mb-4">
          ✅ Archivo generado correctamente. Puede descargar o salir del acta.
        </p>
        <div className="flex justify-around">
          <button
            onClick={() => {
              if (modalPDF.url) {
                window.open(modalPDF.url, "_blank");
              } else {
                alert("⚠️ No se pudo generar el enlace de descarga.");
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Descargar
          </button>

          <button
            onClick={manejarCerrar}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPDFResultado;
