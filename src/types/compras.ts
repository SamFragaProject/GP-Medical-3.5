export interface Proveedor {
    id: string
    empresa_id: string
    nombre_comercial: string
    razon_social?: string
    rfc?: string
    contacto_nombre?: string
    contacto_email?: string
    contacto_telefono?: string
    direccion?: string
    dias_credito?: number // 0 = Contado
    activo: boolean
    rating?: number // Virtual field, maybe calculated later
}

export interface OrdenCompra {
    id: string
    empresa_id: string
    proveedor_id: string
    proveedor?: Proveedor // Join
    usuario_creador_id: string
    folio?: string
    fecha_emision: string
    fecha_entrega_estimada: string
    estado: 'borrador' | 'enviada' | 'recibida_parcial' | 'completada' | 'cancelada'
    observaciones?: string
    total_estimado: number
    items?: DetalleOrdenCompra[]
}

export interface DetalleOrdenCompra {
    id: string
    orden_id: string
    inventario_id: string
    nombre_producto?: string // Para visualización si no se ha unido
    cantidad_solicitada: number
    cantidad_recibida: number
    costo_unitario: number
    total?: number // Calculado
}

export interface RecepcionMercanciaParams {
    orden_id: string
    items_recibidos: {
        inventario_id: string
        cantidad: number
    }[]
}
