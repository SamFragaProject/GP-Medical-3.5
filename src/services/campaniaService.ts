// =====================================================
// SERVICIO: Campañas Masivas - GPMedical ERP Pro
// =====================================================
// Gestión de campañas de evaluación médica por empresa:
// - Alta de campañas (preempleo, periódico, retorno, egreso)
// - Carga masiva de padrón (Excel/CSV)
// - Seguimiento por estatus
// - Métricas por campaña
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
    Campania,
    TrabajadorPadron,
    CrearCampaniaDTO,
    ActualizarCampaniaDTO,
    ImportarPadronDTO,
    MetricasCampania,
    FiltrosCampania,
    FiltrosTrabajadorPadron,
    EstadoCampania,
    EstadoTrabajadorCampania,
    SERVICIOS_DISPONIBLES,
} from '@/types/campania';

// =====================================================
// HELPERS
// =====================================================

function calcularMetricas(trabajadores: TrabajadorPadron[]): MetricasCampania {
    const total = trabajadores.length;
    const pendientes = trabajadores.filter(t => t.estado === 'pendiente').length;
    const en_proceso = trabajadores.filter(t => ['citado', 'en_proceso'].includes(t.estado)).length;
    const evaluados = trabajadores.filter(t => t.estado === 'evaluado').length;
    const dictaminados = trabajadores.filter(t => t.estado === 'dictaminado').length;
    const cerrados = trabajadores.filter(t => t.estado === 'cerrado').length;
    const no_presentados = trabajadores.filter(t => t.estado === 'no_presentado').length;

    const aptos = trabajadores.filter(t => t.dictamen_resultado === 'apto').length;
    const aptos_restricciones = trabajadores.filter(t => t.dictamen_resultado === 'apto_restricciones').length;
    const no_aptos_temporales = trabajadores.filter(t => t.dictamen_resultado === 'no_apto_temporal').length;
    const no_aptos_definitivos = trabajadores.filter(t => t.dictamen_resultado === 'no_apto_definitivo').length;
    const sin_dictamen = total - aptos - aptos_restricciones - no_aptos_temporales - no_aptos_definitivos;

    const terminados = evaluados + dictaminados + cerrados;
    const porcentaje_avance = total > 0 ? Math.round((terminados / total) * 100) : 0;
    const con_dictamen = aptos + aptos_restricciones + no_aptos_temporales + no_aptos_definitivos;
    const porcentaje_aptos = con_dictamen > 0 ? Math.round((aptos / con_dictamen) * 100) : 0;

    return {
        total, pendientes, en_proceso, evaluados, dictaminados, cerrados, no_presentados,
        aptos, aptos_restricciones, no_aptos_temporales, no_aptos_definitivos, sin_dictamen,
        porcentaje_avance, porcentaje_aptos,
    };
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const campaniaService = {

    // =====================================================
    // CRUD DE CAMPAÑAS
    // =====================================================

    async listar(filtros: FiltrosCampania = {}): Promise<Campania[]> {
        let query = supabase
            .from('campanias')
            .select(`
        *,
        empresa:empresas(id, nombre, rfc),
        sede:sedes(id, nombre)
      `)
            .order('created_at', { ascending: false });

        if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
        if (filtros.estado) query = query.eq('estado', filtros.estado);
        if (filtros.fecha_desde) query = query.gte('fecha_inicio', filtros.fecha_desde);
        if (filtros.fecha_hasta) query = query.lte('fecha_inicio', filtros.fecha_hasta);
        if (filtros.search) {
            query = query.ilike('nombre', `%${filtros.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error listando campañas: ${error.message}`);
        return data || [];
    },

    async obtener(id: string): Promise<Campania | null> {
        const { data, error } = await supabase
            .from('campanias')
            .select(`
        *,
        empresa:empresas(id, nombre, rfc),
        sede:sedes(id, nombre)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error obteniendo campaña: ${error.message}`);
        }
        return data;
    },

    async crear(dto: CrearCampaniaDTO): Promise<Campania> {
        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('campanias')
            .insert({
                empresa_id: dto.empresa_id,
                sede_id: dto.sede_id,
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                tipo: dto.tipo,
                estado: 'borrador' as EstadoCampania,
                fecha_inicio: dto.fecha_inicio,
                fecha_fin_estimada: dto.fecha_fin_estimada,
                servicios: dto.servicios,
                contacto_nombre: dto.contacto_nombre,
                contacto_email: dto.contacto_email,
                contacto_telefono: dto.contacto_telefono,
                precio_por_trabajador: dto.precio_por_trabajador,
                total_trabajadores: 0,
                total_evaluados: 0,
                total_aptos: 0,
                total_restricciones: 0,
                total_no_aptos: 0,
                total_pendientes: 0,
                creado_por: userData.user?.id || '',
            })
            .select()
            .single();

        if (error) throw new Error(`Error creando campaña: ${error.message}`);
        return data;
    },

    async actualizar(id: string, dto: ActualizarCampaniaDTO): Promise<Campania> {
        const { data, error } = await supabase
            .from('campanias')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Error actualizando campaña: ${error.message}`);
        return data;
    },

    async cambiarEstado(id: string, nuevoEstado: EstadoCampania): Promise<void> {
        const updates: Partial<Campania> = { estado: nuevoEstado };

        if (nuevoEstado === 'completada') {
            updates.fecha_fin_real = new Date().toISOString().split('T')[0];
        }

        const { error } = await supabase
            .from('campanias')
            .update(updates)
            .eq('id', id);

        if (error) throw new Error(`Error cambiando estado: ${error.message}`);
    },

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase
            .from('campanias')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Error eliminando campaña: ${error.message}`);
    },

    // =====================================================
    // PADRÓN DE TRABAJADORES
    // =====================================================

    async obtenerPadron(
        campaniaId: string,
        filtros: FiltrosTrabajadorPadron = {}
    ): Promise<TrabajadorPadron[]> {
        let query = supabase
            .from('padron_campania')
            .select('*')
            .eq('campania_id', campaniaId)
            .order('apellido_paterno', { ascending: true });

        if (filtros.estado) query = query.eq('estado', filtros.estado);
        if (filtros.dictamen_resultado) query = query.eq('dictamen_resultado', filtros.dictamen_resultado);
        if (filtros.area) query = query.eq('area', filtros.area);
        if (filtros.puesto) query = query.eq('puesto', filtros.puesto);
        if (filtros.search) {
            query = query.or(
                `nombre.ilike.%${filtros.search}%,apellido_paterno.ilike.%${filtros.search}%,numero_empleado.ilike.%${filtros.search}%,curp.ilike.%${filtros.search}%`
            );
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error obteniendo padrón: ${error.message}`);
        return data || [];
    },

    async importarPadron(dto: ImportarPadronDTO): Promise<{ insertados: number; errores: string[] }> {
        const errores: string[] = [];
        let insertados = 0;

        // Validar datos mínimos
        for (let i = 0; i < dto.trabajadores.length; i++) {
            const t = dto.trabajadores[i];
            if (!t.nombre || !t.apellido_paterno) {
                errores.push(`Fila ${i + 1}: Nombre y Apellido Paterno son obligatorios`);
            }
        }

        if (errores.length > 0) return { insertados: 0, errores };

        // Insertar en lotes de 50
        const lotes = [];
        for (let i = 0; i < dto.trabajadores.length; i += 50) {
            lotes.push(dto.trabajadores.slice(i, i + 50));
        }

        for (const lote of lotes) {
            const registros = lote.map(t => ({
                campania_id: dto.campania_id,
                nombre: t.nombre,
                apellido_paterno: t.apellido_paterno,
                apellido_materno: t.apellido_materno || null,
                numero_empleado: t.numero_empleado || null,
                curp: t.curp || null,
                nss: t.nss || null,
                fecha_nacimiento: t.fecha_nacimiento || null,
                genero: t.genero || null,
                puesto: t.puesto || null,
                area: t.area || null,
                antiguedad_anios: t.antiguedad_anios || null,
                riesgo: t.riesgo || null,
                estado: 'pendiente' as EstadoTrabajadorCampania,
            }));

            const { error, count } = await supabase
                .from('padron_campania')
                .insert(registros);

            if (error) {
                errores.push(`Error insertando lote: ${error.message}`);
            } else {
                insertados += registros.length;
            }
        }

        // Actualizar conteo en la campaña
        await this.actualizarMetricas(dto.campania_id);

        return { insertados, errores };
    },

    async actualizarTrabajador(
        id: string,
        updates: Partial<TrabajadorPadron>
    ): Promise<void> {
        const { error } = await supabase
            .from('padron_campania')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(`Error actualizando trabajador: ${error.message}`);
    },

    async cambiarEstadoTrabajador(
        id: string,
        campaniaId: string,
        nuevoEstado: EstadoTrabajadorCampania
    ): Promise<void> {
        await this.actualizarTrabajador(id, { estado: nuevoEstado });
        await this.actualizarMetricas(campaniaId);
    },

    async eliminarTrabajador(id: string, campaniaId: string): Promise<void> {
        const { error } = await supabase
            .from('padron_campania')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Error eliminando trabajador: ${error.message}`);
        await this.actualizarMetricas(campaniaId);
    },

    // =====================================================
    // MÉTRICAS
    // =====================================================

    async obtenerMetricas(campaniaId: string): Promise<MetricasCampania> {
        const trabajadores = await this.obtenerPadron(campaniaId);
        return calcularMetricas(trabajadores);
    },

    async actualizarMetricas(campaniaId: string): Promise<void> {
        const trabajadores = await this.obtenerPadron(campaniaId);
        const metricas = calcularMetricas(trabajadores);

        const { error } = await supabase
            .from('campanias')
            .update({
                total_trabajadores: metricas.total,
                total_evaluados: metricas.evaluados + metricas.dictaminados + metricas.cerrados,
                total_aptos: metricas.aptos,
                total_restricciones: metricas.aptos_restricciones,
                total_no_aptos: metricas.no_aptos_temporales + metricas.no_aptos_definitivos,
                total_pendientes: metricas.pendientes + metricas.en_proceso,
                monto_total: undefined, // se calcula en otro lado
                updated_at: new Date().toISOString(),
            })
            .eq('id', campaniaId);

        if (error) console.error('Error actualizando métricas:', error.message);
    },

    // =====================================================
    // RESUMEN PARA DASHBOARD
    // =====================================================

    async obtenerResumenGlobal(empresaId?: string): Promise<{
        activas: number;
        completadas: number;
        total_trabajadores: number;
        total_evaluados: number;
        porcentaje_global: number;
    }> {
        let query = supabase.from('campanias').select('estado, total_trabajadores, total_evaluados');
        if (empresaId) query = query.eq('empresa_id', empresaId);

        const { data, error } = await query;
        if (error) throw new Error(`Error obteniendo resumen: ${error.message}`);

        const campanias = data || [];
        const activas = campanias.filter(c => ['planificada', 'en_proceso'].includes(c.estado)).length;
        const completadas = campanias.filter(c => c.estado === 'completada').length;
        const total_trabajadores = campanias.reduce((sum, c) => sum + (c.total_trabajadores || 0), 0);
        const total_evaluados = campanias.reduce((sum, c) => sum + (c.total_evaluados || 0), 0);
        const porcentaje_global = total_trabajadores > 0
            ? Math.round((total_evaluados / total_trabajadores) * 100)
            : 0;

        return { activas, completadas, total_trabajadores, total_evaluados, porcentaje_global };
    },
};

export default campaniaService;
