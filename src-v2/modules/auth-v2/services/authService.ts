/**
 * 🔐 SERVICIO DE AUTENTICACIÓN V2
 * 
 * Conexión real con Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import type {
  User,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  UpdatePasswordData,
  Session,
  AuthError,
} from '../types/auth.types';

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; session: Session }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw this.handleError(error);
    }

    if (!data.user || !data.session) {
      throw new Error('No se pudo iniciar sesión');
    }

    // Obtener datos completos del usuario desde nuestra tabla
    const userDetails = await this.getUserDetails(data.user.id);

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      ...userDetails,
    };

    const session: Session = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + (data.session.expires_in * 1000),
      user,
    };

    // Guardar sesión si rememberMe
    if (credentials.rememberMe) {
      this.persistSession(session);
    }

    return { user, session };
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<{ user: User }> {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre,
          apellido_paterno: data.apellidoPaterno,
          rol: data.rol || 'paciente',
        },
      },
    });

    if (authError) {
      throw this.handleError(authError);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 2. Crear registro en tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: data.email,
        nombre: data.nombre,
        apellido_paterno: data.apellidoPaterno,
        apellido_materno: data.apellidoMaterno,
        rol: data.rol || 'paciente',
        empresa_id: data.empresaId,
        activo: true,
      });

    if (dbError) {
      // Rollback: eliminar usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw this.handleError(dbError);
    }

    const userDetails = await this.getUserDetails(authData.user.id);
    const user: User = { id: authData.user.id, email: data.email, ...userDetails };

    return { user };
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw this.handleError(error);
    }

    // Limpiar sesión persistida
    this.clearPersistedSession();
  }

  /**
   * Refrescar sesión
   */
  async refreshSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session || !data.user) {
      return null;
    }

    const userDetails = await this.getUserDetails(data.user.id);

    const session: Session = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + (data.session.expires_in * 1000),
      user: {
        id: data.user.id,
        email: data.user.email!,
        ...userDetails,
      },
    };

    this.persistSession(session);

    return session;
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(data: PasswordResetData): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener sesión actual
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    const userDetails = await this.getUserDetails(data.session.user.id);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + (data.session.expires_in * 1000),
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        ...userDetails,
      },
    };
  }

  /**
   * Obtener datos del usuario desde la BD
   */
  private async getUserDetails(userId: string): Promise<Omit<User, 'id' | 'email'>> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    return {
      nombre: data.nombre,
      apellidoPaterno: data.apellido_paterno,
      apellidoMaterno: data.apellido_materno,
      rol: data.rol,
      empresaId: data.empresa_id,
      sedeId: data.sede_id,
      avatar: data.avatar,
      telefono: data.telefono,
      especialidad: data.especialidad,
      cedulaProfesional: data.cedula_profesional,
      activo: data.activo,
      ultimoAcceso: data.ultimo_acceso,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Persistir sesión en localStorage
   */
  private persistSession(session: Session): void {
    try {
      localStorage.setItem('mediflow_session', JSON.stringify({
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      }));
    } catch (e) {
      console.error('Error persistiendo sesión:', e);
    }
  }

  /**
   * Limpiar sesión persistida
   */
  private clearPersistedSession(): void {
    try {
      localStorage.removeItem('mediflow_session');
    } catch (e) {
      console.error('Error limpiando sesión:', e);
    }
  }

  /**
   * Manejar errores de Supabase
   */
  private handleError(error: any): AuthError {
    const errorMap: Record<string, string> = {
      'invalid_credentials': 'Credenciales inválidas',
      'user_not_found': 'Usuario no encontrado',
      'invalid_email': 'Email inválido',
      'weak_password': 'Contraseña débil',
      'email_taken': 'El email ya está registrado',
      'session_expired': 'Sesión expirada',
    };

    return {
      code: error.code || 'unknown',
      message: errorMap[error.code] || error.message || 'Error desconocido',
      details: error.details,
    };
  }
}

export const authService = new AuthService();
