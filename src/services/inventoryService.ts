import { supabase } from '@/lib/supabase';
import { InventarioItem, MovimientoInventario, InventoryStats, MovementType, InventoryStatus } from '@/types/inventory';


export const inventoryService = {
    /**
     * Obtener lista de inventario con filtros opcionales
     */
    async getInventario(empresaId: string, search?: string, status?: InventoryStatus): Promise<InventarioItem[]> {
        let query = supabase
            .from('inventario_medicamentos')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre_comercial', { ascending: true });

        if (search) {
            query = query.or(`nombre_comercial.ilike.%${search}%,nombre_generico.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('estado', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    /**
     * Obtener un item por ID
     */
    async getItem(id: string): Promise<InventarioItem | null> {
        const { data, error } = await supabase
            .from('inventario_medicamentos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Crear nuevo item en inventario
     */
    async createItem(item: Omit<InventarioItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventarioItem> {
        const { data, error } = await supabase
            .from('inventario_medicamentos')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Actualizar item
     */
    async updateItem(id: string, updates: Partial<InventarioItem>): Promise<InventarioItem> {
        const { data, error } = await supabase
            .from('inventario_medicamentos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Registrar un movimiento de inventario (Entrada o Salida)
     * Actualiza automáticamente el stock_actual del item.
     */
    async registrarMovimiento(movimiento: Omit<MovimientoInventario, 'id' | 'fecha_movimiento'>): Promise<MovimientoInventario> {

        // 1. Obtener item actual para validaciones (si es salida)
        const item = await this.getItem(movimiento.item_id);
        if (!item) throw new Error('Item no encontrado');

        const isSalida = ['salida_receta', 'salida_ajuste', 'merma'].includes(movimiento.tipo_movimiento);
        const cantidad = Math.abs(movimiento.cantidad);

        if (isSalida && item.stock_actual < cantidad) {
            throw new Error(`Stock insuficiente. Actual: ${item.stock_actual}, Solicitado: ${cantidad}`);
        }

        // 2. Calcular nuevo stock
        const nuevoStock = isSalida ? item.stock_actual - cantidad : item.stock_actual + cantidad;

        // 3. Determinar nuevo estado (simple logic)
        let nuevoEstado: InventoryStatus = item.estado;
        if (nuevoStock === 0) nuevoEstado = 'agotado';
        else if (nuevoStock > 0 && item.estado === 'agotado') nuevoEstado = 'disponible';

        // Transaction logic is ideal here, but Supabase JS client doesn't support complex transactions easily without RPC.
        // We will do optimistic updates in sequence for now. Ideally use an RPC function.

        // Insertar Movimiento
        const { data: movData, error: movError } = await supabase
            .from('movimientos_inventario')
            .insert([{
                ...movimiento,
                cantidad: cantidad // Guardamos positivo, el tipo define si suma o resta
            }])
            .select()
            .single();

        if (movError) throw movError;

        // Actualizar Stock de Item
        const { error: updateError } = await supabase
            .from('inventario_medicamentos')
            .update({
                stock_actual: nuevoStock,
                estado: nuevoEstado,
                updated_at: new Date().toISOString()
            })
            .eq('id', movimiento.item_id);

        if (updateError) {
            // Rollback logic is hard here without RPC. 
            // For now, assume consistency or use RPC in future refactor.
            console.error('Error updating stock, but movement recorded:', updateError);
            throw updateError;
        }

        return movData;
    },

    /**
     * Obtener historial de movimientos de un item
     */
    async getMovimientos(itemId: string): Promise<MovimientoInventario[]> {
        const { data, error } = await supabase
            .from('movimientos_inventario')
            .select(`
        *,
        usuario:usuario_id (
          email,
          nombre,
          apellido
        )
      `)
            .eq('item_id', itemId)
            .order('fecha_movimiento', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Obtener estadísticas rápidas
     */
    async getStats(empresaId: string): Promise<InventoryStats> {
        // This heavy logic might be better in an Edge Function or RPC for large datasets
        const { data, error } = await supabase
            .from('inventario_medicamentos')
            .select('id, stock_actual, stock_minimo, fecha_caducidad, precio_unitario')
            .eq('empresa_id', empresaId);

        if (error) throw error;

        const stats: InventoryStats = {
            totalItems: data.length,
            lowStockItems: 0,
            expiredItems: 0,
            totalValue: 0
        };

        const now = new Date();

        data.forEach(item => {
            if (item.stock_actual <= item.stock_minimo) stats.lowStockItems++;
            if (item.fecha_caducidad && new Date(item.fecha_caducidad) < now) stats.expiredItems++;
            if (item.precio_unitario) stats.totalValue += (item.precio_unitario * item.stock_actual);
        });

        return stats;
    },

    /**
     * Obtener Kardex Global (Todos los movimientos)
     */
    async getGlobalMovements(empresaId: string, limit = 100): Promise<MovimientoInventario[]> {
        const { data, error } = await supabase
            .from('movimientos_inventario')
            .select(`
                *,
                item:item_id (
                    nombre_comercial,
                    sku
                ),
                usuario:usuario_id (
                    email
                )
            `)
            // Note: Join syntax depends on foreign key names. Assuming standard naming.
            // If explicit FK needed: item:inventario_medicamentos!item_id (...)
            .eq('empresa_id', empresaId)
            .order('fecha_movimiento', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as any; // Type casting due to join complexity
    }
};
