/**
 * 👤 SERVICIO DE PACIENTES V2
 * 
 * Conexión real con Supabase
 */

import { supabase } from '@/lib/supabase';
import type {
  Paciente,
  CreatePacienteInput,
  UpdatePacienteInput,
  PacienteFilters,
  PacienteSort,
  PacienteStats,
} from '../types/paciente.types';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class PacienteService {
  private readonly TABLE = 'pacientes';

  /**
   * Obtener pacientes con paginación y filtros
   */
  async getPacientes(
    empresaId: string,
    options: {
      page?: number;
      pageSize?: number;
      filters?: PacienteFilters;
      sort?: PacienteSort;
    } = {}
  ): Promise<PaginatedResult<Paciente>> {
    const {
      page = 1,
      pageSize = 20,
      filters = {},
      sort = { field: 'createdAt', direction: 'desc' },
    } = options;

    let query = supabase
      .from(this.TABLE)
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId);

    // Aplicar filtros
    if (filters.search) {
      query = query.or(`
        nombre.ilike.%${filters.search}%,
        apellido_paterno.ilike.%${filters.search}%,
        apellido_materno.ilike.%${filters.search}%,
        curp.ilike.%${filters.search}%,
        nss.ilike.%${filters.search}%
      `);
    }

    if (filters.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    if (filters.sexo) {
      query = query.eq('sexo', filters.sexo);
    }

    if (filters.puestoId) {
      query = query.eq('puesto_id', filters.puestoId);
    }

    // Ordenamiento
    query = query.order(sort.field as string, {
      ascending: sort.direction === 'asc',
    });

    // Paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw this.handleError(error);
    }

    return {
      data: (data || []).map(this.mapFromDB),
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  /**
   * Obtener un paciente por ID
   */
  async getPaciente(id: string, empresaId: string): Promise<Paciente | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw this.handleError(error);
    }

    return data ? this.mapFromDB(data) : null;
  }

  /**
   * Crear nuevo paciente
   */
  async createPaciente(
    input: CreatePacienteInput,
    empresaId: string,
    userId: string
  ): Promise<Paciente> {
    const dbData = this.mapToDB({
      ...input,
      empresaId,
      activo: true,
    });

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert([{
        ...dbData,
        created_by: userId,
      }])
      .select()
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapFromDB(data);
  }

  /**
   * Actualizar paciente
   */
  async updatePaciente(
    id: string,
    input: UpdatePacienteInput,
    empresaId: string,
    userId: string
  ): Promise<Paciente> {
    const dbData = this.mapToDB(input);

    const { data, error } = await supabase
      .from(this.TABLE)
      .update({
        ...dbData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapFromDB(data);
  }

  /**
   * Eliminar paciente (soft delete)
   */
  async deletePaciente(
    id: string,
    empresaId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({
        activo: false,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reactivar paciente
   */
  async reactivatePaciente(
    id: string,
    empresaId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({
        activo: true,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de pacientes
   */
  async getStats(empresaId: string): Promise<PacienteStats> {
    const { data, error } = await supabase
      .rpc('get_paciente_stats', {
        p_empresa_id: empresaId,
      });

    if (error) {
      // Si la función no existe, calcular manualmente
      return this.calculateStats(empresaId);
    }

    return data;
  }

  /**
   * Calcular estadísticas manualmente
   */
  private async calculateStats(empresaId: string): Promise<PacienteStats> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('activo, sexo, created_at')
      .eq('empresa_id', empresaId);

    if (error || !data) {
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        nuevosEsteMes: 0,
        porSexo: { masculino: 0, femenino: 0, otro: 0 },
      };
    }

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: data.length,
      activos: data.filter(p => p.activo).length,
      inactivos: data.filter(p => !p.activo).length,
      nuevosEsteMes: data.filter(p => new Date(p.created_at) >= inicioMes).length,
      porSexo: {
        masculino: data.filter(p => p.sexo === 'masculino').length,
        femenino: data.filter(p => p.sexo === 'femenino').length,
        otro: data.filter(p => p.sexo === 'otro').length,
      },
    };
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToChanges(
    empresaId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`pacientes:${empresaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE,
          filter: `empresa_id=eq.${empresaId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Mapear de DB a tipo
   */
  private mapFromDB(data: any): Paciente {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      nombre: data.nombre,
      apellidoPaterno: data.apellido_paterno,
      apellidoMaterno: data.apellido_materno,
      curp: data.curp,
      nss: data.nss,
      rfc: data.rfc,
      fechaNacimiento: data.fecha_nacimiento,
      edad: data.edad || this.calculateAge(data.fecha_nacimiento),
      email: data.email,
      telefono: data.telefono,
      telefonoEmergencia: data.telefono_emergencia,
      contactoEmergencia: data.contacto_emergencia,
      direccion: data.direccion,
      sexo: data.sexo,
      tipoSangre: data.tipo_sangre,
      alergias: data.alergias || [],
      enfermedadesCronicas: data.enfermedades_cronicas || [],
      medicamentos: data.medicamentos || [],
      puestoId: data.puesto_id,
      areaId: data.area_id,
      fechaIngresoEmpresa: data.fecha_ingreso_empresa,
      activo: data.activo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  /**
   * Mapear a DB
   */
  private mapToDB(data: Partial<Paciente>): any {
    const mapped: any = {};

    if (data.nombre !== undefined) mapped.nombre = data.nombre;
    if (data.apellidoPaterno !== undefined) mapped.apellido_paterno = data.apellidoPaterno;
    if (data.apellidoMaterno !== undefined) mapped.apellido_materno = data.apellidoMaterno;
    if (data.curp !== undefined) mapped.curp = data.curp;
    if (data.nss !== undefined) mapped.nss = data.nss;
    if (data.rfc !== undefined) mapped.rfc = data.rfc;
    if (data.fechaNacimiento !== undefined) mapped.fecha_nacimiento = data.fechaNacimiento;
    if (data.email !== undefined) mapped.email = data.email;
    if (data.telefono !== undefined) mapped.telefono = data.telefono;
    if (data.telefonoEmergencia !== undefined) mapped.telefono_emergencia = data.telefonoEmergencia;
    if (data.contactoEmergencia !== undefined) mapped.contacto_emergencia = data.contactoEmergencia;
    if (data.direccion !== undefined) mapped.direccion = data.direccion;
    if (data.sexo !== undefined) mapped.sexo = data.sexo;
    if (data.tipoSangre !== undefined) mapped.tipo_sangre = data.tipoSangre;
    if (data.alergias !== undefined) mapped.alergias = data.alergias;
    if (data.enfermedadesCronicas !== undefined) mapped.enfermedades_cronicas = data.enfermedadesCronicas;
    if (data.medicamentos !== undefined) mapped.medicamentos = data.medicamentos;
    if (data.puestoId !== undefined) mapped.puesto_id = data.puestoId;
    if (data.areaId !== undefined) mapped.area_id = data.areaId;
    if (data.fechaIngresoEmpresa !== undefined) mapped.fecha_ingreso_empresa = data.fechaIngresoEmpresa;
    if (data.activo !== undefined) mapped.activo = data.activo;
    if (data.empresaId !== undefined) mapped.empresa_id = data.empresaId;

    return mapped;
  }

  /**
   * Calcular edad
   */
  private calculateAge(fechaNacimiento?: string): number | undefined {
    if (!fechaNacimiento) return undefined;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): Error {
    const messages: Record<string, string> = {
      '23505': 'Ya existe un paciente con estos datos',
      'PGRST116': 'Paciente no encontrado',
      '42501': 'No tienes permisos para realizar esta acción',
    };

    return new Error(
      messages[error.code] || error.message || 'Error desconocido'
    );
  }
}

export const pacienteService = new PacienteService();
