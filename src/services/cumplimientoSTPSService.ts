// =====================================================
// SERVICIO: Cumplimiento Legal STPS — GPMedical ERP 3.5
// Consultas para módulo de cumplimiento normativo
// =====================================================

import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────

export interface ProgramaSTPS {
    id: string;
    empresa_id: string;
    codigo_norma: string;
    nombre: string;
    descripcion?: string;
    anio_programa: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: 'borrador' | 'activo' | 'vencido' | 'renovado' | 'suspendido';
    responsable_id?: string;
    medico_responsable_id?: string;
    objetivos: any[];
    alcance?: string;
    total_trabajadores_alcance: number;
    actividades: any[];
    porcentaje_cumplimiento: number;
    ultima_actualizacion?: string;
    archivo_programa_url?: string;
    created_at: string;
    // Joins
    responsable?: { nombre: string; apellido_paterno: string };
    medico?: { nombre: string; apellido_paterno: string };
    _trabajadores_inscritos?: number;
    _trabajadores_cumplidos?: number;
}

export interface DesviacionSTPS {
    id: string;
    empresa_id: string;
    programa_id?: string;
    folio: string;
    codigo_norma: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    severidad: 'menor' | 'mayor' | 'critica';
    estado: 'abierta' | 'en_proceso' | 'accion_tomada' | 'verificada' | 'cerrada' | 'escalada';
    fecha_deteccion: string;
    fecha_compromiso?: string;
    fecha_correccion?: string;
    fecha_cierre?: string;
    causa_raiz?: string;
    accion_correctiva?: string;
    accion_preventiva?: string;
    responsable_accion?: string;
    trabajadores_afectados: number;
    area_afectada?: string;
    notas_seguimiento: any[];
    created_at: string;
    // Joins
    programa?: { nombre: string; codigo_norma: string };
    responsable?: { nombre: string; apellido_paterno: string };
}

export interface AuditoriaSTPS {
    id: string;
    empresa_id: string;
    folio: string;
    tipo: string;
    titulo: string;
    descripcion?: string;
    normas_auditadas: string[];
    fecha_inicio: string;
    fecha_fin?: string;
    auditor_nombre?: string;
    auditor_institucion?: string;
    numero_acta?: string;
    resultado: string;
    hallazgos_totales: number;
    hallazgos_criticos: number;
    hallazgos_mayores: number;
    hallazgos_menores: number;
    monto_sancion: number;
    proxima_auditoria?: string;
    created_at: string;
}

export interface ResponsableSTPS {
    id: string;
    empresa_id: string;
    profile_id?: string;
    nombre_completo: string;
    cargo: string;
    especialidad?: string;
    cedula_profesional?: string;
    cedula_especialidad?: string;
    tipo: string;
    normas_competentes: string[];
    activo: boolean;
    fecha_alta: string;
    email?: string;
    telefono?: string;
    firma_digital?: string;
}

export interface KPICumplimiento {
    programasActivos: number;
    programasVencidos: number;
    cumplimientoPromedio: number;
    desviacionesAbiertas: number;
    desviacionesCriticas: number;
    evidenciasTotal: number;
    evidenciasPendientes: number;
    auditoriasPendientes: number;
    proximaAuditoria?: string;
    responsablesActivos: number;
}

// ─────────────────────────────────────────────────────
// SERVICIO
// ─────────────────────────────────────────────────────

