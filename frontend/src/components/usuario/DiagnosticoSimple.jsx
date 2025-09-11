import React, { useState, useEffect } from "react";

const DiagnosticoSimple = () => {
  console.log("🎯 DiagnosticoSimple: Componente inicializado");
  
  const [datos, setDatos] = useState("No cargado");
  const [contador, setContador] = useState(0);

  console.log("🎯 DiagnosticoSimple: Renderizando - datos:", datos, "contador:", contador);

  useEffect(() => {
    console.log("🎯 DiagnosticoSimple: useEffect ejecutándose");
    setDatos("Cargado desde useEffect");
    setContador(1);
    console.log("🎯 DiagnosticoSimple: useEffect completado");
  }, []);

  const manejarClick = () => {
    console.log("🎯 DiagnosticoSimple: Botón clickeado");
    setContador(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico Simple</h2>
      
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <h3 className="font-bold">Estado del componente:</h3>
        <p>Datos: {datos}</p>
        <p>Contador: {contador}</p>
      </div>

      <button 
        onClick={manejarClick}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Incrementar contador
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>Si ves "Cargado desde useEffect" arriba, el useEffect funciona.</p>
        <p>Si ves "No cargado", hay un problema con el useEffect.</p>
        <p>Revisa la consola para ver los logs.</p>
      </div>
    </div>
  );
};

export default DiagnosticoSimple;
