-- Migration: crear_funciones_seguridad_base
-- Created at: 1762190133

-- =============================================
-- FUNCIONES DE SEGURIDAD BASE
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- Función para obtener empresa del usuario actual (versión mejorada)
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    empresa_uuid UUID;
BEGIN
    -- Primero intentar obtener de profiles
    SELECT empresa_id INTO empresa_uuid 
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Si no está en profiles, intentar obtener de saas_users
    IF empresa_uuid IS NULL THEN
        SELECT empresa_id INTO empresa_uuid 
        FROM saas_users 
        WHERE id = auth.uid();
    END IF;
    
    RETURN empresa_uuid;
END;
$$;

-- Función para verificar si el usuario es super admin (mejorada)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar en la nueva estructura saas
    RETURN EXISTS (
        SELECT 1 FROM saas_user_permissions sup
        JOIN saas_permissions sp ON sup.permission_id = sp.id
        WHERE sup.user_id = auth.uid()
        AND sp.name = 'super_admin'
        AND sup.granted = true
    ) OR
    -- Fallback a la estructura antigua
    EXISTS (
        SELECT 1 FROM usuarios_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.usuario_id = auth.uid()
        AND r.nombre = 'super_admin'
        AND ur.activo = true
    );
END;
$$;

-- Función para verificar rol específico del usuario (mejorada)
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar en la nueva estructura saas
    RETURN EXISTS (
        SELECT 1 FROM saas_user_permissions sup
        JOIN saas_permissions sp ON sup.permission_id = sp.id
        WHERE sup.user_id = auth.uid()
        AND sp.name = role_name
        AND sup.granted = true
    ) OR
    -- Fallback a la estructura antigua
    EXISTS (
        SELECT 1 FROM usuarios_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.usuario_id = auth.uid()
        AND r.nombre = role_name
        AND ur.activo = true
    );
END;
$$;

-- Función para verificar permisos específicos con JSONB
CREATE OR REPLACE FUNCTION has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID := auth.uid();
    user_empresa_id UUID;
    permissions_json JSONB;
BEGIN
    -- Obtener empresa del usuario
    SELECT empresa_id INTO user_empresa_id 
    FROM profiles WHERE id = user_id;
    
    -- Si no está en profiles, intentar saas_users
    IF user_empresa_id IS NULL THEN
        SELECT empresa_id INTO user_empresa_id 
        FROM saas_users WHERE id = user_id;
    END IF;
    
    IF user_empresa_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar permisos desde la configuración JSON del rol
    SELECT r.configuracion->'permissions' INTO permissions_json
    FROM usuarios_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.usuario_id = user_id
    AND r.empresa_id = user_empresa_id
    AND ur.activo = true
    AND r.es_activo = true
    LIMIT 1;
    
    -- Si el JSON existe, verificar el permiso específico
    IF permissions_json IS NOT NULL THEN
        RETURN permissions_json ? resource AND permissions_json->resource ? action;
    END IF;
    
    -- Fallback a verificaciones por rol
    RETURN has_role('admin_empresa') OR 
           has_role('medico_trabajo') OR 
           has_role('medico_industrial');
END;
$$;

-- Función para verificar rol de administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN has_role('admin_empresa') OR has_role('super_admin');
END;
$$;

-- Función para verificar acceso a sede específica
CREATE OR REPLACE FUNCTION has_sede_access(sede_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID := auth.uid();
    user_sede_id UUID;
BEGIN
    -- Admin tiene acceso a todas las sedes
    IF is_admin() THEN
        RETURN true;
    END IF;
    
    -- Verificar si el usuario está asignado a la sede
    SELECT sede_id INTO user_sede_id
    FROM profiles 
    WHERE id = user_id;
    
    RETURN user_sede_id = sede_id_param OR user_sede_id IS NULL;
END;
$$;

-- Función para verificar acceso a paciente específico
CREATE OR REPLACE FUNCTION has_patient_access(paciente_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID := auth.uid();
    user_email TEXT;
    patient_email TEXT;
BEGIN
    -- Admin y personal médico tienen acceso
    IF has_permission('pacientes', 'view') THEN
        RETURN true;
    END IF;
    
    -- Paciente puede ver su propio historial
    SELECT email INTO user_email FROM profiles WHERE id = user_id;
    SELECT email INTO patient_email FROM pacientes WHERE id = paciente_id_param;
    
    RETURN user_email = patient_email AND user_email IS NOT NULL;
END;
$$;

-- Función para validar acceso a catálogos globales
CREATE OR REPLACE FUNCTION validate_catalog_access(table_name TEXT, record_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Catálogos globales (empresa_id NULL) son públicos para lectura
    IF record_empresa_id IS NULL THEN
        RETURN has_permission('catalogs', 'view');
    END IF;
    
    -- Catálogos específicos de empresa requieren acceso a la empresa
    RETURN record_empresa_id = get_user_empresa_id() OR is_admin();
END;
$$;;