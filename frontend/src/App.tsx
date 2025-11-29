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
import AgenteDashboardPage from './pages/AgenteDashboardPage';

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
          </Route>
        </Route>

        {/* --- RUTAS DE AGENTE --- */}
        {/* Solo usuarios con rol 'AGENTE' pueden entrar aquí */}
        <Route element={<ProtectedRoute allowedRoles={['AGENTE']} />}>
           <Route path="/" element={<AgenteLayout />}>
              
              {/* Aquí pondremos las páginas (por ahora usa las del admin como prueba si quieres, o crea nuevas) */}
              <Route path="agente-dashboard" element={<AgenteDashboardPage />} />
              
              {/* (Más adelante crearemos estas páginas específicas para agente) */}
              {/* <Route path="agente-clientes" element={<AgenteGestionClientesPage />} /> */}
              {/* <Route path="agente-polizas" element={<AgenteListarPolizasPage />} /> */}
              
           </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;