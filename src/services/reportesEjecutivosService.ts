// =====================================================
// SERVICIO: Reportes Ejecutivos — GPMedical ERP Pro
// Consultas consolidadas para el Tablero de Control
// =====================================================

import { supabase } from '@/lib/supabase';

// =====================================================
// TIPOS
// =====================================================

export interface KPIGlobal {
    empresasActivas: number;
    campaniasEnCurso: number;
    episodiosEnProceso: number;
    resultadosRetrasados: number;
    dictamenesPorFirmar: number;
    facturasVencidas: number;
    ingresosMes: number;
    metaMes: number;
    porcentajeMeta: number;
    totalPacientes: number;
    citasHoy: number;
}

export interface MetricaEmpresa {
    empresa_id: string;
    empresa_nombre: string;
    // Headcount
    headcount_total: number;
    headcount_evaluado: number;
    headcount_pendiente: number;
    // Aptitud
    aptos: number;
    aptos_con_restriccion: number;
    no_aptos: number;
    porcentaje_aptos: number;
    porcentaje_restriccion: number;
    // Hallazgos
    hallazgos_criticos: number;
    hallazgos_totales: number;
    // SLA
    sla_entrega_dias: number;
    sla_cumplimiento: number;
    // Financiero
    saldo_pendiente: number;
    facturado_mes: number;
    // Campañas
    campanias_activas: number;
    episodios_abiertos: number;
}

export interface CampaniaResumen {
    id: string;
    empresa_nombre: string;
    nombre: string;
    estado: string;
    headcount: number;
    evaluados: number;
    porcentaje: number;
    fecha_inicio: string;
    fecha_fin: string | null;
}

export interface ResultadoRetrasado {
    id: string;
    paciente_nombre: string;
    empresa_nombre: string;
    tipo_estudio: string;
    fecha_orden: string;
    dias_atraso: number;
}

export interface DictamenPendiente {
    id: string;
    paciente_nombre: string;
    empresa_nombre: string;
    tipo: string;
    fecha_creacion: string;
    medico_nombre?: string;
}

export interface FacturaVencida {
    id: string;
    empresa_nombre: string;
    numero_factura: string;
    monto: number;
    fecha_vencimiento: string;
    dias_vencida: number;
}

// =====================================================
// SERVICIO
// =====================================================

