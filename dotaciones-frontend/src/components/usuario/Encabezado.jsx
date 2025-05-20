// src/components/usuario/Encabezado.jsx
import React from "react";

const Encabezado = ({ logo, empresa, sede }) => (
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
          style={{ height: "96px", maxWidth: "150px", width: "auto", objectFit: "contain" }}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}
    </div>
    <p className="mt-2 col-span-3">
      <strong>Empresa:</strong> {empresa} <br />
      <strong>Sede:</strong> {sede}
    </p>
  </div>
);

export default Encabezado;
