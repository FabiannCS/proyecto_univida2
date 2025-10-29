// en frontend/src/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Revisa si el token existe en el localStorage
    const token = localStorage.getItem('accessToken');

    // Si el token existe, permite el acceso (Outlet renderiza la ruta hija)
    // Si no, redirige a la página de login ("/")
    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;