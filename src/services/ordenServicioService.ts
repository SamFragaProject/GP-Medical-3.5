// =====================================================
// TIPOS + SERVICIO: Órdenes de Servicio - GPMedical ERP
// Internas y por empresa-cliente
// =====================================================

import { supabase } from '@/lib/supabase';

// =====================================================
// TIPOS
// =====================================================

export type EstadoOrden = 'borrador' | 'enviada' | 'aceptada' | 'en_proceso' | 'completada' | 'cancelada';
export type TipoOrden = 'interna' | 'empresa' | 'campania';

export interface OrdenServicio {
    id: string;
    folio: string;
    tipo: TipoOrden;
    empresa_id: string;
    campania_id?: string;
    sede_id?: string;
    estado: EstadoOrden;

    // Datos de la orden
    titulo: string;
    descripcion: string;
    fecha_servicio: string;
    fecha_entrega?: string;
    contacto_empresa?: string;
    telefono_contacto?: string;

    // Servicios
    servicios: ServicioOrden[];
    total_servicios: number;
    total_pacientes: number;

    // Tracking
    creado_por: string;
    aprobado_por?: string;
    fecha_aprobacion?: string;
    notas_internas?: string;

    created_at: string;
    updated_at: string;
}

export interface ServicioOrden {
    id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

// =====================================================
// SERVICIO
// =====================================================

export const ordenServicioService = {

    async listar(filtros?: { empresa_id?: string; estado?: EstadoOrden; tipo?: TipoOrden }): Promise<OrdenServicio[]> {
        let query = supabase
            .from('ordenes_servicio')
            .select('*, empresa:empresas(nombre)')
            .order('created_at', { ascending: false });

        if (filtros?.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros?.estado) query = query.eq('estado', filtros.estado);
        if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);

        const { data } = await query;
        return (data || []) as OrdenServicio[];
    },

    async obtener(id: string): Promise<OrdenServicio | null> {
        const { data } = await supabase
            .from('ordenes_servicio')
            .select('*, empresa:empresas(nombre)')
            .eq('id', id)
            .single();
        return data as OrdenServicio | null;
    },

    async crear(orden: Partial<OrdenServicio>): Promise<OrdenServicio | null> {
        // Generar folio automático OS-YYYYMMDD-XXX
        const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const { count } = await supabase
            .from('ordenes_servicio')
            .select('id', { count: 'exact', head: true });
        const folio = `OS-${hoy}-${String((count || 0) + 1).padStart(3, '0')}`;

        const servicios = orden.servicios || [];
        const total = servicios.reduce((s, sv) => s + sv.subtotal, 0);

        const { data, error } = await supabase
            .from('ordenes_servicio')
            .insert({
                ...orden,
                folio,
                estado: 'borrador',
                servicios,
                total_servicios: total,
            })
            .select()
            .single();

        if (error) { console.error('Error creando orden:', error); return null; }
        return data as OrdenServicio;
    },

    async actualizarEstado(id: string, estado: EstadoOrden, notas?: string): Promise<boolean> {
        const updates: any = { estado, updated_at: new Date().toISOString() };
        if (notas) updates.notas_internas = notas;
        if (estado === 'aceptada') {
            updates.aprobado_por = (await supabase.auth.getUser()).data.user?.id;
            updates.fecha_aprobacion = new Date().toISOString();
        }

        const { error } = await supabase
            .from('ordenes_servicio')
            .update(updates)
            .eq('id', id);

        return !error;
    },

    async eliminar(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('ordenes_servicio')
            .delete()
            .eq('id', id);
        return !error;
    },

    async resumen(): Promise<{
        total: number;
        borradores: number;
        en_proceso: number;
        completadas: number;
        monto_total: number;
    }> {
        const { data } = await supabase
            .from('ordenes_servicio')
            .select('estado, total_servicios');

        const ordenes = data || [];
        return {
            total: ordenes.length,
            borradores: ordenes.filter(o => o.estado === 'borrador').length,
            en_proceso: ordenes.filter(o => o.estado === 'en_proceso').length,
            completadas: ordenes.filter(o => o.estado === 'completada').length,
            monto_total: ordenes.reduce((s, o) => s + (o.total_servicios || 0), 0),
        };
    },
};

export default ordenServicioService;
