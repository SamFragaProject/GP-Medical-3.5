/**
 * Servicio NOM-011 Conservación Auditiva
 * 
 * Gestión completa del Programa de Conservación Auditiva según NOM-011-STPS-2001.
 * Incluye: programas anuales, estudios de audiometría, entrega de EPP y reportes.
 * 
 * Integración con usePermisosDinamicos:
 * - Módulo: 'nom011' (o 'estudios_medicos')
 * - Acciones: 'ver', 'crear', 'editar', 'exportar', 'imprimir'
 */

import { supabase } from '@/lib/supabase';
import type {
  ProgramaConservacionAuditiva,
  EstudioAudiometria,
  EppAuditivoEntregado,
  AreaExposicionRuido,
  CreateProgramaAuditivoDTO,
  UpdateProgramaAuditivoDTO,
  CreateAudiometriaDTO,
  UpdateAudiometriaDTO,
  CreateEppAuditivoDTO,
  ReporteAnualNom011,
  TipoEstudioAudiometria,
  SemaforoNom011
} from '@/types/nom011';
import type { User } from '@/types/auth';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface FiltrosAudiometria {
  empresa_id?: string;
  programa_id?: string;
  paciente_id?: string;
  tipo_estudio?: TipoEstudioAudiometria;
  semaforo?: SemaforoNom011;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface FiltrosPrograma {
  empresa_id?: string;
  sede_id?: string;
  anio?: number;
  estado?: string;
}

export interface OpcionesListado {
  page?: number;
  limit?: number;
  ordenar_por?: string;
  direccion?: 'asc' | 'desc';
}

/**
 * Servicio NOM-011 Conservación Auditiva
 */
export const nom011Service = {
  // ==========================================
  // PROGRAMAS
  // ==========================================

  /**
   * Listar programas de conservación auditiva
   */
  async listarProgramas(
    filtros: FiltrosPrograma = {},
    opciones: OpcionesListado = {}
  ): Promise<{ data: ProgramaConservacionAuditiva[]; total: number }> {
    const { page = 1, limit = 20 } = opciones;

    let query = supabase
      .from('programas_conservacion_auditiva')
      .select('*', { count: 'exact' });

    if (filtros.empresa_id) {
      query = query.eq('empresa_id', filtros.empresa_id);
    }
    if (filtros.sede_id) {
      query = query.eq('sede_id', filtros.sede_id);
    }
    if (filtros.anio) {
      query = query.eq('anio', filtros.anio);
    }
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('anio', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error listando programas:', error);
      throw new Error(`Error al listar programas: ${error.message}`);
    }

    return { data: (data || []) as unknown as ProgramaConservacionAuditiva[], total: count || 0 };
  },

  /**
   * Obtener programa específico con todas sus relaciones
   */
  async obtenerPrograma(id: string): Promise<ProgramaConservacionAuditiva> {
    const { data, error } = await supabase
      .from('programas_conservacion_auditiva')
      .select(`
        *,
        responsable_medico:profiles!programas_conservacion_auditiva_responsable_medico_id_fkey(id, nombre, apellido_paterno),
        responsable_empresa:profiles!programas_conservacion_auditiva_responsable_empresa_id_fkey(id, nombre, apellido_paterno)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo programa:', error);
      throw new Error(`Error al obtener programa: ${error.message}`);
    }

    // Cargar resumen de estudios
    const { data: resumenEstudios } = await supabase
      .from('estudios_audiometria')
      .select('semaforo, categoria_riesgo')
      .eq('programa_id', id);

    return {
      ...data,
      resumen_estudios: {
        total: resumenEstudios?.length || 0,
        por_semaforo: {
          verde: resumenEstudios?.filter(e => e.semaforo === 'verde').length || 0,
          amarillo: resumenEstudios?.filter(e => e.semaforo === 'amarillo').length || 0,
          rojo: resumenEstudios?.filter(e => e.semaforo === 'rojo').length || 0
        },
        por_categoria: {
          I: resumenEstudios?.filter(e => e.categoria_riesgo === 'I').length || 0,
          II: resumenEstudios?.filter(e => e.categoria_riesgo === 'II').length || 0,
          III: resumenEstudios?.filter(e => e.categoria_riesgo === 'III').length || 0,
          IV: resumenEstudios?.filter(e => e.categoria_riesgo === 'IV').length || 0
        }
      }
    } as ProgramaConservacionAuditiva;
  },

  /**
   * Crear nuevo programa anual
   */
  async crearPrograma(data: CreateProgramaAuditivoDTO, usuario: User): Promise<ProgramaConservacionAuditiva> {
    const { data: programa, error } = await supabase
      .from('programas_conservacion_auditiva')
      .insert({
        ...data,
        created_by: usuario.id,
        updated_by: usuario.id,
        estado: 'activo'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando programa:', error);
      throw new Error(`Error al crear programa: ${error.message}`);
    }

    return this.obtenerPrograma(programa.id);
  },

  /**
   * Actualizar programa
   */
  async actualizarPrograma(
    id: string,
    data: UpdateProgramaAuditivoDTO,
    usuario: User
  ): Promise<ProgramaConservacionAuditiva> {
    const { data: programa, error } = await supabase
      .from('programas_conservacion_auditiva')
      .update({
        ...data,
        updated_by: usuario.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando programa:', error);
      throw new Error(`Error al actualizar programa: ${error.message}`);
    }

    return this.obtenerPrograma(programa.id);
  },

  // ==========================================
  // ESTUDIOS DE AUDIOMETRÍA
  // ==========================================

  /**
   * Listar estudios de audiometría
   */
  async listarAudiometrias(
    filtros: FiltrosAudiometria = {},
    opciones: OpcionesListado = {}
  ): Promise<{ data: EstudioAudiometria[]; total: number }> {
    const { page = 1, limit = 20 } = opciones;

    let query = supabase
      .from('estudios_audiometria')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno)
      `, { count: 'exact' });

    if (filtros.empresa_id) {
      query = query.eq('empresa_id', filtros.empresa_id);
    }
    if (filtros.programa_id) {
      query = query.eq('programa_id', filtros.programa_id);
    }
    if (filtros.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id);
    }
    if (filtros.tipo_estudio) {
      query = query.eq('tipo_estudio', filtros.tipo_estudio);
    }
    if (filtros.semaforo) {
      query = query.eq('semaforo', filtros.semaforo);
    }
    if (filtros.fecha_inicio) {
      query = query.gte('fecha_estudio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      query = query.lte('fecha_estudio', filtros.fecha_fin);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('fecha_estudio', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error listando audiometrías:', error);
      throw new Error(`Error al listar audiometrías: ${error.message}`);
    }

    return { data: (data || []) as unknown as EstudioAudiometria[], total: count || 0 };
  },

  /**
   * Obtener estudio de audiometría específico
   */
  async obtenerAudiometria(id: string): Promise<EstudioAudiometria> {
    const { data, error } = await supabase
      .from('estudios_audiometria')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, puesto_trabajo),
        tecnico:profiles!estudios_audiometria_tecnico_realiza_id_fkey(id, nombre, apellido_paterno),
        medico:profiles!estudios_audiometria_medico_interpreta_id_fkey(id, nombre, apellido_paterno, cedula_profesional),
        estudio_anterior:estudios_audiometria!estudios_audiometria_estudio_anterior_id_fkey(id, fecha_estudio, semaforo, od_4000hz, oi_4000hz)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo audiometría:', error);
      throw new Error(`Error al obtener audiometría: ${error.message}`);
    }

    return data as EstudioAudiometria;
  },

  /**
   * Crear estudio de audiometría
   * Los cálculos NOM-011 se realizan automáticamente vía trigger
   */
  async crearAudiometria(data: CreateAudiometriaDTO, usuario: User): Promise<EstudioAudiometria> {
    const { data: audiometria, error } = await supabase
      .from('estudios_audiometria')
      .insert({
        ...data,
        created_by: usuario.id,
        updated_by: usuario.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando audiometría:', error);
      throw new Error(`Error al crear audiometría: ${error.message}`);
    }

    // Actualizar contadores del programa
    if (data.programa_id) {
      await this.actualizarContadoresPrograma(data.programa_id);
    }

    return this.obtenerAudiometria(audiometria.id);
  },

  /**
   * Actualizar estudio de audiometría
   */
  async actualizarAudiometria(
    id: string,
    data: UpdateAudiometriaDTO,
    usuario: User
  ): Promise<EstudioAudiometria> {
    const { data: audiometria, error } = await supabase
      .from('estudios_audiometria')
      .update({
        ...data,
        updated_by: usuario.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando audiometría:', error);
      throw new Error(`Error al actualizar audiometría: ${error.message}`);
    }

    return this.obtenerAudiometria(audiometria.id);
  },

  /**
   * Eliminar estudio de audiometría
   */
  async eliminarAudiometria(id: string): Promise<void> {
    const { error } = await supabase
      .from('estudios_audiometria')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando audiometría:', error);
      throw new Error(`Error al eliminar audiometría: ${error.message}`);
    }
  },

  // ==========================================
  // CÁLCULOS NOM-011
  // ==========================================

  /**
   * Calcular semáforo NOM-011 para valores de audiometría
   * Usa la función SQL calcular_semaforo_nom011
   */
  async calcularSemaforo(
    od: { '500hz': number; '1000hz': number; '2000hz': number; '3000hz': number; '4000hz': number; '6000hz': number },
    oi: { '500hz': number; '1000hz': number; '2000hz': number; '3000hz': number; '4000hz': number; '6000hz': number }
  ): Promise<SemaforoNom011> {
    const { data, error } = await supabase
      .rpc('calcular_semaforo_nom011', {
        p_od_500: od['500hz'],
        p_od_1000: od['1000hz'],
        p_od_2000: od['2000hz'],
        p_od_3000: od['3000hz'],
        p_od_4000: od['4000hz'],
        p_od_6000: od['6000hz'],
        p_oi_500: oi['500hz'],
        p_oi_1000: oi['1000hz'],
        p_oi_2000: oi['2000hz'],
        p_oi_3000: oi['3000hz'],
        p_oi_4000: oi['4000hz'],
        p_oi_6000: oi['6000hz']
      });

    if (error) {
      console.error('Error calculando semáforo:', error);
      throw new Error(`Error al calcular semáforo: ${error.message}`);
    }

    return data as SemaforoNom011;
  },

  /**
   * Calcular categoría de riesgo NOM-011
   */
  async calcularCategoriaRiesgo(
    od: { '500hz': number; '1000hz': number; '2000hz': number; '3000hz': number; '4000hz': number; '6000hz': number },
    oi: { '500hz': number; '1000hz': number; '2000hz': number; '3000hz': number; '4000hz': number; '6000hz': number }
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('calcular_categoria_riesgo_nom011', {
        p_od_500: od['500hz'],
        p_od_1000: od['1000hz'],
        p_od_2000: od['2000hz'],
        p_od_3000: od['3000hz'],
        p_od_4000: od['4000hz'],
        p_od_6000: od['6000hz'],
        p_oi_500: oi['500hz'],
        p_oi_1000: oi['1000hz'],
        p_oi_2000: oi['2000hz'],
        p_oi_3000: oi['3000hz'],
        p_oi_4000: oi['4000hz'],
        p_oi_6000: oi['6000hz']
      });

    if (error) {
      console.error('Error calculando categoría:', error);
      throw new Error(`Error al calcular categoría: ${error.message}`);
    }

    return data as string;
  },

  // ==========================================
  // EPP AUDITIVO
  // ==========================================

  /**
   * Registrar entrega de EPP auditivo
   */
  async crearEpp(data: CreateEppAuditivoDTO, usuario: User): Promise<EppAuditivoEntregado> {
    const { data: epp, error } = await supabase
      .from('epp_auditivo_entregado')
      .insert({
        ...data,
        responsable_entrega_id: usuario.id
      })
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno)
      `)
      .single();

    if (error) {
      console.error('Error creando registro EPP:', error);
      throw new Error(`Error al registrar EPP: ${error.message}`);
    }

    return epp as EppAuditivoEntregado;
  },

  /**
   * Listar EPP entregado
   */
  async listarEpp(
    empresaId: string,
    pacienteId?: string
  ): Promise<EppAuditivoEntregado[]> {
    let query = supabase
      .from('epp_auditivo_entregado')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno)
      `)
      .eq('empresa_id', empresaId)
      .order('fecha_entrega', { ascending: false });

    if (pacienteId) {
      query = query.eq('paciente_id', pacienteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listando EPP:', error);
      throw new Error(`Error al listar EPP: ${error.message}`);
    }

    return data as EppAuditivoEntregado[];
  },

  // ==========================================
  // ÁREAS DE EXPOSICIÓN
  // ==========================================

  /**
   * Crear/actualizar área con exposición al ruido
   */
  async guardarArea(area: Partial<AreaExposicionRuido>, usuario: User): Promise<AreaExposicionRuido> {
    const { data, error } = await supabase
      .from('areas_exposicion_ruido')
      .upsert({
        ...area,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando área:', error);
      throw new Error(`Error al guardar área: ${error.message}`);
    }

    return data as AreaExposicionRuido;
  },

  /**
   * Listar áreas de exposición
   */
  async listarAreas(empresaId: string, programaId?: string): Promise<AreaExposicionRuido[]> {
    let query = supabase
      .from('areas_exposicion_ruido')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nombre_area');

    if (programaId) {
      query = query.eq('programa_id', programaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listando áreas:', error);
      throw new Error(`Error al listar áreas: ${error.message}`);
    }

    return data as AreaExposicionRuido[];
  },

  // ==========================================
  // REPORTES
  // ==========================================

  /**
   * Generar reporte anual NOM-011
   */
  async generarReporteAnual(empresaId: string, anio: number): Promise<ReporteAnualNom011> {
    // Obtener programa
    const { data: programa } = await supabase
      .from('programas_conservacion_auditiva')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('anio', anio)
      .single();

    // Obtener estadísticas de audiometrías
    const { data: estudios } = await supabase
      .from('estudios_audiometria')
      .select('semaforo, categoria_riesgo')
      .eq('empresa_id', empresaId)
      .gte('fecha_estudio', `${anio}-01-01`)
      .lte('fecha_estudio', `${anio}-12-31`);

    // Obtener estadísticas de EPP
    const { data: eppCount } = await supabase
      .from('epp_auditivo_entregado')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .gte('fecha_entrega', `${anio}-01-01`)
      .lte('fecha_entrega', `${anio}-12-31`);

    // Obtener áreas evaluadas
    const { data: areas } = await supabase
      .from('areas_exposicion_ruido')
      .select('zona_ruido')
      .eq('empresa_id', empresaId);

    const totalEvaluados = estudios?.length || 0;

    return {
      anio,
      empresa_id: empresaId,
      total_trabajadores_expuestos: programa?.total_trabajadores_expuestos || 0,
      total_evaluados: totalEvaluados,
      porcentaje_cobertura: programa?.porcentaje_cobertura || 0,
      por_categoria: {
        I: estudios?.filter(e => e.categoria_riesgo === 'I').length || 0,
        II: estudios?.filter(e => e.categoria_riesgo === 'II').length || 0,
        III: estudios?.filter(e => e.categoria_riesgo === 'III').length || 0,
        IV: estudios?.filter(e => e.categoria_riesgo === 'IV').length || 0
      },
      por_semaforo: {
        verde: estudios?.filter(e => e.semaforo === 'verde').length || 0,
        amarillo: estudios?.filter(e => e.semaforo === 'amarillo').length || 0,
        rojo: estudios?.filter(e => e.semaforo === 'rojo').length || 0
      },
      total_epp_entregado: eppCount?.length || 0,
      porcentaje_uso_conforme: programa?.porcentaje_epp_conforme || 0,
      areas_evaluadas: areas?.length || 0,
      areas_requieren_intervencion: areas?.filter(a => a.zona_ruido === 'dañina' || a.zona_ruido === 'muy_danina').length || 0
    };
  },

  /**
   * Generar PDF del reporte anual
   */
  async generarPDFReporteAnual(empresaId: string, anio: number): Promise<Blob> {
    const reporte = await this.generarReporteAnual(empresaId, anio);

    // Placeholder - el componente frontend debe usar una librería PDF
    return new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
  },

  // ==========================================
  // FUNCIONES PRIVADAS
  // ==========================================

  /**
   * Actualizar contadores del programa
   */
  async actualizarContadoresPrograma(programaId: string): Promise<void> {
    const { data: stats } = await supabase
      .from('estudios_audiometria')
      .select('semaforo')
      .eq('programa_id', programaId);

    const totalEvaluados = stats?.length || 0;
    const conDano = stats?.filter(s => s.semaforo === 'rojo').length || 0;

    await supabase
      .from('programas_conservacion_auditiva')
      .update({
        trabajadores_evaluados: totalEvaluados,
        trabajadores_con_dano: conDano
      })
      .eq('id', programaId);
  }
};

export default nom011Service;
