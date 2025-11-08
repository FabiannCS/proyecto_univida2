// en frontend/src/services/authService.ts - AÑADIR FUNCIONALIDAD DE USUARIO
import { jwtDecode } from 'jwt-decode';

interface UserInfo {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly LAST_ACTIVITY_KEY = 'lastActivity';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000;

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    this.updateLastActivity();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  updateLastActivity(): void {
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
  }

  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    if (!lastActivity) return true;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > this.SESSION_TIMEOUT;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isSessionExpired();
  }

  // NUEVO: Obtener información del usuario desde el token
  getUserInfo(): UserInfo | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return {
        username: decoded.username || '',
        first_name: decoded.first_name || '',
        last_name: decoded.last_name || '',
        email: decoded.email || '',
        rol: decoded.rol || ''
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // NUEVO: Obtener nombre completo
  getFullName(): string {
    const userInfo = this.getUserInfo();
    if (!userInfo) return 'Usuario';

    if (userInfo.first_name && userInfo.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    } else if (userInfo.first_name) {
      return userInfo.first_name;
    } else {
      return userInfo.username;
    }
  }

  // NUEVO: Obtener solo el username
  getUsername(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.username || 'Usuario';
  }

  // NUEVO: Obtener rol
  getUserRole(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.rol || '';
  }
}

export const authService = new AuthService();