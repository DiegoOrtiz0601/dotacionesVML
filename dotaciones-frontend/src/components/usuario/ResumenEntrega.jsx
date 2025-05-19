// src/components/usuario/ResumenEntrega.jsx
import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../../api/axios";
import trimCanvas from "trim-canvas";
import {
  FileDown,
  PencilLine,
  Trash2,
  XCircle,
  FileSignature,
} from "lucide-react";

const ResumenEntrega = ({
  numeroSolicitud,
  empresa,
  sede,
  usuario,
  ResumenEntrega = [],
  logo,
  nit,
}) => {
  const [desplegado, setDesplegado] = useState({});
  const [mostrarFirma, setMostrarFirma] = useState(false);
  const [firmado, setFirmado] = useState(false);
  const sigCanvasRef = useRef(null);
  const [firmaURL, setFirmaURL] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarDocumento, setMostrarDocumento] = useState(false);
  const [grosorFirma, setGrosorFirma] = useState(1.5);
  const [colorFirma, setColorFirma] = useState("#000000");
  const [cargandoPDF, setCargandoPDF] = useState(false)
const [modalPDF, setModalPDF] = useState(null)

  const toggleEmpleado = (index) => {
    setDesplegado((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const mostrarModalFirma = (emp) => {
    setEmpleadoSeleccionado(emp);
    setMostrarDocumento(true);
    setFirmado(false);
    setFirmaURL("");
  };

  const limpiarFirma = () => sigCanvasRef.current.clear();

  const guardarFirma = () => {
    const trimmed = trimCanvas(sigCanvasRef.current.getCanvas());
    const dataURL = trimmed.toDataURL("image/png");
    setFirmaURL(dataURL);
    setFirmado(true);
    setMostrarFirma(false);
  };

  const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

const enviarDatosPDFAlBackend = async () => {
  if (!firmaURL || !empleadoSeleccionado?.documento) {
    alert("⚠️ Falta la firma o el empleado seleccionado.");
    return;
  }

  try {
    setCargandoPDF(true);
    const logoBase64 = logo ? await getBase64FromUrl(logo) : null;

    const payload = {
      content: JSON.stringify({
        numeroSolicitud,
        empresa,
        sede,
        nit,
        firma: firmaURL,
        logo: logoBase64,
        empleado: empleadoSeleccionado,
      }),
    };

    const response = await api.post("/generar-pdf-entrega", payload);
    
    const ruta = response.data.archivo; // ← se espera que backend devuelva `archivo`
    setModalPDF({
      ruta,
      mensaje: "✅ Archivo generado correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al generar el PDF:", error);
    alert("❌ Error inesperado al generar el PDF.");
  } finally {
    setCargandoPDF(false);
  }
};


  const generarPDF = async () => {
  setCargandoPDF(true)

  try {
    const response = await api.post('/entrega-pdf', {
      content: JSON.stringify(datosResumen) // tus datos del acta
    })

    setModalPDF({
      ruta: `/storage/${response.data.archivo}`, // ruta completa
      mensaje: 'Archivo generado correctamente.'
    })
  } catch (err) {
    console.error('Error generando PDF', err)
    alert('❌ Ocurrió un error al generar el archivo.')
  } finally {
    setCargandoPDF(false)
  }
}

// Modal de PDF generado
{modalPDF && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
      <p className="text-lg font-semibold mb-4">{modalPDF.mensaje}</p>
      <div className="flex justify-around">
        <button
          onClick={() => window.open(modalPDF.ruta, '_blank')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Imprimir
        </button>
        <button
          onClick={() => window.location.href = modalPDF.ruta}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Descargar
        </button>
        <button
          onClick={() => {
            setModalPDF(null);
            window.location.href = "/usuario/gestionar-entregas"; // ← tu ruta
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Salir
        </button>
      </div>
    </div>
  </div>
)}

{cargandoPDF && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
      <p className="mb-4 font-medium">⏳ Generando archivo, espere...</p>
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
    </div>
  </div>
)}

  return (
    <div className="mt-8 p-6 bg-white border rounded shadow text-justify text-sm leading-[1.15]">
      <div className="grid grid-cols-3 items-start mb-6">
        <div className="w-full"></div>
        <div className="w-full text-center text-lg font-semibold uppercase">
          Formato Entrega de Dotación
        </div>
        <div className="w-full flex justify-end">
          {logo && (
            <img
              src={logo}
              alt="Logo empresa"
              style={{
                height: "96px",
                maxWidth: "150px",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>
      </div>

      <p className="mb-1">
        <strong>Empresa:</strong> {empresa}
      </p>
      <p className="mb-3">
        <strong>Sede:</strong> {sede}
      </p>
      <hr className="my-4" />

      {Array.isArray(ResumenEntrega) &&
        ResumenEntrega.map((emp, index) => (
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
        ))}

      {mostrarDocumento && empleadoSeleccionado && (
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
              Por medio de la presente acta, el trabajador certifica que la
              empresa <strong>{empresa}</strong> identificada con Nit.{" "}
              <strong>{nit}</strong> hace entrega de la dotación
              correspondiente.
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
                  1. La dotación que aquí se entrega es y será de la empresa en
                  todo momento.
                </p>
                <br />
                <p>
                  2. En caso de terminación del contrato de trabajo o la entrega
                  de una nueva dotación, se compromete a hacer la devolución de
                  la dotación si la empresa se lo solicita.
                </p>
                <br />
                <p>
                  3. En caso de daño de la dotación o parte de ella, el
                  trabajador debe devolverla a la empresa.
                </p>
                <br />
                <p>
                  4. El trabajador autoriza expresamente a la empresa mediante
                  este documento a descontar de salarios y liquidación de
                  prestaciones los valores de la dotación cuando en cualquiera
                  de los casos anteriores no la devuelva al empleador.
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
                  onClick={() => setMostrarFirma(true)}
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
                  onClick={enviarDatosPDFAlBackend} // ✅ Corrección aquí
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
      )}

      {mostrarFirma && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl">
            <p className="mb-2 font-semibold">Firme en el recuadro:</p>

            <label className="block mb-2 text-sm font-medium">
              Grosor del trazo: {grosorFirma}
            </label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={grosorFirma}
              onChange={(e) => setGrosorFirma(parseFloat(e.target.value))}
              className="mb-4 w-full"
            />

            <label className="block mb-2 text-sm font-medium">
              Color del trazo
            </label>
            <input
              type="color"
              value={colorFirma}
              onChange={(e) => setColorFirma(e.target.value)}
              className="mb-4 w-32"
            />

            <SignatureCanvas
              ref={sigCanvasRef}
              penColor={colorFirma}
              minWidth={grosorFirma}
              maxWidth={grosorFirma + 0.5}
              canvasProps={{ width: 500, height: 150, className: "border" }}
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={limpiarFirma}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
                Reiniciar
              </button>
              <button
                onClick={guardarFirma}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all duration-300"
              >
                <FileSignature className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
        {modalPDF && (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
          <p className="text-lg font-semibold mb-4">{modalPDF.mensaje}</p>
          <div className="flex justify-around">
            <button
              onClick={() => window.open(modalPDF.ruta, "_blank")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Imprimir
            </button>
            <button
              onClick={() => window.location.href = modalPDF.ruta}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Descargar
            </button>
            <button
              onClick={() => {
                setModalPDF(null);
                window.location.href = "/usuario/gestionar-entregas";
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
    
    
  );
  
};
<style>

  
</style>
export default ResumenEntrega;
