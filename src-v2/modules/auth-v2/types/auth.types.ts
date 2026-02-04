/**
 * 🔐 TIPOS DE AUTENTICACIÓN V2
 */

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  rol: UserRole;
  empresaId: string;
  sedeId?: string;
  avatar?: string;
  telefono?: string;
  especialidad?: string;
  cedulaProfesional?: string;
  activo: boolean;
  ultimoAcceso?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'super_admin' 
  | 'admin_empresa' 
  | 'medico' 
  | 'recepcionista' 
  | 'paciente';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  sessionExpiresAt: number | null;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  empresaId: string;
  rol?: UserRole;
}

export interface PasswordResetData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Mapeo de roles a permisos
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: '*', action: 'manage' },
  ],
  admin_empresa: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'pacientes', action: 'manage' },
    { resource: 'citas', action: 'manage' },
    { resource: 'inventario', action: 'manage' },
    { resource: 'facturacion', action: 'manage' },
    { resource: 'reportes', action: 'read' },
    { resource: 'usuarios', action: 'manage' },
    { resource: 'configuracion', action: 'manage' },
  ],
  medico: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'pacientes', action: 'read' },
    { resource: 'pacientes', action: 'update' },
    { resource: 'citas', action: 'read' },
    { resource: 'citas', action: 'update' },
    { resource: 'historia-clinica', action: 'manage' },
    { resource: 'prescripciones', action: 'manage' },
    { resource: 'examenes', action: 'manage' },
  ],
  recepcionista: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'pacientes', action: 'create' },
    { resource: 'pacientes', action: 'read' },
    { resource: 'citas', action: 'manage' },
    { resource: 'agenda', action: 'read' },
  ],
  paciente: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'perfil', action: 'read' },
    { resource: 'perfil', action: 'update' },
    { resource: 'citas', action: 'create' },
    { resource: 'citas', action: 'read' },
    { resource: 'historia-medica', action: 'read' },
  ],
};
