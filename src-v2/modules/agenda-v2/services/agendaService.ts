/**
 * 📅 SERVICIO DE AGENDA V2
 */

import { supabase } from '@/lib/supabase';
import type {
  Cita,
  CreateCitaInput,
  UpdateCitaInput,
  AgendaFilters,
  AgendaStats,
  Disponibilidad,
} from '../types/agenda.types';

class AgendaService {
  private readonly TABLE = 'citas';

  /**
   * Obtener citas con filtros
   */
  async getCitas(
    empresaId: string,
    filters: AgendaFilters = {}
  ): Promise<Cita[]> {
    let query = supabase
      .from(this.TABLE)
      .select(`
        *,
        paciente:paciente_id(id, nombre, apellido_paterno, apellido_materno, telefono, email),
        medico:medico_id(id, nombre, apellido_paterno, especialidad)
      `)
      .eq('empresa_id', empresaId);

    // Aplicar filtros
    if (filters.fechaDesde) {
      query = query.gte('fecha_inicio', filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      query = query.lte('fecha_inicio', filters.fechaHasta);
    }
    if (filters.medicoId) {
      query = query.eq('medico_id', filters.medicoId);
    }
    if (filters.pacienteId) {
      query = query.eq('paciente_id', filters.pacienteId);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    // Ordenar por fecha
    query = query.order('fecha_inicio', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapFromDB);
  }

  /**
   * Obtener citas de hoy
   */
  async getCitasHoy(empresaId: string): Promise<Cita[]> {
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    return this.getCitas(empresaId, {
      fechaDesde: hoy,
      fechaHasta: manana,
    });
  }

  /**
   * Obtener una cita por ID
   */
  async getCita(id: string, empresaId: string): Promise<Cita | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select(`
        *,
        paciente:paciente_id(*),
        medico:medico_id(*)
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw this.handleError(error);
    }

    return data ? this.mapFromDB(data) : null;
  }

  /**
   * Crear nueva cita
   */
  async createCita(
    input: CreateCitaInput,
    empresaId: string,
    userId: string
  ): Promise<Cita> {
    // Calcular fecha fin
    const fechaInicio = new Date(input.fechaInicio);
    const fechaFin = new Date(fechaInicio.getTime() + input.duracion * 60000);

    const dbData = {
      empresa_id: empresaId,
      paciente_id: input.pacienteId,
      medico_id: input.medicoId,
      fecha_inicio: input.fechaInicio,
      fecha_fin: fechaFin.toISOString(),
      duracion: input.duracion,
      tipo: input.tipo,
      estado: 'pendiente',
      motivo: input.motivo,
      notas: input.notas,
      consultorio: input.consultorio,
      recordatorio_enviado: false,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert([dbData])
      .select(`
        *,
        paciente:paciente_id(id, nombre, apellido_paterno, apellido_materno),
        medico:medico_id(id, nombre, apellido_paterno, especialidad)
      `)
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapFromDB(data);
  }

  /**
   * Actualizar cita
   */
  async updateCita(
    id: string,
    input: UpdateCitaInput,
    empresaId: string,
    userId: string
  ): Promise<Cita> {
    const updateData: any = {};

    if (input.pacienteId) updateData.paciente_id = input.pacienteId;
    if (input.medicoId) updateData.medico_id = input.medicoId;
    if (input.fechaInicio) {
      updateData.fecha_inicio = input.fechaInicio;
      if (input.duracion) {
        const fechaInicio = new Date(input.fechaInicio);
        const fechaFin = new Date(fechaInicio.getTime() + input.duracion * 60000);
        updateData.fecha_fin = fechaFin.toISOString();
      }
    }
    if (input.duracion) updateData.duracion = input.duracion;
    if (input.tipo) updateData.tipo = input.tipo;
    if (input.estado) updateData.estado = input.estado;
    if (input.motivo !== undefined) updateData.motivo = input.motivo;
    if (input.notas !== undefined) updateData.notas = input.notas;
    if (input.consultorio !== undefined) updateData.consultorio = input.consultorio;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(this.TABLE)
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select(`
        *,
        paciente:paciente_id(id, nombre, apellido_paterno, apellido_materno),
        medico:medico_id(id, nombre, apellido_paterno, especialidad)
      `)
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapFromDB(data);
  }

  /**
   * Cancelar cita
   */
  async cancelarCita(
    id: string,
    motivo: string,
    empresaId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({
        estado: 'cancelada',
        motivo_cancelacion: motivo,
        cancelado_por: userId,
        fecha_cancelacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Completar cita
   */
  async completarCita(
    id: string,
    empresaId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({
        estado: 'completada',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verificar disponibilidad
   */
  async verificarDisponibilidad(
    medicoId: string,
    fecha: string,
    horaInicio: string,
    duracion: number,
    empresaId: string
  ): Promise<{ disponible: boolean; conflicto?: Cita }> {
    const fechaHoraInicio = new Date(`${fecha}T${horaInicio}`);
    const fechaHoraFin = new Date(fechaHoraInicio.getTime() + duracion * 60000);

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('medico_id', medicoId)
      .eq('empresa_id', empresaId)
      .not('estado', 'in', '("cancelada","no_asistio")')
      .or(`and(fecha_inicio.lte.${fechaHoraFin.toISOString()},fecha_fin.gte.${fechaHoraInicio.toISOString()})`);

    if (error) {
      throw this.handleError(error);
    }

    const conflictos = (data || []).map(this.mapFromDB);
    
    return {
      disponible: conflictos.length === 0,
      conflicto: conflictos[0],
    };
  }

  /**
   * Obtener estadísticas
   */
  async getStats(empresaId: string): Promise<AgendaStats> {
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('fecha_inicio', hoy)
      .lt('fecha_inicio', manana);

    if (error || !data) {
      return {
        totalHoy: 0,
        pendientes: 0,
        completadas: 0,
        canceladas: 0,
      };
    }

    const citas = data.map(this.mapFromDB);

    return {
      totalHoy: citas.length,
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      completadas: citas.filter(c => c.estado === 'completada').length,
      canceladas: citas.filter(c => c.estado === 'cancelada').length,
      proximaCita: citas
        .filter(c => new Date(c.fechaInicio) > new Date())
        .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())[0],
    };
  }

  /**
   * Mapear de DB
   */
  private mapFromDB(data: any): Cita {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      pacienteId: data.paciente_id,
      paciente: data.paciente,
      medicoId: data.medico_id,
      medico: data.medico,
      fechaInicio: data.fecha_inicio,
      fechaFin: data.fecha_fin,
      duracion: data.duracion,
      tipo: data.tipo,
      estado: data.estado,
      motivo: data.motivo,
      notas: data.notas,
      consultorio: data.consultorio,
      sedeId: data.sede_id,
      recordatorioEnviado: data.recordatorio_enviado,
      recordatorioFecha: data.recordatorio_fecha,
      canceladoPor: data.cancelado_por,
      motivoCancelacion: data.motivo_cancelacion,
      fechaCancelacion: data.fecha_cancelacion,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    };
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): Error {
    const messages: Record<string, string> = {
      'PGRST116': 'Cita no encontrada',
      '42501': 'No tienes permisos',
      '23505': 'Ya existe una cita en ese horario',
    };

    return new Error(messages[error.code] || error.message || 'Error desconocido');
  }
}

export const agendaService = new AgendaService();
