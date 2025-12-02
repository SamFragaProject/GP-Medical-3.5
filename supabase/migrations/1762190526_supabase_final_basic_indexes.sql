-- Migration: supabase_final_basic_indexes
-- Created at: 1762190526

-- =============================================================================
-- ÍNDICES BÁSICOS FINALES
-- =============================================================================

-- Solo índices en columnas de ID que deben existir
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_id ON ordenes_cobro(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_id ON auditoria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_id ON usuarios_perfil(empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_empresa_id ON roles(empresa_id);

SELECT '✅ Migración multi-tenant COMPLETADA exitosamente' as status, now() as timestamp;;