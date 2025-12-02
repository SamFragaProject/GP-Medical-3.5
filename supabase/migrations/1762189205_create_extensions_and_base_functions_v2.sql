-- Migration: create_extensions_and_base_functions_v2
-- Created at: 1762189205

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

-- Función simplificada para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(permission_name text)
RETURNS boolean AS $$
BEGIN
  -- Los admins tienen todos los permisos
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- Por ahora todos los usuarios autenticados tienen acceso básico
  -- Se implementará la lógica completa cuando se creen las tablas
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;