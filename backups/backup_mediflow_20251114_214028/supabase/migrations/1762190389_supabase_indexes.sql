-- Migration: supabase_indexes
-- Created at: 1762190389

-- =============================================================================
-- ÍNDICES RECOMENDADOS
-- =============================================================================

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellidos ON pacientes(nombre, apellidos);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_sede ON pacientes(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(numero_documento);

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

-- Índices para usuarios_perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_sede ON usuarios_perfil(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON auditoria(empresa_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_user_fecha ON auditoria(user_id, timestamp_evento);

-- Índices para CRM
CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_estado ON tareas_crm(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_asignado ON tareas_crm(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_vencimiento ON tareas_crm(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_paciente ON tareas_crm(paciente_id);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);

-- Índices para campañas
CREATE INDEX IF NOT EXISTS idx_campañas_empresa ON campañas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campañas_estado ON campañas(estado);
CREATE INDEX IF NOT EXISTS idx_campañas_fecha_inicio ON campañas(fecha_inicio);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_mensajes_campaña ON mensajes(campaña_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_paciente ON mensajes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_estado ON mensajes(estado);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_empresa ON webhooks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_activo ON webhooks(activo);

SELECT 'Índices aplicados exitosamente' as status, now() as timestamp;;