// en frontend/src/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from './services/authService'; // Asegúrate de que esta ruta sea correcta
import { jwtDecode } from "jwt-decode";

// Definimos que este componente puede recibir una lista de roles permitidos
interface Props {
  allowedRoles?: string[]; // Ej: ['ADMIN'], ['AGENTE'], o ['ADMIN', 'AGENTE']
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  // 1. Verificar si está autenticado
  const isAuthenticated = authService.isAuthenticated();
  const token = localStorage.getItem('accessToken');

  if (!isAuthenticated || !token) {
    authService.logout();
    return <Navigate to="/login" replace />; // <-- CORREGIDO: Redirige a /login
  }

  // 2. Verificar si tiene el ROL correcto (Si se especificaron roles)
  if (allowedRoles) {
    try {
      const decoded: any = jwtDecode(token);
      const userRole = decoded.rol; // Asegúrate de que tu token tenga el campo 'rol'

      // Si el rol del usuario NO está en la lista de permitidos
      if (!allowedRoles.includes(userRole)) {
        // Lo mandamos a su dashboard correspondiente o al login
        console.warn(`Acceso denegado: Rol ${userRole} no tiene permiso.`);
        return <Navigate to="/login" replace />; 
      }
    } catch (error) {
      // Si el token está corrupto
      authService.logout();
      return <Navigate to="/login" replace />;
    }
  }

  // 3. Si pasa todas las pruebas, renderiza la ruta
  return <Outlet />;
};

export default ProtectedRoute;