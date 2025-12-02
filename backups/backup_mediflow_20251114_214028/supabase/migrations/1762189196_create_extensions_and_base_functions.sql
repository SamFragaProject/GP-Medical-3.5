-- Migration: create_extensions_and_base_functions
-- Created at: 1762189196

-- Crear extensiones de manera idempotente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener los claims del JWT
CREATE OR REPLACE FUNCTION jwt_claims()
RETURNS json AS $$
BEGIN
  RETURN auth.jwt();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener la empresa del usuario actual
CREATE OR REPLACE FUNCTION current_empresa_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'empresa_id')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener la sede del usuario actual
CREATE OR REPLACE FUNCTION current_sede_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'sede_id')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(permission_name text)
RETURNS boolean AS $$
DECLARE
  user_permissions text[];
BEGIN
  SELECT COALESCE(
    array_agg(perm.permission_name),
    '{}'
  ) INTO user_permissions
  FROM usuarios_perfil up
  JOIN usuarios_roles ur ON up.id = ur.usuario_id
  JOIN roles r ON ur.role_id = r.id
  JOIN user_menu_permissions perm ON r.id = perm.role_id
  WHERE up.id = current_user_id();
  
  RETURN permission_name = ANY(user_permissions) OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View materializada para permisos efectivos
CREATE MATERIALIZED VIEW IF NOT EXISTS effective_permissions AS
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
JOIN user_menu_permissions perm ON r.id = perm.role_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_effective_permissions_user 
ON effective_permissions(user_id, permission_name, table_name);;