/**
 * 🏪 AUTH PROVIDER V2
 * 
 * Provee el contexto de autenticación a toda la aplicación
 * con manejo robusto de sesión y errores.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User, UserRole, Permission, AuthError } from '../types/auth.types';

interface AuthContextType {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Acciones
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    empresaId: string;
    rol?: UserRole;
  }) => Promise<void>;
  resetPassword: (data: { email: string }) => Promise<void>;
  updatePassword: (data: { password: string }) => Promise<void>;
  clearError: () => void;
  
  // Permisos
  hasPermission: (resource: string, action: Permission['action']) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (resource: string) => boolean;
  
  // Utilidades
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  
  return context;
}

/**
 * HOC para proteger componentes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuthContext();

    if (isLoading) {
      return <AuthLoadingState />;
    }

    if (!isAuthenticated) {
      return <AuthRequiredState />;
    }

    return <Component {...props} />;
  };
}

/**
 * Componente de loading
 */
function AuthLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Componente cuando se requiere autenticación
 */
function AuthRequiredState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 mb-4">
          Debes iniciar sesión para acceder a esta página
        </p>
        <a 
          href="/login" 
          className="text-primary hover:underline"
        >
          Ir a login
        </a>
      </div>
    </div>
  );
}
