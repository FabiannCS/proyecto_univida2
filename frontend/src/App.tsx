import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import RegistroPage from './pages/RegistroPage';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClienteLayout from './layouts/ClienteLayout';
// import AgenteLayout from './layouts/AgenteLayout'; // Para el futuro

// Páginas Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMiPerfilPage from './pages/AdminMiPerfilPage';
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
import ReportarSiniestroPage from './pages/siniestros/ReportarSiniestroPage';
import AgenteLayout from './layouts/AgenteLayout';
import AgenteClientesPage from './pages/agente/AgenteClientesPage';
import ClienteCatalogoPage from './pages/cliente/ClienteCatalogoPage';
import AgenteSolicitudesPage from './pages/agente/AgenteSolicitudesPage';
import AgenteListarPolizasPage from './pages/agente/AgenteListarPolizasPage';
import AgenteMiPerfilPage from './pages/agente/AgenteMiPerfilPage';
import AgenteCrearClientePage from './pages/agente/AgenteCrearClientePage';
import AgenteCrearPolizaPage from './pages/agente/AgenteCrearPolizaPage';
import AgenteDashboardPage from './pages/agente/AgenteDashboardPage';
import ClienteReportarSiniestroPage from './pages/cliente/ClienteReportarSiniestroPage';
import ClienteMisSiniestrosPage from './pages/cliente/ClienteMisSiniestrosPage';
import AgenteRegistrarPagoPage from './pages/agente/AgenteRegistrarPagoPage';
import AgenteDetallePolizaPage from './pages/agente/AgenteDetallePolizaPage';
import AgenteDetalleClientePage from './pages/agente/AgenteDetalleClientePage';

// Páginas Cliente
import ClienteDashboardPage from './pages/cliente/ClienteDashboardPage';
import ClienteMiPerfilPage from './pages/cliente/ClienteMiPerfilPage';
import ClienteSolicitarPolizaPage from './pages/cliente/ClienteSolicitarPolizaPage';

// Seguridad / Protección de rutas
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* Rutas de ADMIN (solo rol ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="admin-perfil" element={<AdminMiPerfilPage />} />

            {/* Agentes */}
            <Route path="admin-agentes" element={<AdminGestionAgentesPage />} />
            <Route path="admin-agentes/crear" element={<AdminCrearAgentePage />} />
            <Route path="admin-agentes/:id/editar" element={<AdminEditarAgentePage />} />

            {/* Clientes */}
            <Route path="admin-clientes" element={<AdminGestionClientesPage />} />
            <Route path="admin-clientes/crear" element={<AdminCrearClientePage />} />
            <Route path="admin-clientes/editar/:id" element={<AdminEditarClientePage />} />

            {/* Pólizas */}
            <Route path="admin-polizas" element={<AdminListarPolizasPage />} />
            <Route path="admin-polizas/crear" element={<AdminCrearPolizaPage />} />
            <Route path="admin-polizas/:id" element={<AdminDetallePolizaPage />} />
            <Route path="admin-polizas/:polizaId/reportar-siniestro" element={<ReportarSiniestroPage />} />

            {/* Siniestros */}
            <Route path="admin-siniestros" element={<AdminListarSiniestrosPage />} />
            <Route path="admin-siniestros/reportar" element={<ReportarSiniestroPage />} />
            <Route path="admin-siniestros/:id" element={<AdminDetalleSiniestroPage />} />
          </Route>
        </Route>

        {/* Rutas de CLIENTE (solo rol CLIENTE) */}
        <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
          <Route element={<ClienteLayout />}>
            <Route path="/mi-poliza" element={<ClienteDashboardPage />} />
            <Route path="/cliente-perfil" element={<ClienteMiPerfilPage />} />
            <Route path="/solicitar-poliza" element={<ClienteSolicitarPolizaPage />} />
            <Route path="/catalogo" element={<ClienteCatalogoPage />} />
            <Route path="/reportar-siniestro" element={<ClienteReportarSiniestroPage />} />
            <Route path="/mis-siniestros" element={<ClienteMisSiniestrosPage />} />
          </Route>
        </Route>

        {/* --- RUTAS DE AGENTE --- */}
        {/* Solo usuarios con rol 'AGENTE' pueden entrar aquí */}
        <Route element={<ProtectedRoute allowedRoles={['AGENTE']} />}>
           <Route path="/" element={<AgenteLayout />}>
           <Route path="agente-solicitudes" element={<AgenteSolicitudesPage />} />
              
              <Route path="agente-dashboard" element={<AgenteDashboardPage />} />
              <Route path="agente-clientes" element={<AgenteClientesPage />} />
              <Route path="agente-polizas" element={<AgenteListarPolizasPage />} />
              <Route path="agente-perfil" element={<AgenteMiPerfilPage />} />
              <Route path="agente-clientes/crear" element={<AgenteCrearClientePage />} />
              <Route path="agente-clientes/:id" element={<AgenteDetalleClientePage />} />
              <Route path="agente-polizas/crear" element={<AgenteCrearPolizaPage />} />
              <Route path="agente-polizas/:id" element={<AgenteDetallePolizaPage />} />
              <Route path="agente-pagos" element={<AgenteRegistrarPagoPage />} />
              
           </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;