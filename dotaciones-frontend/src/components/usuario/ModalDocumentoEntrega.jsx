// src/components/usuario/ModalDocumentoEntrega.jsx
import React from "react";
import { PencilLine, FileDown, XCircle } from "lucide-react";

const ModalDocumentoEntrega = ({
  logo,
  empresa,
  nit,
  empleadoSeleccionado,
  firmado,
  firmaURL,
  setMostrarDocumento,
  setMostrarFirma,
  enviarDatosPDFAlBackend,
}) => {
  if (!empleadoSeleccionado) return null;

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto p-10 z-50">
      <div
        className="max-w-3xl mx-auto border rounded p-8 bg-white shadow text-sm"
        id="formato-entrega"
      >
        <div className="grid grid-cols-3 items-start mb-6">
          <div></div>
          <div className="text-center text-lg font-semibold uppercase">
            Formato Entrega de Dotación
          </div>
          <div className="flex justify-end">
            {logo && (
              <img
                src={logo}
                alt="Logo empresa"
                className="h-24 object-contain"
                style={{
                  maxWidth: "150px",
                  height: "auto",
                  aspectRatio: "3/2",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <p>
            <strong>Señor(a):</strong> {empleadoSeleccionado.nombres}
          </p>
          <p>
            <strong>Ref.:</strong> Acta de Entrega de Dotación
          </p>
          <p>
            <strong>Fecha de entrega:</strong>{" "}
            {new Date().toISOString().split("T")[0]}
          </p>
        </div>

        <p className="mt-4">
          Por medio de la presente acta, el trabajador certifica que la empresa{" "}
          <strong>{empresa}</strong>
          identificada con Nit. <strong>{nit}</strong> hace entrega de la
          dotación correspondiente.
        </p>

        <p className="mt-4 font-medium">La cual consta de:</p>
        <table className="w-full text-sm mt-2 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-1 px-2">Nombre del Elemento</th>
              <th className="py-1 px-2">Talla</th>
              <th className="py-1 px-2">Cantidad Aprobada</th>
            </tr>
          </thead>
          <tbody>
            {empleadoSeleccionado.elementos.map((el, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-1 px-2">{el.nombre}</td>
                <td className="py-1 px-2">{el.talla}</td>
                <td className="py-1 px-2">{el.cantidad_aprobada}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <p>El trabajador ACEPTA y manifiesta que:</p>
          <div className="mt-4 space-y-1">
            <p>
              1. La dotación que aquí se entrega es y será de la empresa en todo
              momento.
            </p>
            <p>
              2. En caso de terminación del contrato de trabajo o la entrega de
              una nueva dotación, se compromete a hacer la devolución de la
              dotación si la empresa se lo solicita.
            </p>
            <p>
              3. En caso de daño de la dotación o parte de ella, el trabajador
              debe devolverla a la empresa.
            </p>
            <p>
              4. El trabajador autoriza expresamente a la empresa mediante este
              documento a descontar de salarios y liquidación de prestaciones
              los valores de la dotación cuando en cualquiera de los casos
              anteriores no la devuelva al empleador.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          {firmaURL && (
            <img src={firmaURL} alt="Firma" className="mx-auto h-24" />
          )}
          <p className="mt-2 font-semibold">LA FIRMA DEL EMPLEADO</p>
          <p>c.c. No. {empleadoSeleccionado.documento}</p>
        </div>

        {!firmado && (
          <div className="mt-6 flex justify-center items-center">
            <button
              onClick={() => {
                setMostrarDocumento(false);
                setMostrarFirma(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              <PencilLine className="w-4 h-4" />
              Insertar Firma
            </button>
          </div>
        )}

        {firmado && (
          <div className="mt-6 text-center flex justify-center gap-4">
            <button
              onClick={enviarDatosPDFAlBackend}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              <FileDown className="w-4 h-4" />
              Imprimir y Guardar
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center items-center">
          <button
            onClick={() => setMostrarDocumento(false)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:underline transition-all"
          >
            <XCircle className="w-4 h-4" />
            Cerrar vista del documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDocumentoEntrega;
