// en frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage'; // Importa tu página

import AdminDashboardPage from './pages/AdminDashboardPage';
import AgenteDashboardPage from './pages/AgenteDashboardPage';
import MiPolizaPage from './pages/MiPolizaPage';

import ProtectedRoute from './ProtectedRoute';

function App() {
return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} /> 

        <Route element={<ProtectedRoute />}> 

          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/agente-dashboard" element={<AgenteDashboardPage />} />
          <Route path="/mi-poliza" element={<MiPolizaPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
export default App;