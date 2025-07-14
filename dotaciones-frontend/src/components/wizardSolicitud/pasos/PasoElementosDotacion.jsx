import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

const PasoElementosDotacion = ({
  idEmpresa,
  idCargo,
  onBack,
  onAgregarOtroEmpleado,
  agregarEmpleadoAResumen,
  elementosPrecargados = null,
  setPasoActual,
  ocultarFormulario
}) => {
  const [elementos, setElementos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarElementos = async () => {
      try {
        setCargando(true);
        console.log('🔄 Cargando elementos de dotación...', { idEmpresa, idCargo });
        
        const response = await api.get("/elementos-dotacion", {
          params: { idEmpresa, idCargo },
        });
        
        console.log('✅ Elementos cargados:', response.data.length, 'elementos');
        setElementos(response.data);
      } catch (error) {
        console.error("❌ Error cargando elementos:", error);
      } finally {
        setCargando(false);
      }
    };
    if (idEmpresa && idCargo) {
      cargarElementos();
    }
  }, [idEmpresa, idCargo]);

  useEffect(() => {
    if (elementosPrecargados?.length && elementos.length > 0) {
      const map = {};
      elementosPrecargados.forEach((el) => {
        map[el.idElemento] = {
          checked: true,
          talla: el.talla,
          cantidad: el.cantidad,
          nombreElemento: el.nombreElemento,
        };
      });
      setSeleccionados(map);
    }
  }, [elementosPrecargados, elementos]);

  const manejarSeleccion = (id, checked) => {
    setSeleccionados((prev) => {
      const elemento = elementos.find((e) => e.idElemento === id);
      return {
        ...prev,
        [id]: {
          checked,
          talla: prev[id]?.talla || "",
          cantidad: prev[id]?.cantidad || "",
          nombreElemento: elemento?.nombreElemento || "",
        },
      };
    });
  };

  const actualizarTalla = (id, talla) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        talla,
      },
    }));
  };

  const actualizarCantidad = (id, cantidad) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        cantidad,
      },
    }));
  };

  const seleccionValida = useMemo(() => {
    return Object.values(seleccionados).some(
      (el) => el.checked && el.talla?.trim() && Number(el.cantidad) > 0
    );
  }, [seleccionados]);

  const manejarAgregar = () => {
    const elementosFinales = Object.entries(seleccionados)
      .filter(
        ([_, val]) =>
          val.checked && val.talla?.trim() && Number(val.cantidad) > 0
      )
      .map(([idElemento, val]) => ({
        idElemento: Number(idElemento),
        talla: val.talla,
        cantidad: Number(val.cantidad),
        nombreElemento: val.nombreElemento,
      }));

    if (elementosFinales.length === 0) {
      alert("⚠️ Debes seleccionar al menos un elemento con talla y cantidad.");
      return;
    }

    agregarEmpleadoAResumen(elementosFinales);
    setMostrarConfirmacion(true);
  };

  const cancelarConfirmacion = () => setMostrarConfirmacion(false);
  const confirmarAgregarOtro = () => {
    setSeleccionados({});
    setElementos([]);
    setMostrarConfirmacion(false);
    onAgregarOtroEmpleado();
  };

  const finalizarYVerResumen = () => {
    setMostrarConfirmacion(false);
    ocultarFormulario();
    setPasoActual(4);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Agregar Elementos de Dotación</h3>

      {cargando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando elementos de dotación...</p>
        </div>
      ) : elementos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron elementos de dotación para esta empresa y cargo.</p>
        </div>
      ) : (
        elementos.map((el) => {
        const tallas = el.tallas?.split(",") || [];

        return (
          <div
            key={el.idElemento}
            className="border p-4 mb-2 rounded shadow-sm"
          >
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={seleccionados[el.idElemento]?.checked || false}
                onChange={(e) =>
                  manejarSeleccion(el.idElemento, e.target.checked)
                }
              />
              <span className="font-semibold">{el.nombreElemento}</span>
            </label>

            {seleccionados[el.idElemento]?.checked && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm">Talla</label>
                  <select
                    className="w-full border px-2 py-1"
                    value={seleccionados[el.idElemento]?.talla || ""}
                    onChange={(e) =>
                      actualizarTalla(el.idElemento, e.target.value)
                    }
                  >
                    <option value="">Seleccione talla</option>
                    {tallas.map((talla, i) => (
                      <option key={i} value={talla.trim()}>
                        {talla.trim()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border px-2 py-1"
                    value={seleccionados[el.idElemento]?.cantidad || ""}
                    onChange={(e) =>
                      actualizarCantidad(el.idElemento, e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })
      )}

      {seleccionValida && (
        <div className="mt-6 border border-green-300 bg-green-50 rounded p-4 shadow-sm">
          <h4 className="text-md font-semibold text-green-800 mb-2">
            ✅ Elementos seleccionados para agregar:
          </h4>
          <ul className="list-disc pl-5 text-sm text-green-800 space-y-1">
            {Object.entries(seleccionados).map(([id, val]) => {
              if (
                val.checked &&
                val.talla?.trim() &&
                Number(val.cantidad) > 0
              ) {
                return (
                  <li key={id}>
                    <strong>{val.nombreElemento}</strong> — Talla: {val.talla},
                    Cantidad: {val.cantidad}
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <p className="text-xs text-green-700 mt-2 italic">
            Confirma que los datos estén correctos antes de agregar.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            setSeleccionados({});
            setElementos([]);
            onBack();
          }}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          ⬅️ Volver
        </button>
        <button
          onClick={manejarAgregar}
          disabled={!seleccionValida}
          className={`px-4 py-2 rounded text-white ${
            seleccionValida
              ? "bg-primario hover:bg-primario-dark"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Agregar
        </button>
      </div>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-gray-800">¿Desea agregar otro empleado?</h2>
            <p className="text-sm text-gray-600">Puedes seguir registrando empleados o finalizar para ver el resumen.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarConfirmacion}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAgregarOtro}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Sí, agregar otro
              </button>
              <button
                onClick={finalizarYVerResumen}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                No, mostrar resumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasoElementosDotacion;