export const cumplimientoSTPSService = {

    // ── KPIs globales de cumplimiento ──
    async obtenerKPIs(empresa_id?: string): Promise<KPICumplimiento> {
        try {
            const filtroEmpresa = (q: any, field = 'empresa_id') =>
                empresa_id ? q.eq(field, empresa_id) : q;

            const [
                { count: progActivos },
                { count: progVencidos },
                { data: progData },
                { count: desvAbiertas },
                { count: desvCriticas },
                { count: evidTotal },
                { count: evidPend },
                { data: audData },
                { count: respActivos }
            ] = await Promise.all([
                filtroEmpresa(supabase.from('programas_stps').select('id', { count: 'exact', head: true }))
                    .eq('estado', 'activo'),
                filtroEmpresa(supabase.from('programas_stps').select('id', { count: 'exact', head: true }))
                    .eq('estado', 'vencido'),
                filtroEmpresa(supabase.from('programas_stps').select('porcentaje_cumplimiento'))
                    .eq('estado', 'activo'),
                filtroEmpresa(supabase.from('desviaciones_stps').select('id', { count: 'exact', head: true }))
                    .in('estado', ['abierta', 'en_proceso', 'escalada']),
                filtroEmpresa(supabase.from('desviaciones_stps').select('id', { count: 'exact', head: true }))
                    .eq('severidad', 'critica').in('estado', ['abierta', 'en_proceso', 'escalada']),
                filtroEmpresa(supabase.from('evidencias_stps').select('id', { count: 'exact', head: true })),
                filtroEmpresa(supabase.from('evidencias_stps').select('id', { count: 'exact', head: true }))
                    .eq('validado', false),
                filtroEmpresa(supabase.from('bitacora_auditoria_stps').select('fecha_inicio, proxima_auditoria'))
                    .eq('resultado', 'en_proceso'),
                filtroEmpresa(supabase.from('responsables_stps').select('id', { count: 'exact', head: true }))
                    .eq('activo', true),
            ]);

            const cumplimientos = progData?.map(p => p.porcentaje_cumplimiento || 0) || [];
            const cumplimientoPromedio = cumplimientos.length > 0
                ? Math.round(cumplimientos.reduce((a, b) => a + b, 0) / cumplimientos.length)
                : 0;

            // Próxima auditoría
            const proximas = audData
                ?.filter(a => a.proxima_auditoria)
                .map(a => a.proxima_auditoria)
                .sort() || [];

            return {
                programasActivos: progActivos || 0,
                programasVencidos: progVencidos || 0,
                cumplimientoPromedio,
                desviacionesAbiertas: desvAbiertas || 0,
                desviacionesCriticas: desvCriticas || 0,
                evidenciasTotal: evidTotal || 0,
                evidenciasPendientes: evidPend || 0,
                auditoriasPendientes: audData?.length || 0,
                proximaAuditoria: proximas[0] || undefined,
                responsablesActivos: respActivos || 0,
            };
        } catch (err) {
            console.error('Error obteniendo KPIs cumplimiento:', err);
            return {
                programasActivos: 0, programasVencidos: 0, cumplimientoPromedio: 0,
                desviacionesAbiertas: 0, desviacionesCriticas: 0, evidenciasTotal: 0,
                evidenciasPendientes: 0, auditoriasPendientes: 0, responsablesActivos: 0,
            };
        }
    },

    // ── Programas STPS ──
    async listarProgramas(empresa_id?: string): Promise<ProgramaSTPS[]> {
        let query = supabase
            .from('programas_stps')
            .select(`
                *,
                responsable:profiles!programas_stps_responsable_id_fkey(nombre, apellido_paterno),
                medico:profiles!programas_stps_medico_responsable_id_fkey(nombre, apellido_paterno)
            `)
            .order('anio_programa', { ascending: false })
            .order('codigo_norma');

        if (empresa_id) query = query.eq('empresa_id', empresa_id);

        const { data, error } = await query;
        if (error) console.error('Error listando programas:', error);
        return (data || []) as ProgramaSTPS[];
    },

    async crearPrograma(programa: Partial<ProgramaSTPS>): Promise<ProgramaSTPS | null> {
        const { data, error } = await supabase
            .from('programas_stps')
            .insert(programa)
            .select()
            .single();
        if (error) console.error('Error creando programa:', error);
        return data as ProgramaSTPS | null;
    },

    async actualizarPrograma(id: string, cambios: Partial<ProgramaSTPS>): Promise<boolean> {
        const { error } = await supabase
            .from('programas_stps')
            .update({ ...cambios, ultima_actualizacion: new Date().toISOString().split('T')[0] })
            .eq('id', id);
        return !error;
    },

    // ── Desviaciones ──
    async listarDesviaciones(empresa_id?: string, estado?: string): Promise<DesviacionSTPS[]> {
        let query = supabase
            .from('desviaciones_stps')
            .select(`
                *,
                programa:programas_stps(nombre, codigo_norma),
                responsable:profiles!desviaciones_stps_responsable_accion_fkey(nombre, apellido_paterno)
            `)
            .order('fecha_deteccion', { ascending: false });

        if (empresa_id) query = query.eq('empresa_id', empresa_id);
        if (estado && estado !== 'all') query = query.eq('estado', estado);

        const { data, error } = await query.limit(50);
        if (error) console.error('Error listando desviaciones:', error);
        return (data || []) as DesviacionSTPS[];
    },

    async crearDesviacion(desviacion: Partial<DesviacionSTPS>): Promise<DesviacionSTPS | null> {
        const { data, error } = await supabase
            .from('desviaciones_stps')
            .insert(desviacion)
            .select()
            .single();
        if (error) console.error('Error creando desviación:', error);
        return data as DesviacionSTPS | null;
    },

    async actualizarDesviacion(id: string, cambios: Partial<DesviacionSTPS>): Promise<boolean> {
        const { error } = await supabase
            .from('desviaciones_stps')
            .update(cambios)
            .eq('id', id);
        return !error;
    },

    async agregarNotaSeguimiento(id: string, nota: string, autor: string): Promise<boolean> {
        const { data } = await supabase
            .from('desviaciones_stps')
            .select('notas_seguimiento')
            .eq('id', id)
            .single();

        const notas = [
            ...(data?.notas_seguimiento || []),
            { fecha: new Date().toISOString(), nota, autor }
        ];

        const { error } = await supabase
            .from('desviaciones_stps')
            .update({ notas_seguimiento: notas })
            .eq('id', id);
        return !error;
    },

    // ── Bitácora de Auditoría ──
    async listarAuditorias(empresa_id?: string): Promise<AuditoriaSTPS[]> {
        let query = supabase
            .from('bitacora_auditoria_stps')
            .select('*')
            .order('fecha_inicio', { ascending: false });

        if (empresa_id) query = query.eq('empresa_id', empresa_id);

        const { data, error } = await query.limit(30);
        if (error) console.error('Error listando auditorías:', error);
        return (data || []) as AuditoriaSTPS[];
    },

    async crearAuditoria(auditoria: Partial<AuditoriaSTPS>): Promise<AuditoriaSTPS | null> {
        const { data, error } = await supabase
            .from('bitacora_auditoria_stps')
            .insert(auditoria)
            .select()
            .single();
        if (error) console.error('Error creando auditoría:', error);
        return data as AuditoriaSTPS | null;
    },

    async actualizarAuditoria(id: string, cambios: Partial<AuditoriaSTPS>): Promise<boolean> {
        const { error } = await supabase
            .from('bitacora_auditoria_stps')
            .update(cambios)
            .eq('id', id);
        return !error;
    },

    // ── Responsables ──
    async listarResponsables(empresa_id?: string): Promise<ResponsableSTPS[]> {
        let query = supabase
            .from('responsables_stps')
            .select('*')
            .order('nombre_completo');

        if (empresa_id) query = query.eq('empresa_id', empresa_id);

        const { data, error } = await query;
        if (error) console.error('Error listando responsables:', error);
        return (data || []) as ResponsableSTPS[];
    },

    async crearResponsable(resp: Partial<ResponsableSTPS>): Promise<ResponsableSTPS | null> {
        const { data, error } = await supabase
            .from('responsables_stps')
            .insert(resp)
            .select()
            .single();
        if (error) console.error('Error creando responsable:', error);
        return data as ResponsableSTPS | null;
    },

    async actualizarResponsable(id: string, cambios: Partial<ResponsableSTPS>): Promise<boolean> {
        const { error } = await supabase
            .from('responsables_stps')
            .update(cambios)
            .eq('id', id);
        return !error;
    },
};

export default cumplimientoSTPSService;
