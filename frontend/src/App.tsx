// en frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importaciones de Páginas
import LandingPage from './pages/LandingPage';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClienteLayout from './layouts/ClienteLayout';
// import AgenteLayout from './layouts/AgenteLayout'; // (Para el futuro)

// Páginas de Admin
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
import RegistroPage from './pages/RegistroPage';
import ClienteSolicitarPolizaPage from './pages/cliente/ClienteSolicitarPolizaPage';

// Páginas de Cliente
import ClienteDashboardPage from './pages/cliente/ClienteDashboardPage';
import ClienteMiPerfilPage from './pages/cliente/ClienteMiPerfilPage';

// Seguridad
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- RUTAS PÚBLICAS (Cualquiera puede entrar) --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/registro" element={<RegistroPage />} />


        {/* --- RUTAS DE ADMINISTRADOR (Solo rol ADMIN) --- */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/" element={<AdminLayout />}>
            
            {/* Dashboard y Perfil */}
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="admin-perfil" element={<AdminMiPerfilPage />} />

            {/* Gestión de Agentes */}
            <Route path="admin-agentes" element={<AdminGestionAgentesPage />} /> 
            <Route path="admin-agentes/crear" element={<AdminCrearAgentePage />} />
            <Route path="admin-agentes/:id/editar" element={<AdminEditarAgentePage />} />

            {/* Gestión de Clientes */}
            <Route path="admin-clientes" element={<AdminGestionClientesPage />} />
            <Route path="admin-clientes/crear" element={<AdminCrearClientePage />} />
            <Route path="admin-clientes/editar/:id" element={<AdminEditarClientePage />} />

            {/* Gestión de Pólizas */}
            <Route path="admin-polizas" element={<AdminListarPolizasPage />} />
            <Route path="admin-polizas/crear" element={<AdminCrearPolizaPage />} />
            <Route path="admin-polizas/:id" element={<AdminDetallePolizaPage />} />

            {/* Gestión de Siniestros */}
            <Route path="admin-siniestros" element={<AdminListarSiniestrosPage />} />
            <Route path="admin-siniestros/:id" element={<AdminDetalleSiniestroPage />} />

          </Route>
        </Route>


        {/* --- RUTAS DE CLIENTE (Solo rol CLIENTE) --- */}
        <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
          <Route element={<ClienteLayout />}>
             <Route path="/mi-poliza" element={<ClienteDashboardPage />} />
             <Route path="/cliente-perfil" element={<ClienteMiPerfilPage />} />
             {/* NUEVA RUTA */}
            <Route path="/solicitar-poliza" element={<ClienteSolicitarPolizaPage />} />
          </Route>
        </Route>


        {/* --- RUTAS DE AGENTE (Para el futuro) --- */}
        {/* <Route element={<ProtectedRoute allowedRoles={['AGENTE']} />}>
           <Route element={<AgenteLayout />}>
              <Route path="/agente-dashboard" element={<AgenteDashboardPage />} />
           </Route>
        </Route> 
        */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;