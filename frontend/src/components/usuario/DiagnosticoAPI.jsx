import React, { useState, useEffect } from "react";
import { obtenerEmpresasYSedes, obtenerUsuarioAutenticado } from "../../api/utils";

const DiagnosticoAPI = () => {
  console.log("🎯 DiagnosticoAPI: Componente inicializado");
  
  const [estado, setEstado] = useState("Iniciando...");
  const [usuario, setUsuario] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🎯 DiagnosticoAPI: useEffect ejecutándose");
    
    const probarAPI = async () => {
      try {
        setEstado("Probando obtenerUsuarioAutenticado...");
        console.log("🔍 DiagnosticoAPI: Llamando a obtenerUsuarioAutenticado");
        
        const usuarioData = await obtenerUsuarioAutenticado();
        console.log("✅ DiagnosticoAPI: Usuario obtenido:", usuarioData);
        setUsuario(usuarioData);
        
        setEstado("Probando obtenerEmpresasYSedes...");
        console.log("🔍 DiagnosticoAPI: Llamando a obtenerEmpresasYSedes");
        
        const empresaSedeData = await obtenerEmpresasYSedes();
        console.log("✅ DiagnosticoAPI: Empresas y sedes obtenidas:", empresaSedeData);
        
        setEmpresas(empresaSedeData?.empresas || []);
        setSedes(empresaSedeData?.sedes || []);
        setEstado("✅ Todas las APIs funcionaron correctamente");
        
      } catch (error) {
        console.error("❌ DiagnosticoAPI: Error en API:", error);
        setError(error.message);
        setEstado("❌ Error en las APIs");
      }
    };
    
    probarAPI();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico de API</h2>
      
      <div className="bg-blue-100 p-4 rounded mb-4">
        <h3 className="font-bold">Estado actual:</h3>
        <p>{estado}</p>
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">Usuario:</h3>
          <pre className="text-sm">{JSON.stringify(usuario, null, 2)}</pre>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Empresas ({empresas.length}):</h3>
          <pre className="text-sm">{JSON.stringify(empresas, null, 2)}</pre>
        </div>

        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-bold">Sedes ({sedes.length}):</h3>
          <pre className="text-sm">{JSON.stringify(sedes, null, 2)}</pre>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Revisa la consola para ver los logs detallados de las llamadas a la API.</p>
      </div>
    </div>
  );
};

export default DiagnosticoAPI;
