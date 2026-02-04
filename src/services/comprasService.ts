import { supabase } from '@/lib/supabase'
import { Proveedor, OrdenCompra, DetalleOrdenCompra } from '@/types/compras'
import { inventoryService } from './inventoryService'

export const comprasService = {
    // === PROVEEDORES ===
    async getProveedores(empresaId: string) {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre_comercial')

        if (error) throw error
        return data as Proveedor[]
    },

    async createProveedor(proveedor: Partial<Proveedor>) {
        const { data, error } = await supabase
            .from('proveedores')
            .insert(proveedor)
            .select()
            .single()

        if (error) throw error
        return data as Proveedor
    },

    async updateProveedor(id: string, updates: Partial<Proveedor>) {
        const { data, error } = await supabase
            .from('proveedores')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Proveedor
    },

    // === ORDENES DE COMPRA ===
    async getOrdenes(empresaId: string) {
        const { data, error } = await supabase
            .from('ordenes_compra')
            .select(`
                *,
                proveedor:proveedores(nombre_comercial),
                items:detalles_orden_compra(*)
            `)
            .eq('empresa_id', empresaId)
            .order('fecha_emision', { ascending: false })

        if (error) throw error
        return data as OrdenCompra[]
    },

    async createOrden(orden: Partial<OrdenCompra>, items: Partial<DetalleOrdenCompra>[]) {
        // 1. Crear Cabecera
        const { data: ordenData, error: ordenError } = await supabase
            .from('ordenes_compra')
            .insert({
                ...orden,
                folio: `OC-${Date.now().toString().slice(-6)}`, // Simple auto-gen
                estado: 'enviada' // Por defecto para simplificar flujo
            })
            .select()
            .single()

        if (ordenError) throw ordenError

        // 2. Crear Detalles
        const itemsConId = items.map(item => ({
            ...item,
            orden_id: ordenData.id
        }))

        const { error: itemsError } = await supabase
            .from('detalles_orden_compra')
            .insert(itemsConId)

        if (itemsError) {
            // Rollback manual idealmente, por simplicidad solo lanzamos error
            console.error('Error insertando items orden', itemsError)
            throw itemsError
        }

        return ordenData
    },

    // === RECEPCIÓN DE MERCANCÍA ===
    async recibirOrden(ordenId: string, empresaId: string, itemsRecibidos: { inventario_id: string, cantidad: number }[]) {
        // 1. Actualizar estado de la orden
        const { error: ordenError } = await supabase
            .from('ordenes_compra')
            .update({ estado: 'completada' }) // Asumimos recepción total por simplicidad
            .eq('id', ordenId)

        if (ordenError) throw ordenError

        // 2. Procesar entrada de stock
        // Iteramos y registramos movimiento para cada item
        for (const item of itemsRecibidos) {
            await inventoryService.registrarMovimiento({
                empresa_id: empresaId,
                item_id: item.inventario_id,
                tipo_movimiento: 'entrada_compra',
                cantidad: item.cantidad,
                referencia_id: ordenId,
                origen_ref: 'ordenes_compra',
                observaciones: 'Recepción de Mercancía'
            })

            // Opcional: Actualizar cantidad_recibida en detalles_orden_compra
            await supabase
                .from('detalles_orden_compra')
                .update({ cantidad_recibida: item.cantidad })
                .eq('orden_id', ordenId)
                .eq('inventario_id', item.inventario_id)
        }

        return true
    }
}
