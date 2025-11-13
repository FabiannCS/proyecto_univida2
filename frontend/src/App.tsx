// en frontend/src/App.tsx - VERSIÓN CORREGIDA
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
//import AgenteDashboardPage from './pages/AgenteDashboardPage';
import AdminGestionAgentesPage from './pages/gestion/AdminGestionAgentesPage';
import AdminCrearAgentePage from './pages/gestion/AdminCrearAgentePage';
import AdminEditarAgentePage from './pages/gestion/AdminEditarAgentePage';
import AdminGestionClientesPage from './pages/gestion/AdminGestionClientesPage';
import AdminCrearClientePage from './pages/gestion/AdminCrearClientePage';
import AdminEditarClientePage from './pages/gestion/AdminEditarClientePage';
import AdminListarPolizasPage from './pages/polizas/AdminListarPolizasPage';
import AdminCrearPolizaPage from './pages/polizas/AdminCrearPolizaPage';
import AdminDetallePolizaPage from './pages/polizas/AdminDetallePolizaPage';
import AdminListarSiniestrosPage from './pages/siniestros/AdminListarSiniestrosPage';
import AdminDetalleSiniestroPage from './pages/siniestros/AdminDetalleSiniestroPage';
import ClienteLayout from './layouts/ClienteLayout';
import ClienteDashboardPage from './pages/cliente/ClienteDashboardPage';
import ClienteMiPerfilPage from './pages/cliente/ClienteMiPerfilPage';

import AdminMiPerfilPage from './pages/AdminMiPerfilPage'; 
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login (pública) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 

        {/* --- RUTAS DE ADMINISTRADOR --- */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/" element={<AdminLayout />}>
            
            {/* Dashboard */}
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="admin-perfil" element={<AdminMiPerfilPage />} />

            {/* RUTAS PARA AGENTES */}
            <Route path="admin-agentes" element={<AdminGestionAgentesPage />} /> 
            <Route path="admin-agentes/crear" element={<AdminCrearAgentePage />} />
            <Route path="admin-agentes/:id/editar" element={<AdminEditarAgentePage />} />

            {/* RUTAS PARA CLIENTES */}
            <Route path="admin-clientes" element={<AdminGestionClientesPage />} />
            <Route path="admin-clientes/crear" element={<AdminCrearClientePage />} />
            <Route path="admin-clientes/editar/:id" element={<AdminEditarClientePage />} />

            {/* RUTAS PARA PÓLIZAS */}
            <Route path="admin-polizas" element={<AdminListarPolizasPage />} />
            <Route path="admin-polizas/crear" element={<AdminCrearPolizaPage />} />
            <Route path="admin-polizas/:id" element={<AdminDetallePolizaPage />} />

            {/* RUTAS PARA SINIESTROS */}
            <Route path="admin-siniestros" element={<AdminListarSiniestrosPage />} />
            <Route path="admin-siniestros/:id" element={<AdminDetalleSiniestroPage />} />

          </Route>
                {/* --- RUTAS DE CLIENTE --- */}
          <Route element={<ClienteLayout />}>
              <Route path="/mi-poliza" element={<ClienteDashboardPage />} />
              <Route path="/cliente-perfil" element={<ClienteMiPerfilPage />} />
          </Route>
        </Route>

        {/* (Rutas para Agente y Cliente pueden ir aquí después) */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;