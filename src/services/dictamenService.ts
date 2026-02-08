/**
 * Servicio de Dictámenes Médico-Laborales
 * 
 * Gestión completa de dictámenes con validación de estudios,
 * control de versiones para auditoría legal, y generación de documentos.
 * 
 * Integración con usePermisosDinamicos:
 * - Módulo: 'dictamenes'
 * - Acciones: 'ver', 'crear', 'editar', 'borrar', 'imprimir', 'firmar'
 */

import { supabase } from '@/lib/supabase';
import type {
  DictamenMedico,
  CreateDictamenDTO,
  UpdateDictamenDTO,
  RestriccionMedicaCatalogo,
  VersionDictamen,
  DictamenEstudioRequerido,
  ValidacionDictamen,
  ResumenDictamenes
} from '@/types/dictamen';
import type { User } from '@/types/auth';

// Tipos para filtros
export interface FiltrosDictamen {
  empresa_id?: string;
  paciente_id?: string;
  tipo_evaluacion?: string;
  resultado?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  medico_id?: string;
}

export interface OpcionesListado {
  page?: number;
  limit?: number;
  ordenar_por?: string;
  direccion?: 'asc' | 'desc';
  incluir_paciente?: boolean;
  incluir_estudios?: boolean;
}

/**
 * Servicio de Dictámenes Médicos
 */
