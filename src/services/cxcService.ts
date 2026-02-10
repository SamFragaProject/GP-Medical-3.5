// =====================================================
// SERVICIO: Cuentas por Cobrar (CxC) - GPMedical ERP Pro
// =====================================================
// Aging por buckets, registro de pagos parciales,
// seguimiento de cobranza, y reportes por empresa.
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
    CuentaPorCobrar,
    PagoCxC,
    CrearCxCDTO,
    RegistrarPagoDTO,
    FiltrosCxC,
    AgingResumen,
    AgingBucketData,
    AgingBucket,
    ResumenCxCEmpresa,
    EstadoCxC,
} from '@/types/cxc';
import { AGING_BUCKET_LABELS, AGING_BUCKET_COLORS } from '@/types/cxc';

// =====================================================
// HELPERS
// =====================================================

function calcularAgingBucket(fechaVencimiento: string): { bucket: AgingBucket; diasVencidos: number } {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
    const diasVencidos = Math.max(0, diff);

    let bucket: AgingBucket = '0-30';
    if (diasVencidos > 90) bucket = '90+';
    else if (diasVencidos > 60) bucket = '61-90';
    else if (diasVencidos > 30) bucket = '31-60';

    return { bucket, diasVencidos };
}

function calcularEstadoCuenta(monto_original: number, monto_pagado: number, fecha_vencimiento: string): EstadoCxC {
    if (monto_pagado >= monto_original) return 'pagada';
    if (monto_pagado > 0) return 'pagada_parcial';
    const { diasVencidos } = calcularAgingBucket(fecha_vencimiento);
    return diasVencidos > 0 ? 'vencida' : 'vigente';
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const cxcService = {

    // =====================================================
    // CRUD
    // =====================================================

    async listar(filtros: FiltrosCxC = {}): Promise<CuentaPorCobrar[]> {
        let query = supabase
            .from('cuentas_por_cobrar')
            .select(`*, empresa:empresas(id, nombre), pagos:pagos_cxc(*)`)
            .order('fecha_vencimiento', { ascending: true });

        if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros.estado) query = query.eq('estado', filtros.estado);
        if (filtros.solo_vencidas) query = query.gt('dias_vencidos', 0);
        if (filtros.fecha_desde) query = query.gte('fecha_emision', filtros.fecha_desde);
        if (filtros.fecha_hasta) query = query.lte('fecha_emision', filtros.fecha_hasta);
        if (filtros.search) {
            query = query.or(
                `folio_factura.ilike.%${filtros.search}%,cliente_nombre.ilike.%${filtros.search}%`
            );
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error listando CxC: ${error.message}`);

        // Calcular aging en frontend para datos demo
        const cuentas = (data || []).map(cuenta => {
            const { bucket, diasVencidos } = calcularAgingBucket(cuenta.fecha_vencimiento);
            return {
                ...cuenta,
                aging_bucket: bucket,
                dias_vencidos: diasVencidos,
            };
        });

        // Filtro de bucket post-query
        if (filtros.aging_bucket) {
            return cuentas.filter(c => c.aging_bucket === filtros.aging_bucket);
        }

        return cuentas;
    },

    async obtener(id: string): Promise<CuentaPorCobrar | null> {
        const { data, error } = await supabase
            .from('cuentas_por_cobrar')
            .select(`*, empresa:empresas(id, nombre), pagos:pagos_cxc(*)`)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error obteniendo CxC: ${error.message}`);
        }
        return data;
    },

    async crear(dto: CrearCxCDTO): Promise<CuentaPorCobrar> {
        const { bucket, diasVencidos } = calcularAgingBucket(dto.fecha_vencimiento);

        const { data, error } = await supabase
            .from('cuentas_por_cobrar')
            .insert({
                empresa_id: dto.empresa_id,
                factura_id: dto.factura_id,
                folio_factura: dto.folio_factura,
                cliente_nombre: dto.cliente_nombre,
                cliente_rfc: dto.cliente_rfc,
                monto_original: dto.monto_original,
                monto_pagado: 0,
                saldo_pendiente: dto.monto_original,
                moneda: dto.moneda || 'MXN',
                estado: diasVencidos > 0 ? 'vencida' : 'vigente',
                fecha_emision: dto.fecha_emision,
                fecha_vencimiento: dto.fecha_vencimiento,
                dias_vencidos: diasVencidos,
                aging_bucket: bucket,
                notas: dto.notas,
            })
            .select()
            .single();

        if (error) throw new Error(`Error creando CxC: ${error.message}`);
        return { ...data, pagos: [] };
    },

    // =====================================================
    // PAGOS
    // =====================================================

    async registrarPago(dto: RegistrarPagoDTO): Promise<PagoCxC> {
        const { data: userData } = await supabase.auth.getUser();

        // 1. Registrar el pago
        const { data: pago, error: pagoError } = await supabase
            .from('pagos_cxc')
            .insert({
                cuenta_id: dto.cuenta_id,
                monto: dto.monto,
                fecha_pago: dto.fecha_pago,
                metodo_pago: dto.metodo_pago,
                referencia: dto.referencia,
                notas: dto.notas,
                complemento_cfdi: dto.complemento_cfdi || false,
                registrado_por: userData.user?.id || '',
            })
            .select()
            .single();

        if (pagoError) throw new Error(`Error registrando pago: ${pagoError.message}`);

        // 2. Actualizar saldo de la cuenta
        const cuenta = await this.obtener(dto.cuenta_id);
        if (cuenta) {
            const nuevoMontoPagado = (cuenta.monto_pagado || 0) + dto.monto;
            const nuevoSaldo = cuenta.monto_original - nuevoMontoPagado;
            const nuevoEstado = calcularEstadoCuenta(
                cuenta.monto_original, nuevoMontoPagado, cuenta.fecha_vencimiento
            );

            await supabase
                .from('cuentas_por_cobrar')
                .update({
                    monto_pagado: nuevoMontoPagado,
                    saldo_pendiente: Math.max(0, nuevoSaldo),
                    estado: nuevoEstado,
                    fecha_ultimo_pago: dto.fecha_pago,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', dto.cuenta_id);
        }

        return pago;
    },

    async obtenerPagos(cuentaId: string): Promise<PagoCxC[]> {
        const { data, error } = await supabase
            .from('pagos_cxc')
            .select('*')
            .eq('cuenta_id', cuentaId)
            .order('fecha_pago', { ascending: false });

        if (error) throw new Error(`Error obteniendo pagos: ${error.message}`);
        return data || [];
    },

    // =====================================================
    // AGING REPORT
    // =====================================================

    async obtenerAgingResumen(empresaId?: string): Promise<AgingResumen> {
        const cuentas = await this.listar({
            empresa_id: empresaId,
        });

        const pendientes = cuentas.filter(c => c.estado !== 'pagada' && c.estado !== 'cancelada');
        const totalSaldo = pendientes.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0);
        const totalVencido = pendientes
            .filter(c => c.dias_vencidos > 0)
            .reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0);

        const bucketMap: Record<AgingBucket, { count: number; monto: number }> = {
            '0-30': { count: 0, monto: 0 },
            '31-60': { count: 0, monto: 0 },
            '61-90': { count: 0, monto: 0 },
            '90+': { count: 0, monto: 0 },
        };

        pendientes.forEach(c => {
            const bucket = c.aging_bucket as AgingBucket;
            if (bucketMap[bucket]) {
                bucketMap[bucket].count++;
                bucketMap[bucket].monto += c.saldo_pendiente || 0;
            }
        });

        const buckets: AgingBucketData[] = (Object.keys(bucketMap) as AgingBucket[]).map(bucket => ({
            bucket,
            label: AGING_BUCKET_LABELS[bucket],
            color: AGING_BUCKET_COLORS[bucket],
            count: bucketMap[bucket].count,
            monto: Math.round(bucketMap[bucket].monto * 100) / 100,
            porcentaje: totalSaldo > 0
                ? Math.round((bucketMap[bucket].monto / totalSaldo) * 100)
                : 0,
        }));

        const totalCobrado = cuentas
            .filter(c => c.estado === 'pagada')
            .reduce((sum, c) => sum + (c.monto_original || 0), 0);
        const totalEmitido = cuentas.reduce((sum, c) => sum + (c.monto_original || 0), 0);

        return {
            buckets,
            total_cuentas: pendientes.length,
            total_saldo: Math.round(totalSaldo * 100) / 100,
            total_vencido: Math.round(totalVencido * 100) / 100,
            porcentaje_cobranza: totalEmitido > 0
                ? Math.round((totalCobrado / totalEmitido) * 100)
                : 0,
        };
    },

    // =====================================================
    // RESUMEN POR EMPRESA
    // =====================================================

    async obtenerResumenPorEmpresa(): Promise<ResumenCxCEmpresa[]> {
        const cuentas = await this.listar({});

        const empresaMap = new Map<string, {
            nombre: string;
            vigentes: number;
            vencidas: number;
            saldo: number;
            vencido: number;
            pagos: number[];
        }>();

        cuentas.forEach(c => {
            const key = c.empresa_id;
            if (!empresaMap.has(key)) {
                empresaMap.set(key, {
                    nombre: c.empresa?.nombre || 'Sin nombre',
                    vigentes: 0,
                    vencidas: 0,
                    saldo: 0,
                    vencido: 0,
                    pagos: [],
                });
            }
            const entry = empresaMap.get(key)!;
            if (c.estado === 'vigente') entry.vigentes++;
            if (c.estado === 'vencida') entry.vencidas++;
            entry.saldo += c.saldo_pendiente || 0;
            if (c.dias_vencidos > 0) entry.vencido += c.saldo_pendiente || 0;
            if (c.dias_vencidos > 0) entry.pagos.push(c.dias_vencidos);
        });

        return Array.from(empresaMap.entries()).map(([id, data]) => ({
            empresa_id: id,
            empresa_nombre: data.nombre,
            cuentas_vigentes: data.vigentes,
            cuentas_vencidas: data.vencidas,
            saldo_total: Math.round(data.saldo * 100) / 100,
            saldo_vencido: Math.round(data.vencido * 100) / 100,
            dias_promedio_pago: data.pagos.length > 0
                ? Math.round(data.pagos.reduce((a, b) => a + b, 0) / data.pagos.length)
                : 0,
        }));
    },

    // =====================================================
    // MARCAR INCOBRABLE
    // =====================================================

    async marcarIncobrable(id: string): Promise<void> {
        const { error } = await supabase
            .from('cuentas_por_cobrar')
            .update({
                estado: 'incobrable',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);
        if (error) throw new Error(`Error marcando incobrable: ${error.message}`);
    },
};

export default cxcService;
