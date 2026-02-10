// =====================================================
// SERVICIO: Cotizaciones - GPMedical ERP Pro
// =====================================================
// Gestión de propuestas comerciales para empresas.
// Ciclo: borrador → enviada → aceptada → convertida a factura
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
    Cotizacion,
    ConceptoCotizacion,
    CrearCotizacionDTO,
    ActualizarCotizacionDTO,
    FiltrosCotizacion,
    EstadoCotizacion,
} from '@/types/cotizacion';

// =====================================================
// HELPERS
// =====================================================

function calcularTotales(conceptos: Omit<ConceptoCotizacion, 'id' | 'importe'>[]): {
    conceptosConImporte: ConceptoCotizacion[];
    subtotal: number;
    iva: number;
    total: number;
} {
    const conceptosConImporte = conceptos.map(c => {
        const importe = c.cantidad * c.precio_unitario * (1 - (c.descuento_porcentaje || 0) / 100);
        return { ...c, importe: Math.round(importe * 100) / 100 };
    });
    const subtotal = conceptosConImporte.reduce((sum, c) => sum + c.importe, 0);
    const iva = Math.round(subtotal * 0.16 * 100) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;
    return { conceptosConImporte, subtotal, iva, total };
}

async function generarFolio(empresaId: string): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await supabase
        .from('cotizaciones')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .gte('fecha_emision', `${year}-01-01`);

    const seq = String((count || 0) + 1).padStart(4, '0');
    return `COT-${year}-${seq}`;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const cotizacionService = {

    // =====================================================
    // CRUD
    // =====================================================

    async listar(filtros: FiltrosCotizacion = {}): Promise<Cotizacion[]> {
        let query = supabase
            .from('cotizaciones')
            .select(`*, empresa:empresas(id, nombre, rfc)`)
            .order('created_at', { ascending: false });

        if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros.estado) query = query.eq('estado', filtros.estado);
        if (filtros.fecha_desde) query = query.gte('fecha_emision', filtros.fecha_desde);
        if (filtros.fecha_hasta) query = query.lte('fecha_emision', filtros.fecha_hasta);
        if (filtros.search) {
            query = query.or(`folio.ilike.%${filtros.search}%,cliente_nombre.ilike.%${filtros.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error listando cotizaciones: ${error.message}`);
        return data || [];
    },

    async obtener(id: string): Promise<Cotizacion | null> {
        const { data, error } = await supabase
            .from('cotizaciones')
            .select(`*, empresa:empresas(id, nombre, rfc)`)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error obteniendo cotización: ${error.message}`);
        }
        return data;
    },

    async crear(dto: CrearCotizacionDTO): Promise<Cotizacion> {
        const { data: userData } = await supabase.auth.getUser();
        const folio = await generarFolio(dto.empresa_id);
        const { conceptosConImporte, subtotal, iva, total } = calcularTotales(dto.conceptos);

        const { data, error } = await supabase
            .from('cotizaciones')
            .insert({
                empresa_id: dto.empresa_id,
                folio,
                cliente_nombre: dto.cliente_nombre,
                cliente_rfc: dto.cliente_rfc,
                cliente_email: dto.cliente_email,
                cliente_telefono: dto.cliente_telefono,
                contacto_nombre: dto.contacto_nombre,
                estado: 'borrador' as EstadoCotizacion,
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vigencia: dto.fecha_vigencia,
                conceptos: conceptosConImporte,
                subtotal,
                iva,
                total,
                moneda: dto.moneda || 'MXN',
                notas: dto.notas,
                terminos_condiciones: dto.terminos_condiciones,
                campania_id: dto.campania_id,
                creado_por: userData.user?.id || '',
            })
            .select()
            .single();

        if (error) throw new Error(`Error creando cotización: ${error.message}`);
        return data;
    },

    async actualizar(id: string, dto: ActualizarCotizacionDTO): Promise<Cotizacion> {
        const updates: Record<string, unknown> = { ...dto, updated_at: new Date().toISOString() };

        if (dto.conceptos) {
            const { conceptosConImporte, subtotal, iva, total } = calcularTotales(dto.conceptos);
            updates.conceptos = conceptosConImporte;
            updates.subtotal = subtotal;
            updates.iva = iva;
            updates.total = total;
        }

        const { data, error } = await supabase
            .from('cotizaciones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Error actualizando cotización: ${error.message}`);
        return data;
    },

    async cambiarEstado(id: string, nuevoEstado: EstadoCotizacion): Promise<void> {
        const updates: Record<string, unknown> = {
            estado: nuevoEstado,
            updated_at: new Date().toISOString(),
        };
        if (nuevoEstado === 'aceptada') {
            updates.fecha_aceptacion = new Date().toISOString().split('T')[0];
        }

        const { error } = await supabase
            .from('cotizaciones')
            .update(updates)
            .eq('id', id);

        if (error) throw new Error(`Error cambiando estado: ${error.message}`);
    },

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase
            .from('cotizaciones')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Error eliminando cotización: ${error.message}`);
    },

    // =====================================================
    // CONVERSIÓN A FACTURA
    // =====================================================

    async convertirAFactura(id: string): Promise<string> {
        const cotizacion = await this.obtener(id);
        if (!cotizacion) throw new Error('Cotización no encontrada');
        if (cotizacion.estado !== 'aceptada') throw new Error('Solo cotizaciones aceptadas pueden convertirse');

        // Crear factura con los datos de la cotización
        const { data: factura, error } = await supabase
            .from('cfdi')
            .insert({
                empresa_id: cotizacion.empresa_id,
                cliente_nombre: cotizacion.cliente_nombre,
                cliente_rfc: cotizacion.cliente_rfc,
                subtotal: cotizacion.subtotal,
                iva: cotizacion.iva,
                total: cotizacion.total,
                conceptos: cotizacion.conceptos,
                moneda: cotizacion.moneda,
                estado: 'draft',
                cotizacion_id: id,
            })
            .select('id')
            .single();

        if (error) throw new Error(`Error creando factura: ${error.message}`);

        // Marcar cotización como convertida
        await this.cambiarEstado(id, 'convertida');
        await supabase
            .from('cotizaciones')
            .update({ factura_id: factura.id })
            .eq('id', id);

        return factura.id;
    },

    // =====================================================
    // RESUMEN
    // =====================================================

    async obtenerResumen(empresaId?: string): Promise<{
        total: number;
        borradores: number;
        enviadas: number;
        aceptadas: number;
        monto_total_aceptadas: number;
    }> {
        let query = supabase.from('cotizaciones').select('estado, total');
        if (empresaId) query = query.eq('empresa_id', empresaId);

        const { data, error } = await query;
        if (error) throw new Error(`Error obteniendo resumen: ${error.message}`);

        const cotizaciones = data || [];
        return {
            total: cotizaciones.length,
            borradores: cotizaciones.filter(c => c.estado === 'borrador').length,
            enviadas: cotizaciones.filter(c => c.estado === 'enviada').length,
            aceptadas: cotizaciones.filter(c => c.estado === 'aceptada').length,
            monto_total_aceptadas: cotizaciones
                .filter(c => c.estado === 'aceptada' || c.estado === 'convertida')
                .reduce((sum, c) => sum + (c.total || 0), 0),
        };
    },

    // =====================================================
    // DUPLICAR COTIZACIÓN
    // =====================================================

    async duplicar(id: string): Promise<Cotizacion> {
        const original = await this.obtener(id);
        if (!original) throw new Error('Cotización no encontrada');

        return this.crear({
            empresa_id: original.empresa_id,
            cliente_nombre: original.cliente_nombre,
            cliente_rfc: original.cliente_rfc,
            cliente_email: original.cliente_email,
            cliente_telefono: original.cliente_telefono,
            contacto_nombre: original.contacto_nombre,
            fecha_vigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            conceptos: original.conceptos.map(({ descripcion, codigo_servicio, cantidad, precio_unitario, descuento_porcentaje }) => ({
                descripcion, codigo_servicio, cantidad, precio_unitario, descuento_porcentaje,
            })),
            notas: original.notas,
            terminos_condiciones: original.terminos_condiciones,
            moneda: original.moneda,
            campania_id: original.campania_id,
        });
    },
};

export default cotizacionService;
