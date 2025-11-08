// en frontend/src/ProtectedRoute.tsx - VERSIÓN MEJORADA
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from './services/authService';

const ProtectedRoute = () => {
  // Verificar autenticación usando el servicio
  const isAuthenticated = authService.isAuthenticated();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    authService.logout(); // Limpiar cualquier dato residual
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, renderizar el contenido
  return <Outlet />;
};

export default ProtectedRoute;