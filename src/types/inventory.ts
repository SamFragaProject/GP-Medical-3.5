export type InventoryStatus = 'disponible' | 'agotado' | 'caducado' | 'cuarentena';
export type MovementType = 'entrada_compra' | 'salida_receta' | 'salida_ajuste' | 'entrada_ajuste' | 'merma';

export interface InventarioItem {
    id: string;
    empresa_id: string;
    sku: string | null;
    nombre_comercial: string;
    nombre_generico: string | null;
    presentacion: string | null;
    lote: string | null;
    fecha_caducidad: string | null; // ISO Date string
    stock_actual: number;
    stock_minimo: number;
    precio_unitario: number | null;
    precio_venta: number | null;
    ubicacion_almacen: string | null;
    estado: InventoryStatus;
    created_at?: string;
    updated_at?: string;
}

export interface MovimientoInventario {
    id: string;
    empresa_id: string;
    item_id: string;
    tipo_movimiento: MovementType;
    cantidad: number;
    referencia_id: string | null;
    origen_ref: string | null;
    usuario_id: string | null;
    observaciones: string | null;
    fecha_movimiento: string;
    // Joins
    item?: InventarioItem;
    usuario?: {
        email: string;
        nombre: string;
        apellido: string;
    };
}

export interface InventoryStats {
    totalItems: number;
    lowStockItems: number;
    expiredItems: number;
    totalValue: number;
}
