// en frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage'; // Importa tu página

import AdminLayout from './layouts/AdminLayout'; // <-- AÑADE ESTA LÍNEA
import AdminDashboardPage from './pages/AdminDashboardPage';
import AgenteDashboardPage from './pages/AgenteDashboardPage';
import MiPolizaPage from './pages/MiPolizaPage';
import AdminGestionAgentesPage from './pages/gestion/AdminGestionAgentesPage';
import AdminCrearAgentePage from './pages/gestion/AdminCrearAgentePage';
import AdminEditarAgentePage from './pages/gestion/AdminEditarAgentePage';
import AdminGestionClientesPage from './pages/gestion/AdminGestionClientesPage';
import AdminCrearClientePage from './pages/gestion/AdminCrearClientePage';
import AdminListarPolizasPage from './pages/polizas/AdminListarPolizasPage';
import AdminCrearPolizaPage from './pages/polizas/AdminCrearPolizaPage';
import AdminDetallePolizaPage from './pages/polizas/AdminDetallePolizaPage';
import AdminListarSiniestrosPage from './pages/siniestros/AdminListarSiniestrosPage';
import AdminDetalleSiniestroPage from './pages/siniestros/AdminDetalleSiniestroPage';

import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta de Login (pública) */}
        <Route path="/" element={<LoginPage />} /> 

        {/* --- RUTAS DE ADMINISTRADOR --- */}
        {/* Primero, el "guardia" (ProtectedRoute) comprueba si tienes token */}
        <Route element={<ProtectedRoute />}> 

          {/* Si tienes token, carga el "molde" (AdminLayout) */}
          <Route path="/" element={<AdminLayout />}>

            {/* Y dentro del <Outlet/> de AdminLayout, carga estas páginas: */}
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />

            {/* RUTAS PARA LOS AGENTES*/}
            <Route path="admin-agentes" element={<AdminGestionAgentesPage/>} /> 
            <Route path="admin-agentes/crear" element={<AdminCrearAgentePage />} />
            <Route path="admin-agentes/:id/editar" element={<AdminEditarAgentePage />} />

            {/* RUTAS PARA LOS CLIENTES*/}
            <Route path="admin-clientes" element={<AdminGestionClientesPage />} />
            <Route path="admin-clientes/crear" element={<AdminCrearClientePage />} />
            <Route path="admin-clientes" element={<MiPolizaPage />} />

            {/* --- AÑADE ESTAS RUTAS PARA PÓLIZAS --- */}
            <Route path="admin-polizas" element={<AdminListarPolizasPage />} />
            <Route path="admin-polizas/crear" element={<AdminCrearPolizaPage />} />
            <Route path="admin-polizas/:id" element={<AdminDetallePolizaPage />} />

            {/* RUTAS PARA SINIESTROS */}
            <Route path="admin-siniestros" element={<AdminListarSiniestrosPage />} />
            {/* (Dejamos listas las rutas para los siguientes pasos) */}
            {/* <Route path="admin-siniestros/reportar" element={<AdminReportarSiniestroPage />} /> */}
            <Route path="admin-siniestros/:id" element={<AdminDetalleSiniestroPage />} />
            <Route path="admin-clientes" element={<MiPolizaPage />} /> 
            {/* (Cambiamos MiPolizaPage por AdminClientesPage luego, por ahora está bien) */}

          </Route>
        </Route>

        {/* (Aquí pondríamos las rutas para Agente y Cliente después) */}
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AgenteLayout />}>
            <Route path="agente-dashboard" element={<AgenteDashboardPage />} />
          </Route>
        </Route> */}

      </Routes>
    </BrowserRouter>
  );
}
export default App;