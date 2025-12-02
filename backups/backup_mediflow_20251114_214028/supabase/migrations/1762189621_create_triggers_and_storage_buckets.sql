-- Migration: create_triggers_and_storage_buckets
-- Created at: 1762189621

-- Función para establecer defaults de tenant
CREATE OR REPLACE FUNCTION set_default_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no se especifica empresa_id, usar la del usuario actual
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := current_empresa_id();
  END IF;
  
  -- Si no se especifica sede_id, usar la del usuario actual  
  IF NEW.sede_id IS NULL THEN
    NEW.sede_id := current_sede_id();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar inventario después de movimientos
CREATE OR REPLACE FUNCTION inventario_after_mov()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es un lote, actualizar cantidad del lote
  IF TG_TABLE_NAME = 'movimientos_inventario' AND NEW.lote_id IS NOT NULL THEN
    UPDATE lotes 
    SET cantidad_actual = cantidad_actual + NEW.cantidad,
        updated_at = NOW()
    WHERE id = NEW.lote_id;
  END IF;
  
  -- Actualizar stock del producto si existe producto_id o se puede obtener del lote
  IF NEW.producto_id IS NOT NULL THEN
    UPDATE productos 
    SET stock_actual = (
      SELECT COALESCE(SUM(cantidad_actual), 0) 
      FROM lotes 
      WHERE producto_id = NEW.producto_id AND activo = true
    ),
    updated_at = NOW()
    WHERE id = NEW.producto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar resultados
CREATE OR REPLACE FUNCTION resultado_notifica()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es un resultado nuevo o modificado, insertar en auditoría
  INSERT INTO auditoria (empresa_id, accion, tabla_afectada, registro_id, registro_nuevo)
  VALUES (
    COALESCE(NEW.empresa_id, (SELECT empresa_id FROM ordenes_estudio WHERE id = NEW.orden_estudio_id)),
    'CREATE',
    'resultados_estudio',
    NEW.id,
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS APLICADOS A TODAS LAS TABLAS PRINCIPALES
CREATE TRIGGER set_default_tenant_trigger_usuarios_perfil
  BEFORE INSERT OR UPDATE ON usuarios_perfil
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER set_default_tenant_trigger_pacientes
  BEFORE INSERT OR UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER set_default_tenant_trigger_citas
  BEFORE INSERT OR UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER set_default_tenant_trigger_encuentros
  BEFORE INSERT OR UPDATE ON encuentros
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER inventario_after_mov_trigger
  AFTER INSERT OR UPDATE ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION inventario_after_mov();

CREATE TRIGGER resultado_notifica_trigger
  AFTER INSERT OR UPDATE ON resultados_estudio
  FOR EACH ROW EXECUTE FUNCTION resultado_notifica();

-- ACTUALIZAR VIEW MATERIALIZADA DE PERMISOS
DROP MATERIALIZED VIEW IF EXISTS effective_permissions;
CREATE MATERIALIZED VIEW effective_permissions AS
SELECT 
  up.id as user_id,
  up.empresa_id,
  up.sede_id,
  perm.permission_name,
  perm.table_name,
  perm.operation,
  perm.condition_expression
FROM usuarios_perfil up
JOIN usuarios_roles ur ON up.id = ur.usuario_id
JOIN roles r ON ur.role_id = r.id
JOIN user_menu_permissions perm ON r.id = perm.role_id
WHERE up.activo = true AND ur.activo = true AND r.es_activo = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_effective_permissions_user 
ON effective_permissions(user_id, permission_name, table_name);

-- REFRESH DE LA VIEW MATERIALIZADA
REFRESH MATERIALIZED VIEW CONCURRENTLY effective_permissions;;