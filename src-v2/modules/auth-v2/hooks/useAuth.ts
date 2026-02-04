/**
 * 🪝 HOOK DE AUTENTICACIÓN V2
 * 
 * Features:
 * - Refresh token automático
 * - Persistencia de sesión
 * - Manejo de errores robusto
 * - Permisos granulares
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import type {
  User,
  UserRole,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  UpdatePasswordData,
  Permission,
  AuthError,
  Session,
} from '../types/auth.types';
import { ROLE_PERMISSIONS } from '../types/auth.types';

interface UseAuthReturn {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  updatePassword: (data: UpdatePasswordData) => Promise<void>;
  clearError: () => void;
  
  // Permisos
  hasPermission: (resource: string, action: Permission['action']) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (resource: string) => boolean;
  
  // Utilidades
  refreshSession: () => Promise<boolean>;
}

// Intervalo de refresh: 5 minutos antes de expirar
const REFRESH_THRESHOLD = 5 * 60 * 1000;

export function useAuth(): UseAuthReturn {
  // Estado
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  
  // Refs para evitar re-renders innecesarios
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const isAuthenticated = !!user;

  /**
   * Login
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: userData, session } = await authService.login(credentials);
      
      setUser(userData);
      setSessionExpiresAt(session.expiresAt);
      
      // Iniciar refresh automático
      startRefreshInterval(session.expiresAt);
      
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
      
      setUser(null);
      setSessionExpiresAt(null);
      clearRefreshInterval();
      
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register
   */
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(data);
      // No hacer login automático, requiere confirmación de email
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (data: PasswordResetData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update password
   */
  const updatePassword = useCallback(async (data: UpdatePasswordData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.updatePassword(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh session manual
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    
    isRefreshingRef.current = true;
    
    try {
      const session = await authService.refreshSession();
      
      if (session) {
        setUser(session.user);
        setSessionExpiresAt(session.expiresAt);
        startRefreshInterval(session.expiresAt);
        return true;
      }
      
      // Si no hay sesión, hacer logout
      setUser(null);
      setSessionExpiresAt(null);
      return false;
      
    } catch (err) {
      console.error('Error refrescando sesión:', err);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  /**
   * Verificar permisos
   */
  const hasPermission = useCallback((
    resource: string,
    action: Permission['action']
  ): boolean => {
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.rol];
    
    // Super admin tiene todos los permisos
    if (permissions.some(p => p.resource === '*' && p.action === 'manage')) {
      return true;
    }

    return permissions.some(
      p => p.resource === resource && 
      (p.action === action || p.action === 'manage')
    );
  }, [user]);

  /**
   * Verificar rol
   */
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  }, [user]);

  /**
   * Verificar acceso a recurso (cualquier acción)
   */
  const canAccess = useCallback((resource: string): boolean => {
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.rol];
    
    return permissions.some(
      p => p.resource === resource || p.resource === '*'
    );
  }, [user]);

  /**
   * Iniciar intervalo de refresh
   */
  const startRefreshInterval = useCallback((expiresAt: number) => {
    clearRefreshInterval();
    
    const timeUntilRefresh = expiresAt - Date.now() - REFRESH_THRESHOLD;
    
    if (timeUntilRefresh > 0) {
      refreshIntervalRef.current = setTimeout(() => {
        refreshSession();
      }, timeUntilRefresh);
    }
  }, [refreshSession]);

  /**
   * Limpiar intervalo de refresh
   */
  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Restaurar sesión al montar
   */
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        
        if (mounted && session) {
          setUser(session.user);
          setSessionExpiresAt(session.expiresAt);
          startRefreshInterval(session.expiresAt);
        }
      } catch (err) {
        console.error('Error restaurando sesión:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
      clearRefreshInterval();
    };
  }, [startRefreshInterval, clearRefreshInterval]);

  /**
   * Escuchar cambios de auth de Supabase
   */
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSessionExpiresAt(null);
          clearRefreshInterval();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // El token se refrescó automáticamente
          const expiresAt = Date.now() + (session.expires_in * 1000);
          setSessionExpiresAt(expiresAt);
          startRefreshInterval(expiresAt);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [startRefreshInterval, clearRefreshInterval]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    clearError,
    hasPermission,
    hasRole,
    canAccess,
    refreshSession,
  };
}


