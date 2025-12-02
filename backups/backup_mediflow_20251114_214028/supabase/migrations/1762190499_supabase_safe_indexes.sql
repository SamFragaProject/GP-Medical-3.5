-- Migration: supabase_safe_indexes
-- Created at: 1762190499

-- =============================================================================
-- ÍNDICES SEGUROS CON COLUMNAS CONFIRMADAS
-- =============================================================================

-- Índices para empresas y sedes
CREATE INDEX IF NOT EXISTS idx_empresas_activa ON empresas(activa);
CREATE INDEX IF NOT EXISTS idx_sedes_empresa ON sedes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);

-- Índices para usuarios_perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_sede ON usuarios_perfil(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_empresa ON roles(empresa_id);

-- Índices para usuarios_roles
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role ON usuarios_roles(role_id);

-- Índices para user_menu_permissions
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_role ON user_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_table ON user_menu_permissions(table_name);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_path ON user_menu_permissions(menu_path);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_sede ON pacientes(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombres_apellidos ON pacientes(nombres, apellidos);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON pacientes(activo);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_user_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_empresa_sede_fecha ON citas(empresa_id, sede_id, fecha_hora);

-- Índices para ordenes_cobro
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_sede ON ordenes_cobro(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_paciente ON ordenes_cobro(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha ON ordenes_cobro(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_numero ON ordenes_cobro(numero_orden);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);

-- Índices para lotes
CREATE INDEX IF NOT EXISTS idx_lotes_producto ON lotes(producto_id);

-- Índices para movimientos_inventario
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_sede ON movimientos_inventario(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha ON movimientos_inventario(fecha_movimiento);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON auditoria(empresa_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla_afectada);

SELECT '✅ Índices seguros aplicados exitosamente' as status, now() as timestamp;;