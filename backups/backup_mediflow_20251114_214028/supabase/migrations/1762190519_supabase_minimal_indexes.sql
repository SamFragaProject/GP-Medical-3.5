-- Migration: supabase_minimal_indexes
-- Created at: 1762190519

-- =============================================================================
-- ÍNDICES MÍNIMOS NECESARIOS
-- =============================================================================

-- Solo índices en columnas básicas que deben existir
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);

CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_id ON ordenes_cobro(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha_orden ON ordenes_cobro(fecha_orden);

CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);

CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_id ON movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha_movimiento ON movimientos_inventario(fecha_movimiento);

CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_id ON auditoria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp_evento ON auditoria(timestamp_evento);

CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_id ON usuarios_perfil(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);

CREATE INDEX IF NOT EXISTS idx_roles_empresa_id ON roles(empresa_id);

SELECT '✅ Migración multi-tenant COMPLETADA exitosamente' as status, now() as timestamp;;