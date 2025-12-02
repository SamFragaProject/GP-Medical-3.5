-- Migration: supabase_extensions_basic_functions
-- Created at: 1762190299

-- =============================================================================
-- EXTENSIONES Y FUNCIONES BÁSICAS
-- =============================================================================

-- Extensiones idempotentes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Función para obtener ID del usuario actual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Función para obtener JWT claims actuales
CREATE OR REPLACE FUNCTION jwt_claims()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::json;
$$;

-- Función para obtener empresa_id actual
CREATE OR REPLACE FUNCTION current_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (jwt_claims() ->> 'empresa_id')::uuid;
$$;

-- Función para obtener sede_id actual
CREATE OR REPLACE FUNCTION current_sede_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (jwt_claims() ->> 'sede_id')::uuid;
$$;

-- Función simplificada para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin(empresa_id_param uuid, sede_id_param uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios_perfil up
    JOIN usuarios_roles ur ON up.id = ur.usuario_id
    JOIN roles r ON ur.role_id = r.id
    WHERE up.user_id = current_user_id()
    AND up.empresa_id = empresa_id_param
    AND (sede_id_param IS NULL OR up.sede_id = sede_id_param)
    AND r.nombre = 'admin'
  );
$$;

-- Función simplificada para verificar permisos (solo admin)
CREATE OR REPLACE FUNCTION has_permission(
  resource_param text,
  action_param text,
  empresa_param uuid,
  sede_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT is_admin(empresa_param, sede_param);
$$;

SELECT 'Extensiones y funciones básicas aplicadas exitosamente' as status, now() as timestamp;;