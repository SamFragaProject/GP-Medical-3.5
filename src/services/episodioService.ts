// =====================================================
// SERVICIO: Motor de Flujos - Episodios de Atención
// GPMedical ERP Pro - Pipeline de Atención Médica
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
  EpisodioAtencion,
  EstadoEpisodio,
  CrearEpisodioDTO,
  TransicionEstadoDTO,
  AgregarBloqueoDTO,
  ColaTrabajo,
  TipoCola,
  TimelineEntry,
  Checkpoint,
  Bloqueo,
  AlertaSLA,
  TRANSICIONES_PERMITIDAS,
  ROLES_POR_TRANSICION,
  SLA_POR_TIPO,
  NextBestAction,
} from '@/types/episodio';

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Genera un ID único
 */
function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcula la duración en minutos entre dos timestamps
 */
function calcularDuracionMinutos(inicio: string, fin: string): number {
  const inicioMs = new Date(inicio).getTime();
  const finMs = new Date(fin).getTime();
  return Math.round((finMs - inicioMs) / (1000 * 60));
}

/**
 * Calcula el tiempo total transcurrido desde el inicio del episodio
 */
function calcularTiempoTotal(timeline: TimelineEntry[]): number {
  if (!timeline || timeline.length === 0) return 0;

  const inicio = new Date(timeline[0].timestamp_inicio).getTime();
  const ahora = Date.now();

  return Math.round((ahora - inicio) / (1000 * 60));
}

/**
 * Verifica si una transición es válida según la máquina de estados
 */
function esTransicionValida(estadoActual: EstadoEpisodio, nuevoEstado: EstadoEpisodio): boolean {
  const transicionesPermitidas = TRANSICIONES_PERMITIDAS[estadoActual];
  return transicionesPermitidas.includes(nuevoEstado);
}

/**
 * Verifica si el rol tiene permiso para la transición
 */
function tienePermisoTransicion(estadoActual: EstadoEpisodio, nuevoEstado: EstadoEpisodio, rol: string): boolean {
  const key = `${estadoActual}->${nuevoEstado}`;
  const rolesPermitidos = ROLES_POR_TRANSICION[key] || [];
  return rolesPermitidos.includes(rol) || rol === 'super_admin';
}

/**
 * Obtiene el SLA según el tipo de evaluación
 */
function obtenerSLA(tipo: string): number {
  return SLA_POR_TIPO[tipo as keyof typeof SLA_POR_TIPO] || 60;
}

/**
 * Determina el Next Best Action basado en el estado actual
 */
