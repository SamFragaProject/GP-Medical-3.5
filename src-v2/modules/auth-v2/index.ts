/**
 * 🔐 AUTH V2 - Exportaciones
 */

export { AuthProvider, useAuthContext, withAuth } from './components/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';

export type {
  User,
  UserRole,
  Permission,
  AuthState,
  AuthError,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  UpdatePasswordData,
  Session,
} from './types/auth.types';

export { ROLE_PERMISSIONS } from './types/auth.types';
