// en frontend/src/hooks/useSessionTimeout.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { message } from 'antd';

export const useSessionTimeout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sesión al cargar el componente
    const checkSession = () => {
      if (!authService.isAuthenticated()) {
        authService.logout();
        message.error('Tu sesión ha expirado por inactividad.');
        navigate('/');
      }
    };

    // Verificar sesión inmediatamente
    checkSession();

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      authService.updateLastActivity();
    };

    // Añadir event listeners para detectar actividad
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Verificar sesión cada minuto
    const interval = setInterval(checkSession, 60000);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [navigate]);
};