function calcularNextAction(estado: EstadoEpisodio, tipo: string): NextBestAction {
  const accionesPorEstado: Record<EstadoEpisodio, NextBestAction> = {
    'registro': {
      accion: 'iniciar_triage',
      descripcion: 'Realizar triage inicial del paciente',
      rol_responsable: 'enfermera',
      prioridad: 'media',
      tiempo_estimado_minutos: 10
    },
    'triage': {
      accion: 'evaluacion_medica',
      descripcion: 'Realizar evaluación médica completa',
      rol_responsable: 'medico',
      prioridad: 'alta',
      tiempo_estimado_minutos: 30
    },
    'evaluaciones': {
      accion: 'solicitar_estudios',
      descripcion: 'Determinar estudios necesarios',
      rol_responsable: 'medico',
      prioridad: 'media',
      tiempo_estimado_minutos: 5
    },
    'laboratorio': {
      accion: 'tomar_muestras',
      descripcion: 'Tomar muestras de laboratorio',
      rol_responsable: 'tecnico_laboratorio',
      prioridad: 'alta',
      tiempo_estimado_minutos: 15
    },
    'imagen': {
      accion: 'estudio_imagen',
      descripcion: 'Realizar estudio de imagenología',
      rol_responsable: 'tecnico_imagen',
      prioridad: 'alta',
      tiempo_estimado_minutos: 20
    },
    'audiometria': {
      accion: 'audiometria',
      descripcion: 'Realizar prueba de audiometría',
      rol_responsable: 'tecnico_audiometria',
      prioridad: 'media',
      tiempo_estimado_minutos: 15
    },
    'espirometria': {
      accion: 'espirometria',
      descripcion: 'Realizar prueba de espirometría',
      rol_responsable: 'tecnico_espirometria',
      prioridad: 'media',
      tiempo_estimado_minutos: 15
    },
    'dictamen': {
      accion: 'emitir_dictamen',
      descripcion: 'Emitir dictamen final de aptitud',
      rol_responsable: 'medico',
      prioridad: 'alta',
      tiempo_estimado_minutos: 10
    },
    'cerrado': {
      accion: 'entregar_documentos',
      descripcion: 'Entregar documentos al paciente',
      rol_responsable: 'recepcion',
      prioridad: 'baja',
      tiempo_estimado_minutos: 5
    }
  };

  return accionesPorEstado[estado] || {
    accion: 'esperar',
    descripcion: 'Esperar instrucciones',
    rol_responsable: 'medico',
    prioridad: 'baja',
    tiempo_estimado_minutos: 0
  };
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const episodioService = {

  // =====================================================
  // CRUD BÁSICO
  // =====================================================

  /**
   * Crea un nuevo episodio de atención
   */
  async crear(dto: CrearEpisodioDTO): Promise<EpisodioAtencion> {
    const now = new Date().toISOString();
    const slaMinutos = obtenerSLA(dto.tipo);

    // Crear timeline inicial
    const timelineEntry: TimelineEntry = {
      id: generarId(),
      estado: 'registro',
      timestamp_inicio: now,
      usuario_id: dto.creado_por,
      usuario_nombre: 'Sistema', // Se actualizará con el nombre real
      rol: 'recepcion',
      observaciones: dto.observaciones || 'Episodio creado',
    };

    const episodioData = {
      empresa_id: dto.empresa_id,
      sede_id: dto.sede_id,
      paciente_id: dto.paciente_id,
      campana_id: dto.campana_id || null,
      tipo: dto.tipo,
      estado_actual: 'registro' as EstadoEpisodio,
      estados_completados: ['registro'] as EstadoEpisodio[],
      timeline: [timelineEntry],
      sla_minutos: slaMinutos,
      sla_alerta_enviada: false,
      tiempo_total_minutos: 0,
      asignado_a: null,
      checkpoints: [] as Checkpoint[],
      bloqueos: [] as Bloqueo[],
      siguiente_accion: calcularNextAction('registro', dto.tipo),
      creado_por: dto.creado_por,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('episodios_atencion')
      .insert([episodioData])
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp, nss),
        empresa:empresas(id, nombre, logo_url),
        sede:sedes(id, nombre, direccion)
      `)
      .single();

    if (error) {
      console.error('Error creando episodio:', error);
      throw new Error(`Error al crear episodio: ${error.message}`);
    }

    return data as EpisodioAtencion;
  },

  /**
   * Obtiene un episodio por ID con todas sus relaciones
   */
  async obtener(id: string): Promise<EpisodioAtencion | null> {
    const { data, error } = await supabase
      .from('episodios_atencion')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp, nss),
        empresa:empresas(id, nombre, logo_url),
        sede:sedes(id, nombre, direccion)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as EpisodioAtencion;
  },

  /**
   * Lista episodios por empresa con filtros opcionales
   */
  async listarPorEmpresa(
    empresaId: string,
    filtros?: {
      estado?: EstadoEpisodio;
      tipo?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      sedeId?: string;
    }
  ): Promise<EpisodioAtencion[]> {
    let query = supabase
      .from('episodios_atencion')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp),
        empresa:empresas(id, nombre),
        sede:sedes(id, nombre)
      `)
      .eq('empresa_id', empresaId);

    if (filtros?.estado) {
      query = query.eq('estado_actual', filtros.estado);
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.sedeId) {
      query = query.eq('sede_id', filtros.sedeId);
    }

    if (filtros?.fechaDesde) {
      query = query.gte('created_at', filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      query = query.lte('created_at', filtros.fechaHasta);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error listando episodios:', error);
      throw error;
    }

    return (data || []) as EpisodioAtencion[];
  },

  /**
   * Lista episodios activos (no cerrados) por sede
   */
  async listarActivosPorSede(sedeId: string): Promise<EpisodioAtencion[]> {
    const { data, error } = await supabase
      .from('episodios_atencion')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp),
        empresa:empresas(id, nombre, logo_url)
      `)
      .eq('sede_id', sedeId)
      .neq('estado_actual', 'cerrado')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error listando episodios activos:', error);
      throw error;
    }

    return (data || []) as EpisodioAtencion[];
  },

  // =====================================================
  // TRANSICIONES DE ESTADO (CORE)
  // =====================================================

  /**
   * Transiciona un episodio de un estado a otro
   * VALIDA: Máquina de estados, permisos de rol, bloqueos activos
   */
  async transicionar(
    episodioId: string,
    nuevoEstado: EstadoEpisodio,
    data: TransicionEstadoDTO
  ): Promise<EpisodioAtencion> {
    // 1. Obtener episodio actual
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    // 2. Validar máquina de estados
    if (!esTransicionValida(episodio.estado_actual, nuevoEstado)) {
      throw new Error(
        `Transición no permitida: ${episodio.estado_actual} -> ${nuevoEstado}`
      );
    }

    // 3. Validar permisos por rol
    if (!tienePermisoTransicion(episodio.estado_actual, nuevoEstado, data.rol)) {
      throw new Error(
        `El rol '${data.rol}' no tiene permiso para realizar esta transición`
      );
    }

    // 4. Verificar bloqueos activos
    const bloqueosActivos = episodio.bloqueos?.filter(b => !b.resuelto) || [];
    if (bloqueosActivos.length > 0) {
      throw new Error(
        `No se puede transicionar: Hay ${bloqueosActivos.length} bloqueo(s) activo(s)`
      );
    }

    const now = new Date().toISOString();

    // 5. Actualizar timeline - cerrar entrada anterior
    const timelineActualizado = [...(episodio.timeline || [])];
    const entradaActual = timelineActualizado.find(
      t => t.estado === episodio.estado_actual && !t.timestamp_fin
    );

    if (entradaActual) {
      entradaActual.timestamp_fin = now;
      entradaActual.duracion_minutos = calcularDuracionMinutos(
        entradaActual.timestamp_inicio,
        now
      );
    }

    // 6. Agregar nueva entrada al timeline
    const nuevaEntrada: TimelineEntry = {
      id: generarId(),
      estado: nuevoEstado,
      timestamp_inicio: now,
      usuario_id: data.usuario_id,
      usuario_nombre: data.usuario_nombre,
      rol: data.rol,
      observaciones: data.observaciones,
    };
    timelineActualizado.push(nuevaEntrada);

    // 7. Actualizar estados completados
    const estadosCompletados = [...(episodio.estados_completados || [])];
    if (!estadosCompletados.includes(nuevoEstado)) {
      estadosCompletados.push(nuevoEstado);
    }

    // 8. Calcular tiempo total
    const tiempoTotal = calcularTiempoTotal(timelineActualizado);

    // 9. Calcular Next Best Action
    const siguienteAccion = calcularNextAction(nuevoEstado, episodio.tipo);

    // 10. Actualizar en base de datos
    const { data: dataActualizada, error } = await supabase
      .from('episodios_atencion')
      .update({
        estado_actual: nuevoEstado,
        estados_completados: estadosCompletados,
        timeline: timelineActualizado,
        tiempo_total_minutos: tiempoTotal,
        siguiente_accion: siguienteAccion,
        updated_at: now,
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp, nss),
        empresa:empresas(id, nombre, logo_url),
        sede:sedes(id, nombre, direccion)
      `)
      .single();

    if (error) {
      console.error('Error transicionando episodio:', error);
      throw new Error(`Error al transicionar episodio: ${error.message}`);
    }

    return dataActualizada as EpisodioAtencion;
  },

  // =====================================================
  // BLOQUEOS
  // =====================================================

  /**
   * Agrega un bloqueo al episodio
   */
  async agregarBloqueo(
    episodioId: string,
    bloqueo: AgregarBloqueoDTO
  ): Promise<EpisodioAtencion> {
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    const nuevoBloqueo: Bloqueo = {
      id: generarId(),
      tipo: bloqueo.tipo,
      descripcion: bloqueo.descripcion,
      resuelto: false,
      creado_en: new Date().toISOString(),
    };

    const bloqueosActualizados = [...(episodio.bloqueos || []), nuevoBloqueo];

    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        bloqueos: bloqueosActualizados,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  /**
   * Resuelve un bloqueo del episodio
   */
  async resolverBloqueo(
    episodioId: string,
    bloqueoId: string,
    usuarioId: string
  ): Promise<EpisodioAtencion> {
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    const bloqueosActualizados = (episodio.bloqueos || []).map(b =>
      b.id === bloqueoId
        ? {
            ...b,
            resuelto: true,
            resuelto_por: usuarioId,
            resuelto_en: new Date().toISOString(),
          }
        : b
    );

    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        bloqueos: bloqueosActualizados,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  // =====================================================
  // CHECK-IN / CHECK-OUT
  // =====================================================

  /**
   * Registra check-in en un área
   */
  async checkIn(
    episodioId: string,
    area: string,
    usuarioId: string
  ): Promise<EpisodioAtencion> {
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    const now = new Date().toISOString();

    // Buscar checkpoint existente o crear nuevo
    const checkpoints = [...(episodio.checkpoints || [])];
    const existingCheckpoint = checkpoints.find(c => c.area === area);

    if (existingCheckpoint) {
      existingCheckpoint.check_in = now;
      existingCheckpoint.atendido_por = usuarioId;
    } else {
      checkpoints.push({
        area,
        check_in: now,
        atendido_por: usuarioId,
      });
    }

    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        checkpoints,
        updated_at: now,
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  /**
   * Registra check-out de un área
   */
  async checkOut(
    episodioId: string,
    area: string,
    usuarioId: string
  ): Promise<EpisodioAtencion> {
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    const now = new Date().toISOString();

    const checkpoints = [...(episodio.checkpoints || [])];
    const checkpoint = checkpoints.find(c => c.area === area);

    if (checkpoint) {
      checkpoint.check_out = now;
    }

    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        checkpoints,
        updated_at: now,
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  // =====================================================
  // COLAS DE TRABAJO
  // =====================================================

  /**
   * Obtiene la cola de trabajo para un tipo específico
   */
  async obtenerCola(sedeId: string, tipo: TipoCola): Promise<ColaTrabajo> {
    // Mapeo de tipos de cola a estados
    const estadoPorCola: Record<TipoCola, EstadoEpisodio | null> = {
      'recepcion': 'registro',
      'triage': 'triage',
      'consulta': 'evaluaciones',
      'laboratorio': 'laboratorio',
      'imagen': 'imagen',
      'audiometria': 'audiometria',
      'espirometria': 'espirometria',
      'dictamen': 'dictamen',
    };

    const estado = estadoPorCola[tipo];

    // Obtener episodios en este estado
    let query = supabase
      .from('episodios_atencion')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url, curp)
      `)
      .eq('sede_id', sedeId);

    if (estado) {
      query = query.eq('estado_actual', estado);
    }

    const { data: episodios, error } = await query
      .neq('estado_actual', 'cerrado')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo cola:', error);
      throw error;
    }

    // Transformar a formato de cola
    const ahora = Date.now();
    const pacientes = (episodios || []).map(ep => {
      const creadoEn = new Date(ep.created_at).getTime();
      const tiempoEspera = Math.round((ahora - creadoEn) / (1000 * 60));
      const slaRestante = ep.sla_minutos - tiempoEspera;

      return {
        episodio_id: ep.id,
        paciente: {
          id: ep.paciente?.id || ep.paciente_id,
          nombre: ep.paciente?.nombre || 'Desconocido',
          apellido_paterno: ep.paciente?.apellido_paterno || '',
          apellido_materno: ep.paciente?.apellido_materno || '',
          foto_url: ep.paciente?.foto_url,
          curp: ep.paciente?.curp,
        },
        prioridad: 3, // TODO: Implementar cálculo de prioridad
        tiempo_espera_minutos: tiempoEspera,
        estado: ep.asignado_a ? 'en_atencion' : 'esperando',
        asignado_a: ep.asignado_a,
        tipo_evaluacion: ep.tipo,
        empresa_nombre: ep.empresa?.nombre || '',
        estado_actual: ep.estado_actual,
        sla_restante_minutos: slaRestante,
        alerta_sla: slaRestante < 0,
      };
    });

    // Calcular estadísticas
    const stats = {
      atendidos: pacientes.filter(p => p.estado === 'en_atencion').length,
      en_espera: pacientes.filter(p => p.estado === 'esperando').length,
      en_atencion: pacientes.filter(p => p.estado === 'en_atencion').length,
      tiempo_promedio_espera: pacientes.length > 0
        ? Math.round(pacientes.reduce((sum, p) => sum + p.tiempo_espera_minutos, 0) / pacientes.length)
        : 0,
      tiempo_promedio_atencion: 0, // TODO: Calcular de timeline
      alertas_sla: pacientes.filter(p => p.alerta_sla).length,
    };

    return {
      sede_id: sedeId,
      tipo,
      pacientes,
      estadisticas_hoy: stats,
    };
  },

  /**
   * Asigna el siguiente paciente en la cola al usuario
   */
  async llamarSiguiente(
    sedeId: string,
    tipo: TipoCola,
    usuarioId: string,
    usuarioNombre: string,
    rol: string
  ): Promise<EpisodioAtencion | null> {
    const cola = await this.obtenerCola(sedeId, tipo);

    // Filtrar pacientes esperando, ordenados por prioridad y tiempo
    const esperando = cola.pacientes
      .filter(p => p.estado === 'esperando')
      .sort((a, b) => {
        // Primero por prioridad (mayor primero)
        if (b.prioridad !== a.prioridad) {
          return b.prioridad - a.prioridad;
        }
        // Luego por tiempo de espera (mayor primero)
        return b.tiempo_espera_minutos - a.tiempo_espera_minutos;
      });

    if (esperando.length === 0) {
      return null;
    }

    const siguiente = esperando[0];

    // Actualizar asignación
    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        asignado_a: {
          usuario_id: usuarioId,
          nombre: usuarioNombre,
          rol: rol,
          asignado_en: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', siguiente.episodio_id)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  /**
   * Libera la asignación de un episodio
   */
  async liberarAsignacion(episodioId: string): Promise<EpisodioAtencion> {
    const { data, error } = await supabase
      .from('episodios_atencion')
      .update({
        asignado_a: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodioId)
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as EpisodioAtencion;
  },

  // =====================================================
  // SLA Y ALERTAS
  // =====================================================

  /**
   * Verifica episodios que han excedido el SLA
   */
  async verificarSLAs(): Promise<AlertaSLA[]> {
    const { data, error } = await supabase
      .from('episodios_atencion')
      .select(`
        id,
        estado_actual,
        sla_minutos,
        timeline,
        paciente:pacientes(nombre, apellido_paterno)
      `)
      .neq('estado_actual', 'cerrado')
      .eq('sla_alerta_enviada', false);

    if (error) {
      console.error('Error verificando SLAs:', error);
      throw error;
    }

    const alertas: AlertaSLA[] = [];
    const ahora = Date.now();

    for (const ep of data || []) {
      if (!ep.timeline || ep.timeline.length === 0) continue;

      const inicio = new Date(ep.timeline[0].timestamp_inicio).getTime();
      const tiempoTranscurrido = Math.round((ahora - inicio) / (1000 * 60));

      if (tiempoTranscurrido > ep.sla_minutos) {
        alertas.push({
          episodio_id: ep.id,
          paciente_nombre: `${ep.paciente?.nombre || ''} ${ep.paciente?.apellido_paterno || ''}`.trim(),
          estado_actual: ep.estado_actual,
          tiempo_transcurrido: tiempoTranscurrido,
          sla_minutos: ep.sla_minutos,
          tiempo_restante: ep.sla_minutos - tiempoTranscurrido,
          prioridad: 1,
        });

        // Marcar alerta como enviada
        await supabase
          .from('episodios_atencion')
          .update({ sla_alerta_enviada: true })
          .eq('id', ep.id);
      }
    }

    return alertas;
  },

  /**
   * Obtiene estadísticas del pipeline para una sede
   */
  async obtenerStats(sedeId: string, fecha?: string): Promise<{
    total_hoy: number;
    por_estado: Record<string, number>;
    tiempo_promedio: number;
    alertas_sla: number;
  }> {
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('episodios_atencion')
      .select('estado_actual, tiempo_total_minutos, sla_alerta_enviada')
      .eq('sede_id', sedeId)
      .gte('created_at', `${fechaFiltro}T00:00:00`)
      .lte('created_at', `${fechaFiltro}T23:59:59`);

    if (error) {
      console.error('Error obteniendo stats:', error);
      throw error;
    }

    const episodios = data || [];
    const porEstado: Record<string, number> = {};

    for (const ep of episodios) {
      porEstado[ep.estado_actual] = (porEstado[ep.estado_actual] || 0) + 1;
    }

    const tiempoPromedio = episodios.length > 0
      ? Math.round(episodios.reduce((sum, ep) => sum + (ep.tiempo_total_minutos || 0), 0) / episodios.length)
      : 0;

    return {
      total_hoy: episodios.length,
      por_estado: porEstado,
      tiempo_promedio: tiempoPromedio,
      alertas_sla: episodios.filter(ep => ep.sla_alerta_enviada).length,
    };
  },

  // =====================================================
  // NEXT BEST ACTION
  // =====================================================

  /**
   * Calcula y actualiza la siguiente acción recomendada
   */
  async calcularNextAction(episodioId: string): Promise<NextBestAction> {
    const episodio = await this.obtener(episodioId);
    if (!episodio) {
      throw new Error('Episodio no encontrado');
    }

    const nextAction = calcularNextAction(episodio.estado_actual, episodio.tipo);

    await supabase
      .from('episodios_atencion')
      .update({
        siguiente_accion: nextAction,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodioId);

    return nextAction;
  },
};

// Exportar funciones auxiliares para testing
export const _helpers = {
  esTransicionValida,
  tienePermisoTransicion,
  calcularDuracionMinutos,
  obtenerSLA,
  calcularNextAction,
};
