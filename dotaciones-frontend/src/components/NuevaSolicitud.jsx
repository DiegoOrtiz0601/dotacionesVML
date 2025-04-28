function NuevaSolicitud() {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
  
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primario">
            📝 Crear nueva solicitud
          </h2>
          <span className="text-sm font-semibold text-gray-500">
            N° Solicitud: <span className="text-secundario">TEMP-001</span>
          </span>
        </div>
  
        {/* Filtros: Empresa, Sede, Área */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block font-semibold text-sm mb-1">Empresa</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Seleccione empresa</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-sm mb-1">Sede</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Seleccione sede</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-sm mb-1">Área</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Seleccione área</option>
            </select>
          </div>
        </div>
  
        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar empleado por nombre o documento..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
  
        {/* Tabla de empleados */}
        <div className="overflow-auto rounded border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">Documento</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((_, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">123456789</td>
                  <td className="p-3">Juan Pérez</td>
                  <td className="p-3">Operario</td>
                  <td className="p-3">Holding VML</td>
                  <td className="p-3">
                    <button className="bg-primario hover:bg-hover text-white px-3 py-1 rounded text-sm">
                      ➕ Agregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Formulario de asignación de dotación */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-primario mb-4">
            Asignar dotación a: <span className="text-secundario">Juan Pérez</span>
          </h3>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-semibold text-sm mb-1">Elemento de Dotación</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>Seleccione elemento</option>
                <option>Camisa</option>
                <option>Pantalón</option>
                <option>Botas</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Talla</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>Seleccione talla</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>
  
          <div className="text-right">
            <button className="bg-primario hover:bg-hover text-white px-4 py-2 rounded text-sm">
              ➕ Agregar Prenda
            </button>
          </div>
        </div>
  
      </div>
    );
  }
  
  export default NuevaSolicitud;
  