// en frontend/src/services/axiosInterceptor.ts - VERSIÓN MEJORADA
import axios from 'axios';
import { authService } from './authService';
import { message } from 'antd';

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.request.use(
  (config) => {
    authService.updateLastActivity();
    
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    authService.updateLastActivity();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya estamos refrescando, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authService.getRefreshToken();
      
      if (!refreshToken) {
        // No hay refresh token, logout
        authService.logout();
        message.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // Intentar refrescar el token
        const response = await axios.post('https://proyecto-univida2.onrender.com/api/token/refresh/', {
          refresh: refreshToken
        });

        const newAccessToken = response.data.access;
        authService.setTokens(newAccessToken);

        // Procesar cola de peticiones pendientes
        processQueue(null, newAccessToken);

        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);

      } catch (refreshError) {
        // Error al refrescar, logout
        processQueue(refreshError, null);
        authService.logout();
        message.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);