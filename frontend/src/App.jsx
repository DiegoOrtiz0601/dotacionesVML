import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import RutaPrivada from "./components/RutaPrivada";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./components/Dashboard";
import NuevaSolicitud from "./components/NuevaSolicitud";
import Solicitudes from "./components/MisSolicitudes";
import Configuracion from "./components/Configuracion";

import GestionarSolicitudes from "./components/talento/GestionarSolicitudes";
import HistorialSolicitudes from "./components/talento/HistorialSolicitudes";
import SolicitudesRechazadas from "./components/talento/SolicitudesRechazadas";
import TramitarSolicitud from "./components/talento/TramitarSolicitud";

import EntregaSolicitud from "./components/usuario/EntregaSolicitud";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 Rutas protegidas para usuario */}
        <Route path="/usuario" element={<RutaPrivada rolPermitido="usuario" />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="nueva-solicitud" element={<NuevaSolicitud />} />
            <Route path="solicitudes" element={<Solicitudes />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="entregas" element={<EntregaSolicitud />} />

          </Route>
        </Route>

        {/* 🔐 Rutas protegidas para talento humano */}
        <Route path="/talento" element={<RutaPrivada rolPermitido="talento_humano" />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gestionar-solicitudes" element={<GestionarSolicitudes />} />
            <Route path="historial-solicitudes" element={<HistorialSolicitudes />} />
            <Route path="rechazadas" element={<SolicitudesRechazadas />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="solicitud/:id" element={<TramitarSolicitud />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