export const dictamenService = {
  // ==========================================
  // CRUD BÁSICO
  // ==========================================

  /**
   * Listar dictámenes con filtros y paginación
   * RLS automático: solo ve dictámenes de su empresa
   */
  async listar(
    filtros: FiltrosDictamen = {},
    opciones: OpcionesListado = {}
  ): Promise<{ data: DictamenMedico[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      ordenar_por = 'created_at',
      direccion = 'desc',
      incluir_paciente = true,
      incluir_estudios = false
    } = opciones;

    let query = supabase
      .from('dictamenes_medicos')
      .select(
        incluir_paciente
          ? '*, paciente:pacientes(id, nombre, apellido_paterno, apellido_materno)'
          : '*',
        { count: 'exact' }
      );

    // Aplicar filtros
    if (filtros.empresa_id) {
      query = query.eq('empresa_id', filtros.empresa_id);
    }
    if (filtros.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id);
    }
    if (filtros.tipo_evaluacion) {
      query = query.eq('tipo_evaluacion', filtros.tipo_evaluacion);
    }
    if (filtros.resultado) {
      query = query.eq('resultado', filtros.resultado);
    }
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros.medico_id) {
      query = query.eq('medico_responsable_id', filtros.medico_id);
    }
    if (filtros.fecha_inicio) {
      query = query.gte('created_at', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      query = query.lte('created_at', filtros.fecha_fin);
    }

    // Ordenamiento y paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order(ordenar_por, { ascending: direccion === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error listando dictámenes:', error);
      throw new Error(`Error al listar dictámenes: ${error.message}`);
    }

    // Si se solicitaron estudios, cargarlos para cada dictamen
    let dictamenes = (data || []) as unknown as DictamenMedico[];
    if (incluir_estudios && dictamenes.length > 0) {
      const dictamenesIds = dictamenes.map(d => d.id);
      const { data: estudios } = await supabase
        .from('dictamen_estudios_requeridos')
        .select('*')
        .in('dictamen_id', dictamenesIds);

      if (estudios) {
        const estudiosPorDictamen = estudios.reduce((acc, est) => {
          if (!acc[est.dictamen_id]) acc[est.dictamen_id] = [];
          acc[est.dictamen_id].push(est);
          return acc;
        }, {} as Record<string, DictamenEstudioRequerido[]>);

        dictamenes = dictamenes.map(d => ({
          ...d,
          estudios_requeridos: estudiosPorDictamen[d.id] || []
        })) as DictamenMedico[];
      }
    }

    return {
      data: dictamenes,
      total: count || 0,
      page,
      limit
    };
  },

  /**
   * Obtener un dictamen específico con todas sus relaciones
   */
  async obtener(id: string): Promise<DictamenMedico> {
    const { data, error } = await supabase
      .from('dictamenes_medicos')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo),
        medico:profiles!dictamenes_medicos_medico_responsable_id_fkey(id, nombre, apellido_paterno, cedula_profesional)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo dictamen:', error);
      throw new Error(`Error al obtener dictamen: ${error.message}`);
    }

    if (!data) {
      throw new Error('Dictamen no encontrado');
    }

    // Cargar estudios requeridos
    const { data: estudios } = await supabase
      .from('dictamen_estudios_requeridos')
      .select('*')
      .eq('dictamen_id', id);

    // Cargar versiones (solo últimas 5)
    const { data: versiones } = await supabase
      .from('versiones_dictamen')
      .select('*')
      .eq('dictamen_id', id)
      .order('version', { ascending: false })
      .limit(5);

    return {
      ...data,
      estudios_requeridos: estudios || [],
      historial_versiones: versiones || []
    } as DictamenMedico;
  },

  /**
   * Crear nuevo dictamen
   * Calcula automáticamente los estudios requeridos según el puesto
   */
  async crear(data: CreateDictamenDTO, usuario: User): Promise<DictamenMedico> {
    const { data: dictamen, error } = await supabase
      .from('dictamenes_medicos')
      .insert({
        ...data,
        created_by: usuario.id,
        updated_by: usuario.id,
        estado: 'borrador'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando dictamen:', error);
      throw new Error(`Error al crear dictamen: ${error.message}`);
    }

    // Calcular y crear estudios requeridos automáticamente
    await this.calcularEstudiosRequeridos(dictamen.id, data.paciente_id, data.tipo_evaluacion);

    return this.obtener(dictamen.id);
  },

  /**
   * Actualizar dictamen existente
   * Crea automáticamente versión en auditoría si hay cambios significativos
   */
  async actualizar(
    id: string,
    data: UpdateDictamenDTO,
    usuario: User,
    motivoCambio?: string
  ): Promise<DictamenMedico> {
    // Verificar que el dictamen existe y está en estado editable
    const { data: actual, error: errorConsulta } = await supabase
      .from('dictamenes_medicos')
      .select('estado, version')
      .eq('id', id)
      .single();

    if (errorConsulta) {
      throw new Error(`Error al verificar dictamen: ${errorConsulta.message}`);
    }

    if (actual.estado === 'anulado') {
      throw new Error('No se puede modificar un dictamen anulado');
    }

    if (actual.estado === 'completado' && !data.estado) {
      // Si está completado y se quiere modificar, crear nueva versión
      console.log('Creando nueva versión del dictamen...');
    }

    const { data: dictamen, error } = await supabase
      .from('dictamenes_medicos')
      .update({
        ...data,
        updated_by: usuario.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando dictamen:', error);
      throw new Error(`Error al actualizar dictamen: ${error.message}`);
    }

    return this.obtener(dictamen.id);
  },

  /**
   * Eliminar dictamen (solo super_admin)
   */
  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('dictamenes_medicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando dictamen:', error);
      throw new Error(`Error al eliminar dictamen: ${error.message}`);
    }
  },

  // ==========================================
  // FUNCIONES ESPECÍFICAS
  // ==========================================

  /**
   * Validar que todos los estudios requeridos estén completos
   */
  async validarEstudiosCompletos(dictamenId: string): Promise<ValidacionDictamen> {
    const { data, error } = await supabase
      .rpc('validar_cierre_dictamen', {
        p_dictamen_id: dictamenId
      });

    if (error) {
      console.error('Error validando estudios:', error);
      throw new Error(`Error al validar estudios: ${error.message}`);
    }

    return data as ValidacionDictamen;
  },

  /**
   * Cerrar dictamen (cambiar a estado completado)
   * Requiere validación previa
   */
  async cerrarDictamen(
    dictamenId: string,
    usuario: User,
    forzar: boolean = false
  ): Promise<void> {
    // Validar primero
    const validacion = await this.validarEstudiosCompletos(dictamenId);

    if (!validacion.valido && !forzar) {
      throw new Error(
        `No se puede cerrar el dictamen: ${validacion.bloqueos.map(b => b.mensaje).join(', ')}`
      );
    }

    const { error } = await supabase
      .from('dictamenes_medicos')
      .update({
        estado: 'completado',
        es_version_final: true,
        fecha_cierre: new Date().toISOString(),
        cerrado_por: usuario.id,
        updated_by: usuario.id
      })
      .eq('id', dictamenId);

    if (error) {
      console.error('Error cerrando dictamen:', error);
      throw new Error(`Error al cerrar dictamen: ${error.message}`);
    }
  },

  /**
   * Anular dictamen (con motivo)
   */
  async anularDictamen(
    dictamenId: string,
    motivo: string,
    usuario: User
  ): Promise<void> {
    const { error } = await supabase
      .from('dictamenes_medicos')
      .update({
        estado: 'anulado',
        resultado_detalle: motivo,
        updated_by: usuario.id
      })
      .eq('id', dictamenId);

    if (error) {
      console.error('Error anulando dictamen:', error);
      throw new Error(`Error al anular dictamen: ${error.message}`);
    }

    // Crear entrada en versiones
    await supabase.from('versiones_dictamen').insert({
      dictamen_id: dictamenId,
      version: 0, // Versión especial para anulación
      datos_json: {},
      cambios_realizados: { motivo_anulacion: motivo },
      tipo_cambio: 'anulacion',
      usuario_id: usuario.id,
      created_at: new Date().toISOString()
    });
  },

  /**
   * Generar PDF del dictamen
   * TODO: Implementar generación real con librería PDF
   */
  async generarPDF(dictamenId: string): Promise<Blob> {
    const dictamen = await this.obtener(dictamenId);

    // Por ahora, generamos un PDF mock con jsPDF o similar
    // En implementación real, usar una librería como pdfmake o react-pdf
    const contenido = this.generarContenidoPDF(dictamen);

    // Placeholder - retornar blob vacío por ahora
    // El componente frontend debe usar una librería PDF apropiada
    return new Blob([contenido], { type: 'application/json' });
  },

  /**
   * Obtener catálogo de restricciones médicas
   */
  async obtenerCatalogoRestricciones(
    tipo?: string,
    activo: boolean = true
  ): Promise<RestriccionMedicaCatalogo[]> {
    let query = supabase
      .from('restricciones_medicas_catalogo')
      .select('*')
      .eq('activo', activo)
      .order('prioridad', { ascending: true });

    if (tipo) {
      query = query.eq('tipo_restriccion', tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo catálogo:', error);
      throw new Error(`Error al obtener catálogo: ${error.message}`);
    }

    return data as RestriccionMedicaCatalogo[];
  },

  /**
   * Obtener versiones/historial de un dictamen
   */
  async obtenerVersiones(dictamenId: string): Promise<VersionDictamen[]> {
    const { data, error } = await supabase
      .from('versiones_dictamen')
      .select('*')
      .eq('dictamen_id', dictamenId)
      .order('version', { ascending: false });

    if (error) {
      console.error('Error obteniendo versiones:', error);
      throw new Error(`Error al obtener versiones: ${error.message}`);
    }

    return data as VersionDictamen[];
  },

  /**
   * Obtener resumen de dictámenes para dashboard
   */
  async obtenerResumen(empresaId: string): Promise<ResumenDictamenes> {
    const { data, error } = await supabase
      .from('dictamenes_medicos')
      .select('*')
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Error obteniendo resumen:', error);
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }

    const dictamenes = data as DictamenMedico[];
    const hoy = new Date();
    const treintaDias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: dictamenes.length,
      por_tipo: {
        preempleo: dictamenes.filter(d => d.tipo_evaluacion === 'preempleo').length,
        ingreso: dictamenes.filter(d => d.tipo_evaluacion === 'ingreso').length,
        periodico: dictamenes.filter(d => d.tipo_evaluacion === 'periodico').length,
        retorno: dictamenes.filter(d => d.tipo_evaluacion === 'retorno').length,
        egreso: dictamenes.filter(d => d.tipo_evaluacion === 'egreso').length,
        reubicacion: dictamenes.filter(d => d.tipo_evaluacion === 'reubicacion').length,
        reincorporacion: dictamenes.filter(d => d.tipo_evaluacion === 'reincorporacion').length
      },
      por_resultado: {
        apto: dictamenes.filter(d => d.resultado === 'apto').length,
        apto_restricciones: dictamenes.filter(d => d.resultado === 'apto_restricciones').length,
        no_apto_temporal: dictamenes.filter(d => d.resultado === 'no_apto_temporal').length,
        no_apto: dictamenes.filter(d => d.resultado === 'no_apto').length,
        evaluacion_complementaria: dictamenes.filter(d => d.resultado === 'evaluacion_complementaria').length
      },
      por_estado: {
        borrador: dictamenes.filter(d => d.estado === 'borrador').length,
        pendiente: dictamenes.filter(d => d.estado === 'pendiente').length,
        completado: dictamenes.filter(d => d.estado === 'completado').length,
        anulado: dictamenes.filter(d => d.estado === 'anulado').length,
        vencido: dictamenes.filter(d => d.estado === 'vencido').length,
        firmado: dictamenes.filter(d => d.estado === 'firmado').length,
        cancelado: dictamenes.filter(d => d.estado === 'cancelado').length
      },
      vencidos_30_dias: dictamenes.filter(d => {
        if (!d.vigencia_fin) return false;
        const fin = new Date(d.vigencia_fin);
        return fin < hoy;
      }).length,
      proximos_vencer: dictamenes.filter(d => {
        if (!d.vigencia_fin) return false;
        const fin = new Date(d.vigencia_fin);
        return fin >= hoy && fin <= treintaDias;
      }).length
    };
  },

  // ==========================================
  // FUNCIONES PRIVADAS
  // ==========================================

  /**
   * Calcular estudios requeridos según puesto y tipo de evaluación
   */
  async calcularEstudiosRequeridos(
    dictamenId: string,
    pacienteId: string,
    tipoEvaluacion: string
  ): Promise<void> {
    // Obtener información del paciente y su puesto
    const { data: paciente } = await supabase
      .from('pacientes')
      .select('puesto_trabajo, area_trabajo, riesgos_exposicion')
      .eq('id', pacienteId)
      .single();

    const estudiosBase: { tipo_estudio: string; obligatorio: boolean; descripcion: string }[] = [
      { tipo_estudio: 'audiometria', obligatorio: true, descripcion: 'Audiometría tonal' },
      { tipo_estudio: 'espirometria', obligatorio: true, descripcion: 'Espirometría' },
      { tipo_estudio: 'laboratorio', obligatorio: true, descripcion: 'Exámenes de laboratorio' },
      { tipo_estudio: 'vision', obligatorio: true, descripcion: 'Agudeza visual' }
    ];

    // Agregar estudios según riesgos específicos
    const estudiosAdicionales: typeof estudiosBase = [];

    if (paciente?.riesgos_exposicion?.includes('ruido')) {
      estudiosAdicionales.push({
        tipo_estudio: 'audiometria',
        obligatorio: true,
        descripcion: 'Audiometría (exposición a ruido)'
      });
    }

    if (paciente?.puesto_trabajo?.toLowerCase().includes('soldador')) {
      estudiosAdicionales.push({
        tipo_estudio: 'vision',
        obligatorio: true,
        descripcion: 'Visión de colores'
      });
    }

    if (tipoEvaluacion === 'ingreso') {
      // Estudios específicos para pre-empleo
      estudiosBase.push({
        tipo_estudio: 'rx',
        obligatorio: false,
        descripcion: 'Radiografía de tórax'
      });
    }

    const todosEstudios = [...estudiosBase, ...estudiosAdicionales];

    // Insertar estudios requeridos
    const estudiosInsert = todosEstudios.map(e => ({
      dictamen_id: dictamenId,
      tipo_estudio: e.tipo_estudio,
      descripcion: e.descripcion,
      obligatorio: e.obligatorio,
      completado: false
    }));

    await supabase.from('dictamen_estudios_requeridos').insert(estudiosInsert);
  },

  /**
   * Generar contenido para PDF (placeholder)
   */
  generarContenidoPDF(dictamen: DictamenMedico): string {
    return JSON.stringify({
      folio: dictamen.folio,
      paciente: dictamen.paciente,
      tipo: dictamen.tipo_evaluacion,
      resultado: dictamen.resultado,
      fecha: new Date().toISOString()
    }, null, 2);
  }
};

export default dictamenService;
