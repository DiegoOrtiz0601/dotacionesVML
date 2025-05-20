// src/components/usuario/ModalFirma.jsx
import React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, FileSignature, XCircle, TabletSmartphone } from "lucide-react";

const ModalFirma = ({
  modoFirma,
  setModoFirma,
  grosorFirma,
  setGrosorFirma,
  colorFirma,
  setColorFirma,
  sigCanvasRef,
  limpiarFirma,
  guardarFirma,
  capturarFirmaDesdeEPAD,
  setMostrarFirma
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold">Seleccione método de firma:</p>
        <select
          className="border rounded px-2 py-1"
          value={modoFirma}
          onChange={(e) => setModoFirma(e.target.value)}
        >
          <option value="canvas">Dibujar firma</option>
          <option value="epad">Capturar desde ePad</option>
        </select>
      </div>

      {modoFirma === "canvas" && (
        <>
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

          <label className="block mb-2 text-sm font-medium">Color del trazo</label>
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
              <Trash2 className="w-4 h-4" /> Reiniciar
            </button>
            <button
              onClick={guardarFirma}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all duration-300"
            >
              <FileSignature className="w-4 h-4" /> Usar Firma
            </button>
          </div>
        </>
      )}

      {modoFirma === "epad" && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            onClick={capturarFirmaDesdeEPAD}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            <TabletSmartphone className="w-5 h-5" /> Iniciar captura desde ePad
          </button>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setMostrarFirma(false)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:underline transition-all"
        >
          <XCircle className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  </div>
);

export default ModalFirma;
