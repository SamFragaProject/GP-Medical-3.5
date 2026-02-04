-- OPTIMIZATION: Performance Indexes
-- Fecha: 26 Enero 2026

-- 1. Optimización de Inventario (Eje 13)
CREATE INDEX IF NOT EXISTS idx_inventario_empresa ON public.inventario_medicamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inventario_stock ON public.inventario_medicamentos(stock_actual); -- Para filtrar agotados rapido

CREATE INDEX IF NOT EXISTS idx_movimientos_empresa ON public.movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_item ON public.movimientos_inventario(item_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.movimientos_inventario(fecha_movimiento DESC); -- Para el Kardex y ordenamiento

-- 2. Optimización de Compras (Eje 14)
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON public.proveedores(empresa_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_empresa ON public.ordenes_compra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_proveedor ON public.ordenes_compra(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON public.ordenes_compra(fecha_emision DESC);

CREATE INDEX IF NOT EXISTS idx_detalle_orden_orden ON public.detalles_orden_compra(orden_id);
CREATE INDEX IF NOT EXISTS idx_detalle_orden_item ON public.detalles_orden_compra(inventario_id);
