-- Migration: create_inventory_indexes_correct
-- Created at: 1762189505

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_sede_id ON productos(sede_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Índices para lotes
CREATE INDEX IF NOT EXISTS idx_lotes_empresa_id ON lotes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_id ON lotes(producto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_numero ON lotes(numero_lote);
CREATE INDEX IF NOT EXISTS idx_lotes_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON lotes(estado);

-- Índices para movimientos_inventario (usando nombres reales)
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_id ON movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_lote_id ON movimientos_inventario(lote_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_tipo ON movimientos_inventario(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_usuario_id ON movimientos_inventario(realizado_por);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha ON movimientos_inventario(created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_referencia ON movimientos_inventario(referencia_id, referencia_tipo);;