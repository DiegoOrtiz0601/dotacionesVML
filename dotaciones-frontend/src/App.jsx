import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RutaPrivada from "./components/RutaPrivada";
import AppLayout from "./layouts/AppLayout";
import Solicitudes from "./components/Solicitudes";
import Configuracion from "./components/Configuracion";
import NuevaSolicitud from "./components/NuevaSolicitud";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RutaPrivada rolPermitido="usuario">
              <AppLayout />
            </RutaPrivada>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="nueva-solicitud" element={<NuevaSolicitud />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          {/* <Route path="entregas" element={<Entregas />} /> */}
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
