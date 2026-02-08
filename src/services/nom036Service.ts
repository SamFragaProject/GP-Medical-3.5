/**
 * Servicio NOM-036 Ergonomía
 * 
 * Gestión completa del Programa de Ergonomía según NOM-036-STPS-2018.
 * Incluye: evaluaciones con métodos REBA, NIOSH, OWAS; capacitaciones y reportes.
 * 
 * Integración con usePermisosDinamicos:
 * - Módulo: 'nom036' (o 'evaluaciones')
 * - Acciones: 'ver', 'crear', 'editar', 'exportar', 'imprimir'
 */

import { supabase } from '@/lib/supabase';
import type {
  ProgramaErgonomia,
  EvaluacionErgonomica,
  CapacitacionErgonomia,
  FactorRiesgoErgonomico,
  CreateProgramaErgonomiaDTO,
  UpdateProgramaErgonomiaDTO,
  CreateEvaluacionErgonomicaDTO,
  UpdateEvaluacionErgonomicaDTO,
  CreateCapacitacionErgonomiaDTO,
  MatrizRiesgoArea,
  ReporteNOM036,
  DatosREBA,
  DatosNIOSH,
  DatosOWAS,
  ResultadoREBA,
  ResultadoNIOSH,
  ResultadoOWAS,
  MetodoEvaluacionErgonomica
} from '@/types/nom036';
import type { User } from '@/types/auth';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface FiltrosEvaluacion {
  empresa_id?: string;
  programa_id?: string;
  paciente_id?: string;
  metodo_evaluacion?: MetodoEvaluacionErgonomica;
  nivel_riesgo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface OpcionesListado {
  page?: number;
  limit?: number;
  ordenar_por?: string;
  direccion?: 'asc' | 'desc';
}

/**
 * Servicio NOM-036 Ergonomía
 */
export const nom036Service = {
  // ==========================================
  // PROGRAMAS
  // ==========================================

  /**
   * Listar programas de ergonomía
   */
  async listarProgramas(
    empresaId: string,
    opciones: OpcionesListado = {}
  ): Promise<{ data: ProgramaErgonomia[]; total: number }> {
    const { page = 1, limit = 20 } = opciones;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('programas_ergonomia')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .order('anio', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error listando programas:', error);
      throw new Error(`Error al listar programas: ${error.message}`);
    }

    return { data: (data || []) as unknown as ProgramaErgonomia[], total: count || 0 };
  },

  /**
   * Obtener programa con estadísticas
   */
  async obtenerPrograma(id: string): Promise<ProgramaErgonomia> {
    const { data, error } = await supabase
      .from('programas_ergonomia')
      .select(`
        *,
        responsable_medico:profiles!programas_ergonomia_responsable_medico_id_fkey(id, nombre, apellido_paterno),
        responsable_empresa:profiles!programas_ergonomia_responsable_empresa_id_fkey(id, nombre, apellido_paterno)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo programa:', error);
      throw new Error(`Error al obtener programa: ${error.message}`);
    }

    // Obtener estadísticas de evaluaciones
    const { data: evalStats } = await supabase
      .from('evaluaciones_ergonomicas')
      .select('nivel_riesgo')
      .eq('programa_id', id);

    return {
      ...data,
      estadisticas: {
        total_evaluaciones: evalStats?.length || 0,
        por_nivel_riesgo: {
          aceptable: evalStats?.filter(e => e.nivel_riesgo === 'aceptable').length || 0,
          medio: evalStats?.filter(e => e.nivel_riesgo === 'medio').length || 0,
          alto: evalStats?.filter(e => e.nivel_riesgo === 'alto').length || 0,
          muy_alto: evalStats?.filter(e => e.nivel_riesgo === 'muy_alto').length || 0
        }
      }
    } as ProgramaErgonomia;
  },

  /**
   * Crear programa de ergonomía
   */
  async crearPrograma(data: CreateProgramaErgonomiaDTO, usuario: User): Promise<ProgramaErgonomia> {
    const { data: programa, error } = await supabase
      .from('programas_ergonomia')
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
    data: UpdateProgramaErgonomiaDTO,
    usuario: User
  ): Promise<ProgramaErgonomia> {
    const { data: programa, error } = await supabase
      .from('programas_ergonomia')
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
  // EVALUACIONES ERGONÓMICAS
  // ==========================================

  /**
   * Listar evaluaciones ergonómicas
   */
  async listarEvaluaciones(
    filtros: FiltrosEvaluacion = {},
    opciones: OpcionesListado = {}
  ): Promise<{ data: EvaluacionErgonomica[]; total: number }> {
    const { page = 1, limit = 20 } = opciones;

    let query = supabase
      .from('evaluaciones_ergonomicas')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, puesto_trabajo)
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
    if (filtros.metodo_evaluacion) {
      query = query.eq('metodo_evaluacion', filtros.metodo_evaluacion);
    }
    if (filtros.nivel_riesgo) {
      query = query.eq('nivel_riesgo', filtros.nivel_riesgo);
    }
    if (filtros.fecha_inicio) {
      query = query.gte('fecha_evaluacion', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      query = query.lte('fecha_evaluacion', filtros.fecha_fin);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('fecha_evaluacion', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error listando evaluaciones:', error);
      throw new Error(`Error al listar evaluaciones: ${error.message}`);
    }

    return { data: (data || []) as unknown as EvaluacionErgonomica[], total: count || 0 };
  },

  /**
   * Obtener evaluación específica
   */
  async obtenerEvaluacion(id: string): Promise<EvaluacionErgonomica> {
    const { data, error } = await supabase
      .from('evaluaciones_ergonomicas')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, puesto_trabajo, area_trabajo),
        evaluador:profiles!evaluaciones_ergonomicas_evaluador_id_fkey(id, nombre, apellido_paterno)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo evaluación:', error);
      throw new Error(`Error al obtener evaluación: ${error.message}`);
    }

    return data as EvaluacionErgonomica;
  },

  /**
   * Crear evaluación ergonómica
   * Los cálculos se realizan automáticamente vía trigger
   */
  async crearEvaluacion(data: CreateEvaluacionErgonomicaDTO, usuario: User): Promise<EvaluacionErgonomica> {
    const { data: evaluacion, error } = await supabase
      .from('evaluaciones_ergonomicas')
      .insert({
        ...data,
        evaluador_id: data.evaluador_id || usuario.id,
        created_by: usuario.id,
        updated_by: usuario.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando evaluación:', error);
      throw new Error(`Error al crear evaluación: ${error.message}`);
    }

    // Actualizar contadores del programa
    if (data.programa_id) {
      await this.actualizarContadoresPrograma(data.programa_id);
    }

    return this.obtenerEvaluacion(evaluacion.id);
  },

  /**
   * Actualizar evaluación
   */
  async actualizarEvaluacion(
    id: string,
    data: UpdateEvaluacionErgonomicaDTO,
    usuario: User
  ): Promise<EvaluacionErgonomica> {
    const { data: evaluacion, error } = await supabase
      .from('evaluaciones_ergonomicas')
      .update({
        ...data,
        updated_by: usuario.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando evaluación:', error);
      throw new Error(`Error al actualizar evaluación: ${error.message}`);
    }

    return this.obtenerEvaluacion(evaluacion.id);
  },

  /**
   * Eliminar evaluación
   */
  async eliminarEvaluacion(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluaciones_ergonomicas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando evaluación:', error);
      throw new Error(`Error al eliminar evaluación: ${error.message}`);
    }
  },

  // ==========================================
  // MÉTODOS DE EVALUACIÓN ESPECÍFICOS
  // ==========================================

  /**
   * Calcular evaluación REBA
   */
  async calcularREBA(datos: DatosREBA): Promise<ResultadoREBA> {
    const { data, error } = await supabase
      .rpc('calcular_reba', {
        p_cuello: datos.cuello,
        p_tronco: datos.tronco,
        p_piernas: datos.piernas,
        p_brazo: datos.brazo,
        p_antebrazo: datos.antebrazo,
        p_muneca: datos.muneca,
        p_carga: datos.carga || 0,
        p_agarrre: datos.agarre || 1,
        p_actividad: datos.actividad || 0
      });

    if (error) {
      console.error('Error calculando REBA:', error);
      throw new Error(`Error al calcular REBA: ${error.message}`);
    }

    return data as ResultadoREBA;
  },

  /**
   * Crear evaluación REBA completa
   */
  async crearEvaluacionREBA(
    puesto: string,
    datos: DatosREBA,
    empresaId: string,
    usuario: User,
    pacienteId?: string,
    programaId?: string
  ): Promise<EvaluacionErgonomica> {
    const resultado = await this.calcularREBA(datos);

    return this.crearEvaluacion({
      empresa_id: empresaId,
      programa_id: programaId,
      paciente_id: pacienteId,
      puesto_trabajo: puesto,
      metodo_evaluacion: 'REBA',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      datos_raw: datos,
      factores_riesgo: this.identificarFactoresDesdeREBA(resultado)
    }, usuario);
  },

  /**
   * Calcular evaluación NIOSH
   */
  async calcularNIOSH(datos: DatosNIOSH): Promise<ResultadoNIOSH> {
    const agarreMap = { bueno: 1.0, regular: 0.95, malo: 0.9 };

    const { data, error } = await supabase
      .rpc('calcular_niosh', {
        p_hc: datos.distancia_horizontal,
        p_vc: datos.altura_origen,
        p_dc: datos.recorrido_vertical,
        p_f: datos.frecuencia,
        p_a: datos.angulo_asimetria,
        p_c: agarreMap[datos.agarre],
        p_peso_carga: datos.peso_carga
      });

    if (error) {
      console.error('Error calculando NIOSH:', error);
      throw new Error(`Error al calcular NIOSH: ${error.message}`);
    }

    return data as ResultadoNIOSH;
  },

  /**
   * Crear evaluación NIOSH completa
   */
  async crearEvaluacionNIOSH(
    puesto: string,
    datos: DatosNIOSH,
    empresaId: string,
    usuario: User,
    pacienteId?: string,
    programaId?: string
  ): Promise<EvaluacionErgonomica> {
    const resultado = await this.calcularNIOSH(datos);

    return this.crearEvaluacion({
      empresa_id: empresaId,
      programa_id: programaId,
      paciente_id: pacienteId,
      puesto_trabajo: puesto,
      metodo_evaluacion: 'NIOSH',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      datos_raw: datos as any,
      factores_riesgo: this.identificarFactoresDesdeNIOSH(resultado)
    }, usuario);
  },

  /**
   * Calcular evaluación OWAS
   */
  async calcularOWAS(datos: DatosOWAS): Promise<ResultadoOWAS> {
    const { data, error } = await supabase
      .rpc('calcular_owas', {
        p_espalda: datos.espalda,
        p_brazos: datos.brazos,
        p_piernas: datos.piernas,
        p_carga: datos.carga
      });

    if (error) {
      console.error('Error calculando OWAS:', error);
      throw new Error(`Error al calcular OWAS: ${error.message}`);
    }

    return data as ResultadoOWAS;
  },

  /**
   * Crear evaluación OWAS completa
   */
  async crearEvaluacionOWAS(
    puesto: string,
    datos: DatosOWAS,
    empresaId: string,
    usuario: User,
    pacienteId?: string,
    programaId?: string
  ): Promise<EvaluacionErgonomica> {
    const resultado = await this.calcularOWAS(datos);

    return this.crearEvaluacion({
      empresa_id: empresaId,
      programa_id: programaId,
      paciente_id: pacienteId,
      puesto_trabajo: puesto,
      metodo_evaluacion: 'OWAS',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      datos_raw: datos as any,
      factores_riesgo: this.identificarFactoresDesdeOWAS(resultado)
    }, usuario);
  },

  // ==========================================
  // CAPACITACIONES
  // ==========================================

  /**
   * Crear capacitación en ergonomía
   */
  async crearCapacitacion(data: CreateCapacitacionErgonomiaDTO, usuario: User): Promise<CapacitacionErgonomia> {
    const { data: capacitacion, error } = await supabase
      .from('capacitaciones_ergonomia')
      .insert({
        ...data,
        created_by: usuario.id,
        updated_by: usuario.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando capacitación:', error);
      throw new Error(`Error al crear capacitación: ${error.message}`);
    }

    // Actualizar contadores del programa
    if (data.programa_id) {
      await this.actualizarContadoresCapacitaciones(data.programa_id);
    }

    return capacitacion as CapacitacionErgonomia;
  },

  /**
   * Listar capacitaciones
   */
  async listarCapacitaciones(
    empresaId: string,
    programaId?: string
  ): Promise<CapacitacionErgonomia[]> {
    let query = supabase
      .from('capacitaciones_ergonomia')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false });

    if (programaId) {
      query = query.eq('programa_id', programaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listando capacitaciones:', error);
      throw new Error(`Error al listar capacitaciones: ${error.message}`);
    }

    return data as CapacitacionErgonomia[];
  },

  // ==========================================
  // CATÁLOGO DE FACTORES
  // ==========================================

  /**
   * Obtener catálogo de factores de riesgo
   */
  async obtenerCatalogoFactores(
    categoria?: string,
    requiereAtencionNom036: boolean = true
  ): Promise<FactorRiesgoErgonomico[]> {
    let query = supabase
      .from('factores_riesgo_ergonomico_catalogo')
      .select('*')
      .eq('activo', true)
      .eq('requiere_atencion_nom036', requiereAtencionNom036)
      .order('prioridad_nom036', { ascending: true });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo catálogo:', error);
      throw new Error(`Error al obtener catálogo: ${error.message}`);
    }

    return data as FactorRiesgoErgonomico[];
  },

  // ==========================================
  // MATRIZ DE RIESGOS Y REPORTES
  // ==========================================

  /**
   * Obtener matriz de riesgos por área
   */
  async obtenerMatrizRiesgos(empresaId: string): Promise<MatrizRiesgoArea[]> {
    const { data: evaluaciones, error } = await supabase
      .from('evaluaciones_ergonomicas')
      .select('area_trabajo, puesto_trabajo, nivel_riesgo, factores_riesgo, datos_raw, metodo_evaluacion')
      .eq('empresa_id', empresaId)
      .eq('estado', 'completado');

    if (error) {
      console.error('Error obteniendo matriz:', error);
      throw new Error(`Error al obtener matriz: ${error.message}`);
    }

    // Agrupar por área
    const areasMap = new Map<string, MatrizRiesgoArea>();

    for (const ev of evaluaciones || []) {
      const key = `${ev.area_trabajo || 'Sin área'}-${ev.puesto_trabajo}`;

      if (!areasMap.has(key)) {
        areasMap.set(key, {
          area: ev.area_trabajo || 'Sin área',
          puesto: ev.puesto_trabajo,
          numero_trabajadores: 0,
          riesgo_promedio: 'aceptable',
          riesgo_maximo: 'aceptable',
          factores_identificados: [],
          medidas_implementadas: 0,
          medidas_pendientes: 0
        });
      }

      const area = areasMap.get(key)!;
      area.numero_trabajadores++;

      // Agregar factores
      for (const factor of ev.factores_riesgo || []) {
        if (!area.factores_identificados.includes(factor)) {
          area.factores_identificados.push(factor);
        }
      }

      // Actualizar riesgo máximo
      const nivelOrden = { aceptable: 1, medio: 2, alto: 3, muy_alto: 4 };
      if (nivelOrden[ev.nivel_riesgo as keyof typeof nivelOrden] > nivelOrden[area.riesgo_maximo]) {
        area.riesgo_maximo = ev.nivel_riesgo as any;
      }
    }

    return Array.from(areasMap.values());
  },

  /**
   * Generar reporte NOM-036
   */
  async generarReporteNOM036(empresaId: string, anio: number): Promise<ReporteNOM036> {
    // Obtener programa
    const { data: programa } = await supabase
      .from('programas_ergonomia')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('anio', anio)
      .single();

    // Estadísticas de evaluaciones
    const { data: evaluaciones } = await supabase
      .from('evaluaciones_ergonomicas')
      .select('metodo_evaluacion, nivel_riesgo, factores_riesgo')
      .eq('empresa_id', empresaId)
      .gte('fecha_evaluacion', `${anio}-01-01`)
      .lte('fecha_evaluacion', `${anio}-12-31`);

    // Estadísticas de capacitaciones
    const { data: capacitaciones } = await supabase
      .from('capacitaciones_ergonomia')
      .select('duracion_horas, numero_participantes')
      .eq('empresa_id', empresaId)
      .eq('estado', 'completada')
      .gte('fecha', `${anio}-01-01`)
      .lte('fecha', `${anio}-12-31`);

    // Contar factores más frecuentes
    const factorCounts: Record<string, number> = {};
    for (const ev of evaluaciones || []) {
      for (const factor of ev.factores_riesgo || []) {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      }
    }

    const factoresFrecuentes = Object.entries(factorCounts)
      .map(([factor, frecuencia]) => ({ factor, frecuencia }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10);

    const totalEvaluaciones = evaluaciones?.length || 0;

    return {
      anio,
      empresa_id: empresaId,
      programa_activo: !!programa,
      fecha_inicio_programa: programa?.fecha_inicio,
      total_evaluaciones: totalEvaluaciones,
      por_metodo: {
        REBA: evaluaciones?.filter(e => e.metodo_evaluacion === 'REBA').length || 0,
        RUEDA: evaluaciones?.filter(e => e.metodo_evaluacion === 'RUEDA').length || 0,
        OWAS: evaluaciones?.filter(e => e.metodo_evaluacion === 'OWAS').length || 0,
        NIOSH: evaluaciones?.filter(e => e.metodo_evaluacion === 'NIOSH').length || 0,
        OSHA: evaluaciones?.filter(e => e.metodo_evaluacion === 'OSHA').length || 0,
        MANUAL: evaluaciones?.filter(e => e.metodo_evaluacion === 'MANUAL').length || 0
      },
      por_nivel_riesgo: {
        aceptable: evaluaciones?.filter(e => e.nivel_riesgo === 'aceptable').length || 0,
        medio: evaluaciones?.filter(e => e.nivel_riesgo === 'medio').length || 0,
        alto: evaluaciones?.filter(e => e.nivel_riesgo === 'alto').length || 0,
        muy_alto: evaluaciones?.filter(e => e.nivel_riesgo === 'muy_alto').length || 0
      },
      factores_frecuentes: factoresFrecuentes,
      total_capacitaciones: capacitaciones?.length || 0,
      trabajadores_capacitados: capacitaciones?.reduce((sum, c) => sum + (c.numero_participantes || 0), 0) || 0,
      horas_capacitacion: capacitaciones?.reduce((sum, c) => sum + (c.duracion_horas || 0), 0) || 0,
      intervenciones_pendientes: evaluaciones?.filter(e => e.nivel_riesgo === 'alto' || e.nivel_riesgo === 'muy_alto').length || 0,
      intervenciones_completadas: 0, // Se calcularía con seguimientos
      porcentaje_avance: programa ? this.calcularPorcentajeAvance(programa, evaluaciones || []) : 0
    };
  },

  /**
   * Generar PDF del reporte
   */
  async generarPDFReporte(empresaId: string, anio: number): Promise<Blob> {
    const reporte = await this.generarReporteNOM036(empresaId, anio);

    // Placeholder - el componente frontend debe usar una librería PDF
    return new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
  },

  // ==========================================
  // FUNCIONES PRIVADAS
  // ==========================================

  async actualizarContadoresPrograma(programaId: string): Promise<void> {
    const { data: stats } = await supabase
      .from('evaluaciones_ergonomicas')
      .select('nivel_riesgo, requiere_intervencion')
      .eq('programa_id', programaId);

    const totalEvaluaciones = stats?.length || 0;
    const riesgosIdentificados = stats?.filter(s => s.nivel_riesgo !== 'aceptable').length || 0;

    await supabase
      .from('programas_ergonomia')
      .update({
        total_puestos_evaluados: totalEvaluaciones,
        total_riesgos_identificados: riesgosIdentificados
      })
      .eq('id', programaId);
  },

  async actualizarContadoresCapacitaciones(programaId: string): Promise<void> {
    const { data: stats } = await supabase
      .from('capacitaciones_ergonomia')
      .select('numero_participantes')
      .eq('programa_id', programaId)
      .eq('estado', 'completada');

    const totalCapacitados = stats?.reduce((sum, c) => sum + (c.numero_participantes || 0), 0) || 0;

    await supabase
      .from('programas_ergonomia')
      .update({
        total_trabajadores_capacitados: totalCapacitados
      })
      .eq('id', programaId);
  },

  identificarFactoresDesdeREBA(resultado: ResultadoREBA): string[] {
    const factores: string[] = [];

    if (resultado.cuello >= 2) factores.push('postura_forzada');
    if (resultado.tronco >= 3) factores.push('postura_forzada');
    if (resultado.brazo >= 4) factores.push('posicion_prolongada');
    if (resultado.carga >= 2) factores.push('manejo_cargas');
    if (resultado.actividad >= 1) factores.push('movimientos_repetitivos');

    return factores;
  },

  identificarFactoresDesdeNIOSH(resultado: ResultadoNIOSH): string[] {
    const factores: string[] = ['manejo_cargas'];

    if (resultado.altura_origen < 75) factores.push('postura_forzada');
    if (resultado.distancia_horizontal > 50) factores.push('sobreesfuerzo');
    if (resultado.angulo_asimetria > 30) factores.push('postura_forzada');

    return factores;
  },

  identificarFactoresDesdeOWAS(resultado: ResultadoOWAS): string[] {
    const factores: string[] = [];

    if (resultado.espalda >= 2) factores.push('postura_forzada');
    if (resultado.carga >= 2) factores.push('manejo_cargas');

    return factores;
  },

  calcularPorcentajeAvance(programa: any, evaluaciones: any[]): number {
    // Cálculo simplificado del porcentaje de avance
    if (!programa.fecha_inicio || !programa.fecha_fin) return 0;

    const inicio = new Date(programa.fecha_inicio);
    const fin = new Date(programa.fecha_fin);
    const hoy = new Date();

    const totalDias = (fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24);
    const diasTranscurridos = (hoy.getTime() - inicio.getTime()) / (1000 * 3600 * 24);

    const avanceTiempo = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));

    // Ajustar por metas cumplidas
    const metaEvaluaciones = programa.total_puestos_evaluados || 1;
    const avanceEvaluaciones = Math.min(100, (evaluaciones.length / metaEvaluaciones) * 100);

    return Math.round((avanceTiempo * 0.4 + avanceEvaluaciones * 0.6));
  }
};

export default nom036Service;
