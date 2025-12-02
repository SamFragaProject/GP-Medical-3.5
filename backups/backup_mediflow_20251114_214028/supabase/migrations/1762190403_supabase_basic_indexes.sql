-- Migration: supabase_basic_indexes
-- Created at: 1762190403

-- =============================================================================
-- ÍNDICES BÁSICOS
-- =============================================================================

-- Índices para empresas y sedes
CREATE INDEX IF NOT EXISTS idx_empresas_activa ON empresas(activa);
CREATE INDEX IF NOT EXISTS idx_sedes_empresa ON sedes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);

-- Índices para usuarios_perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_sede ON usuarios_perfil(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_estado ON usuarios_perfil(estado);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_empresa ON roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role ON usuarios_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_role ON user_menu_permissions(role_id);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_user_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_empresa_sede_fecha ON citas(empresa_id, sede_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- Índices para órdenes de cobro
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_sede_estado ON ordenes_cobro(empresa_id, sede_id, estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_paciente ON ordenes_cobro(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha ON ordenes_cobro(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_numero ON ordenes_cobro(numero_orden);

-- Índices para inventario
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_sede ON movimientos_inventario(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_vencimiento ON lotes(producto_id, fecha_vencimiento);

-- Índices para CRM
CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_estado ON tareas_crm(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_asignado ON tareas_crm(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_vencimiento ON tareas_crm(fecha_vencimiento);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON auditoria(empresa_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla_afectada, registro_id);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

SELECT 'Índices básicos aplicados exitosamente' as status, now() as timestamp;;