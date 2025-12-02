-- Migration: supabase_final_indexes
-- Created at: 1762190479

-- =============================================================================
-- ÍNDICES FINALES OPTIMIZADOS
-- =============================================================================

-- Índices para empresas y sedes
CREATE INDEX IF NOT EXISTS idx_empresas_activa ON empresas(activa);
CREATE INDEX IF NOT EXISTS idx_sedes_empresa ON sedes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);

-- Índices para usuarios_perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_sede ON usuarios_perfil(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_estado ON usuarios_perfil(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_nombre_apellidos ON usuarios_perfil(nombre, apellidos);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_empresa ON roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_nombre ON roles(nombre);

-- Índices para usuarios_roles
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role ON usuarios_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_activo ON usuarios_roles(activo);

-- Índices para user_menu_permissions
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_role ON user_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_table ON user_menu_permissions(table_name);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_operation ON user_menu_permissions(operation);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_path ON user_menu_permissions(menu_path);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_sede ON pacientes(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_numero ON pacientes(numero_paciente);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellidos ON pacientes(nombre, apellidos);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_user_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_empresa_sede_fecha ON citas(empresa_id, sede_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- Índices para encuentros
CREATE INDEX IF NOT EXISTS idx_encuentros_paciente ON encuentros(paciente_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_medico ON encuentros(medico_user_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_cita ON encuentros(cita_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_fecha ON encuentros(fecha_inicio);

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
CREATE INDEX IF NOT EXISTS idx_lotes_fecha_vencimiento ON lotes(fecha_vencimiento);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Índices para CRM
CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_estado ON tareas_crm(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_asignado ON tareas_crm(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_vencimiento ON tareas_crm(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_paciente ON tareas_crm(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_prioridad ON tareas_crm(prioridad);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON auditoria(empresa_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_user_fecha ON auditoria(user_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);

-- Índices para campañas
CREATE INDEX IF NOT EXISTS idx_campañas_empresa ON campañas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campañas_estado ON campañas(estado);
CREATE INDEX IF NOT EXISTS idx_campañas_fecha_inicio ON campañas(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_campañas_tipo ON campañas(tipo_campaña);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_mensajes_campaña ON mensajes(campaña_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_paciente ON mensajes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_estado ON mensajes(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha_envio ON mensajes(fecha_envio);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_empresa ON webhooks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_activo ON webhooks(activo);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha ON documentos(fecha_documento);

-- Índices para recetas
CREATE INDEX IF NOT EXISTS idx_recetas_encuentro ON recetas(encuentro_id);
CREATE INDEX IF NOT EXISTS idx_recetas_paciente ON recetas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recetas_medico ON recetas(medico_user_id);
CREATE INDEX IF NOT EXISTS idx_recetas_estado ON recetas(estado);

SELECT '✅ Índices finales aplicados exitosamente' as status, now() as timestamp;;