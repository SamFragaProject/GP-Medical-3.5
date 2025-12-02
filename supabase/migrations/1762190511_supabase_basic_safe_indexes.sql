-- Migration: supabase_basic_safe_indexes
-- Created at: 1762190511

-- =============================================================================
-- ÍNDICES BÁSICOS SEGUROS
-- =============================================================================

-- Índices básicos para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_sede_id ON pacientes(sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);

CREATE INDEX IF NOT EXISTS idx_citas_empresa_id ON citas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_citas_sede_id ON citas(sede_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_id ON ordenes_cobro(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_sede_id ON ordenes_cobro(sede_id);

CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_id ON lotes(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_id ON movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_sede_id ON movimientos_inventario(sede_id);

CREATE INDEX IF NOT EXISTS idx_campañas_empresa_id ON campañas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_id ON tareas_crm(empresa_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_id ON auditoria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_user_id ON auditoria(user_id);

CREATE INDEX IF NOT EXISTS idx_webhooks_empresa_id ON webhooks(empresa_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_id ON usuarios_perfil(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_sede_id ON usuarios_perfil(sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);

CREATE INDEX IF NOT EXISTS idx_roles_empresa_id ON roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario_id ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role_id ON usuarios_roles(role_id);

-- Índices de fecha para mejorar consultas de tiempo
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha_orden ON ordenes_cobro(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha_movimiento ON movimientos_inventario(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp_evento ON auditoria(timestamp_evento);

SELECT '✅ Migración multi-tenant COMPLETADA con índices básicos' as status, now() as timestamp;;