export const reportesEjecutivosService = {

    // ── KPIs globales para Super Admin ──
    async obtenerKPIGlobal(): Promise<KPIGlobal> {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
        const hoy = ahora.toISOString().split('T')[0];

        try {
            const [
                { count: empresasActivas },
                { count: campanias },
                { count: episodios },
                { count: resultadosRet },
                { count: dictamenesPend },
                { count: facturasVenc },
                { data: ingresoData },
                { count: totalPacientes },
                { count: citasHoy }
            ] = await Promise.all([
                // 1. Empresas activas
                supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('activo', true),

                // 2. Campañas en curso
                supabase.from('campanias').select('id', { count: 'exact', head: true })
                    .in('estado', ['en_proceso', 'planificada']),


                // 3. Episodios en proceso (citas activas/en_curso + exámenes pendientes)
                supabase.from('citas').select('id', { count: 'exact', head: true })
                    .in('estado', ['programada', 'en_curso', 'confirmada']),

                // 4. Resultados retrasados (órdenes de estudio > 5 días sin resultado)
                supabase.from('ordenes_estudio').select('id', { count: 'exact', head: true })
                    .eq('estado', 'pendiente')
                    .lt('fecha_orden', new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()),

                // 5. Dictámenes por firmar
                supabase.from('dictamenes').select('id', { count: 'exact', head: true })
                    .in('estado', ['pendiente', 'borrador']),

                // 6. Facturas vencidas (CxC vencidas)
                supabase.from('cuentas_por_cobrar').select('id', { count: 'exact', head: true })
                    .in('estado', ['vencida', 'morosa'])
                    .lt('fecha_vencimiento', hoy),

                // 7. Ingresos del mes (pagos recibidos)
                supabase.from('pagos_cxc').select('monto')
                    .gte('fecha_pago', inicioMes),

                // 8. Total pacientes
                supabase.from('pacientes').select('id', { count: 'exact', head: true }),

                // 9. Citas hoy
                supabase.from('citas').select('id', { count: 'exact', head: true })
                    .gte('fecha_hora', `${hoy}T00:00:00`)
                    .lte('fecha_hora', `${hoy}T23:59:59`)
            ]);

            const ingresosMes = ingresoData?.reduce((s, p) => s + (p.monto || 0), 0) || 0;

            // Meta: estimación basada en facturación del mes anterior o un default
            const inicioMesPrevio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1).toISOString();
            const finMesPrevio = new Date(ahora.getFullYear(), ahora.getMonth(), 0).toISOString();
            const { data: ingresosPrevio } = await supabase
                .from('pagos_cxc')
                .select('monto')
                .gte('fecha_pago', inicioMesPrevio)
                .lte('fecha_pago', finMesPrevio);
            const metaPrevio = ingresosPrevio?.reduce((s, p) => s + (p.monto || 0), 0) || 0;
            const metaMes = metaPrevio > 0 ? metaPrevio * 1.1 : 500000; // +10% o default 500k

            return {
                empresasActivas: empresasActivas || 0,
                campaniasEnCurso: campanias || 0,
                episodiosEnProceso: episodios || 0,
                resultadosRetrasados: resultadosRet || 0,
                dictamenesPorFirmar: dictamenesPend || 0,
                facturasVencidas: facturasVenc || 0,
                ingresosMes,
                metaMes,
                porcentajeMeta: metaMes > 0 ? Math.round((ingresosMes / metaMes) * 100) : 0,
                totalPacientes: totalPacientes || 0,
                citasHoy: citasHoy || 0,
            };
        } catch (err) {
            console.error('Error obteniendo KPI global:', err);
            return {
                empresasActivas: 0, campaniasEnCurso: 0, episodiosEnProceso: 0,
                resultadosRetrasados: 0, dictamenesPorFirmar: 0, facturasVencidas: 0,
                ingresosMes: 0, metaMes: 500000, porcentajeMeta: 0,
                totalPacientes: 0, citasHoy: 0,
            };
        }
    },

    // ── Métricas por empresa ──
    async obtenerMetricasPorEmpresa(): Promise<MetricaEmpresa[]> {
        const { data: empresas } = await supabase
            .from('empresas')
            .select('id, nombre')
            .eq('activo', true)
            .order('nombre');

        if (!empresas || empresas.length === 0) return [];

        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
        const hoy = ahora.toISOString().split('T')[0];

        const metricas: MetricaEmpresa[] = [];

        for (const emp of empresas) {
            try {
                const [
                    { count: headcount },
                    { data: dictamenes },
                    { count: hallazgosCriticos },
                    { count: hallazgosTotales },
                    { data: cxcData },
                    { count: campanias },
                    { count: episodios },
                    { data: facturadoData },
                    { data: ordenesEstudio }
                ] = await Promise.all([
                    // Headcount
                    supabase.from('pacientes').select('id', { count: 'exact', head: true })
                        .eq('empresa_id', emp.id),
                    // Dictámenes
                    supabase.from('dictamenes').select('resultado')
                        .eq('empresa_id', emp.id),
                    // Hallazgos críticos
                    supabase.from('alertas_vigilancia').select('id', { count: 'exact', head: true })
                        .eq('empresa_id', emp.id).eq('severidad', 'critica'),
                    // Hallazgos totales
                    supabase.from('alertas_vigilancia').select('id', { count: 'exact', head: true })
                        .eq('empresa_id', emp.id),
                    // Saldo CxC
                    supabase.from('cuentas_por_cobrar').select('saldo')
                        .eq('empresa_id', emp.id).neq('estado', 'pagada'),
                    // Campañas activas
                    supabase.from('campanias').select('id', { count: 'exact', head: true })
                        .eq('empresa_id', emp.id).in('estado', ['en_proceso', 'planificada']),
                    // Episodios abiertos
                    supabase.from('citas').select('id', { count: 'exact', head: true })
                        .eq('empresa_id', emp.id).in('estado', ['programada', 'en_curso']),
                    // Facturado del mes
                    supabase.from('pagos_cxc').select('monto')
                        .eq('empresa_id', emp.id).gte('fecha_pago', inicioMes),
                    // Órdenes para calcular SLA
                    supabase.from('ordenes_estudio').select('fecha_orden, fecha_resultado')
                        .eq('empresa_id', emp.id).eq('estado', 'completado').limit(50)
                ]);

                const total = headcount || 0;
                const aptos = dictamenes?.filter(d => d.resultado === 'apto').length || 0;
                const aptosR = dictamenes?.filter(d => d.resultado === 'apto_con_restriccion').length || 0;
                const noAptos = dictamenes?.filter(d => d.resultado === 'no_apto').length || 0;
                const evaluados = aptos + aptosR + noAptos;
                const saldo = cxcData?.reduce((s, c) => s + (c.saldo || 0), 0) || 0;
                const facturado = facturadoData?.reduce((s, p) => s + (p.monto || 0), 0) || 0;

                // SLA: promedio de días entre orden y resultado
                let slaDias = 0;
                let slaCumplimiento = 100;
                if (ordenesEstudio && ordenesEstudio.length > 0) {
                    const tiempos = ordenesEstudio
                        .filter(o => o.fecha_orden && o.fecha_resultado)
                        .map(o => {
                            const diff = new Date(o.fecha_resultado).getTime() - new Date(o.fecha_orden).getTime();
                            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                        });
                    slaDias = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
                    const dentroSLA = tiempos.filter(t => t <= 5).length;
                    slaCumplimiento = tiempos.length > 0 ? Math.round((dentroSLA / tiempos.length) * 100) : 100;
                }

                metricas.push({
                    empresa_id: emp.id,
                    empresa_nombre: emp.nombre,
                    headcount_total: total,
                    headcount_evaluado: evaluados,
                    headcount_pendiente: Math.max(0, total - evaluados),
                    aptos,
                    aptos_con_restriccion: aptosR,
                    no_aptos: noAptos,
                    porcentaje_aptos: total > 0 ? Math.round((aptos / total) * 100) : 0,
                    porcentaje_restriccion: total > 0 ? Math.round((aptosR / total) * 100) : 0,
                    hallazgos_criticos: hallazgosCriticos || 0,
                    hallazgos_totales: hallazgosTotales || 0,
                    sla_entrega_dias: slaDias,
                    sla_cumplimiento: slaCumplimiento,
                    saldo_pendiente: saldo,
                    facturado_mes: facturado,
                    campanias_activas: campanias || 0,
                    episodios_abiertos: episodios || 0,
                });
            } catch (err) {
                console.error(`Error métricas empresa ${emp.nombre}:`, err);
            }
        }

        return metricas.sort((a, b) => b.headcount_total - a.headcount_total);
    },

    // ── Campañas en curso (detalle) ──
    async obtenerCampaniasActivas(): Promise<CampaniaResumen[]> {
        const { data } = await supabase
            .from('campanias')
            .select(`
                id, nombre, estado, headcount_objetivo,
                fecha_inicio, fecha_fin,
                empresa:empresas(nombre)
            `)
            .in('estado', ['en_proceso', 'planificada'])
            .order('fecha_inicio', { ascending: false })
            .limit(10);

        if (!data) return [];

        // Para cada campaña, obtener cuántos evaluados tiene
        const campanias: CampaniaResumen[] = [];
        for (const c of data) {
            const { count } = await supabase
                .from('dictamenes')
                .select('id', { count: 'exact', head: true })
                .eq('campania_id', c.id);

            campanias.push({
                id: c.id,
                empresa_nombre: (c as any).empresa?.nombre || 'N/A',
                nombre: c.nombre,
                estado: c.estado,
                headcount: c.headcount_objetivo || 0,
                evaluados: count || 0,
                porcentaje: c.headcount_objetivo > 0 ? Math.round(((count || 0) / c.headcount_objetivo) * 100) : 0,
                fecha_inicio: c.fecha_inicio,
                fecha_fin: c.fecha_fin,
            });
        }

        return campanias;
    },

    // ── Resultados retrasados (detalle) ──
    async obtenerResultadosRetrasados(): Promise<ResultadoRetrasado[]> {
        const limite = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
            .from('ordenes_estudio')
            .select(`
                id, tipo, fecha_orden,
                paciente:pacientes(nombre, apellido_paterno),
                empresa:empresas(nombre)
            `)
            .eq('estado', 'pendiente')
            .lt('fecha_orden', limite)
            .order('fecha_orden', { ascending: true })
            .limit(20);

        if (!data) return [];

        return data.map((r: any) => ({
            id: r.id,
            paciente_nombre: r.paciente ? `${r.paciente.nombre} ${r.paciente.apellido_paterno}` : 'Desconocido',
            empresa_nombre: r.empresa?.nombre || 'N/A',
            tipo_estudio: r.tipo || 'General',
            fecha_orden: r.fecha_orden,
            dias_atraso: Math.ceil((Date.now() - new Date(r.fecha_orden).getTime()) / (1000 * 60 * 60 * 24)),
        }));
    },

    // ── Dictámenes pendientes de firma ──
    async obtenerDictamenesPendientes(): Promise<DictamenPendiente[]> {
        const { data } = await supabase
            .from('dictamenes')
            .select(`
                id, tipo, created_at,
                paciente:pacientes(nombre, apellido_paterno),
                empresa:empresas(nombre),
                medico:profiles(nombre, apellido_paterno)
            `)
            .in('estado', ['pendiente', 'borrador'])
            .order('created_at', { ascending: true })
            .limit(20);

        if (!data) return [];

        return data.map((d: any) => ({
            id: d.id,
            paciente_nombre: d.paciente ? `${d.paciente.nombre} ${d.paciente.apellido_paterno}` : 'Desconocido',
            empresa_nombre: d.empresa?.nombre || 'N/A',
            tipo: d.tipo || 'Aptitud',
            fecha_creacion: d.created_at,
            medico_nombre: d.medico ? `${d.medico.nombre} ${d.medico.apellido_paterno}` : undefined,
        }));
    },

    // ── Facturas vencidas (detalle) ──
    async obtenerFacturasVencidas(): Promise<FacturaVencida[]> {
        const hoy = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('cuentas_por_cobrar')
            .select(`
                id, numero_documento, monto_total, saldo, fecha_vencimiento,
                empresa:empresas(nombre)
            `)
            .in('estado', ['vencida', 'morosa', 'vigente'])
            .lt('fecha_vencimiento', hoy)
            .order('fecha_vencimiento', { ascending: true })
            .limit(20);

        if (!data) return [];

        return data.map((f: any) => ({
            id: f.id,
            empresa_nombre: f.empresa?.nombre || 'N/A',
            numero_factura: f.numero_documento || `CXC-${f.id.slice(0, 8)}`,
            monto: f.saldo || f.monto_total || 0,
            fecha_vencimiento: f.fecha_vencimiento,
            dias_vencida: Math.ceil((Date.now() - new Date(f.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24)),
        }));
    },

    // ── Ingresos mensuales para gráfico de tendencia (últimos 6 meses) ──
    async obtenerTendenciaIngresos(): Promise<{ mes: string; ingresos: number; meta: number }[]> {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const ahora = new Date();
        const datos: { mes: string; ingresos: number; meta: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
            const inicioMes = fecha.toISOString();
            const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString();

            const { data } = await supabase
                .from('pagos_cxc')
                .select('monto')
                .gte('fecha_pago', inicioMes)
                .lte('fecha_pago', finMes);

            const ingresos = data?.reduce((s, p) => s + (p.monto || 0), 0) || 0;

            datos.push({
                mes: meses[fecha.getMonth()],
                ingresos,
                meta: 500000, // Meta fija o calculada
            });
        }

        return datos;
    },
};

export default reportesEjecutivosService;
