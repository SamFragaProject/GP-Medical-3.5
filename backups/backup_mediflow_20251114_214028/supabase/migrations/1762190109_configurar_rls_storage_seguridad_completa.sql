-- Migration: configurar_rls_storage_seguridad_completa
-- Created at: 1762190109

-- =============================================
-- CONFIGURACIÓN RLS Y STORAGE BUCKETS COMPLETA
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- =============================================
-- FUNCIONES DE SEGURIDAD AVANZADAS
-- =============================================

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

-- =============================================
-- HABILITAR RLS EN TABLAS CLÍNICAS NUEVAS
-- =============================================

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuentros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimientos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS PARA CITAS
-- =============================================

CREATE POLICY "Ver citas de empresa/sede" ON citas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('citas', 'view')
    );

CREATE POLICY "Crear citas con permisos" ON citas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'create')
    );

CREATE POLICY "Actualizar citas con permisos" ON citas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'edit')
    );

CREATE POLICY "Eliminar citas con permisos" ON citas
    FOR DELETE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'delete')
    );

-- =============================================
-- POLÍTICAS RLS PARA ENCUENTROS
-- =============================================

CREATE POLICY "Ver encuentros de empresa/sede" ON encuentros
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('encuentros', 'view')
    );

CREATE POLICY "Crear encuentros con permisos" ON encuentros
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('encuentros', 'create')
    );

CREATE POLICY "Actualizar encuentros con permisos" ON encuentros
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('encuentros', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA NOTAS CLÍNICAS
-- =============================================

CREATE POLICY "Ver notas clínicas" ON notas_clinicas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('notas_clinicas', 'view')
    );

CREATE POLICY "Crear notas clínicas" ON notas_clinicas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        doctor_id = auth.uid() AND
        has_permission('notas_clinicas', 'create')
    );

CREATE POLICY "Actualizar notas clínicas" ON notas_clinicas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        (doctor_id = auth.uid() OR has_permission('notas_clinicas', 'edit'))
    );

-- =============================================
-- POLÍTICAS RLS PARA RECETAS
-- =============================================

CREATE POLICY "Ver recetas de empresa/sede" ON recetas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('recetas', 'view')
    );

CREATE POLICY "Crear recetas con permisos" ON recetas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('recetas', 'create')
    );

CREATE POLICY "Actualizar recetas con permisos" ON recetas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('recetas', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA ÓRDENES DE ESTUDIO
-- =============================================

CREATE POLICY "Ver órdenes de estudio" ON ordenes_estudio
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('ordenes_estudio', 'view')
    );

CREATE POLICY "Crear órdenes de estudio" ON ordenes_estudio
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('ordenes_estudio', 'create')
    );

CREATE POLICY "Actualizar órdenes de estudio" ON ordenes_estudio
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('ordenes_estudio', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA RESULTADOS DE ESTUDIO
-- =============================================

CREATE POLICY "Ver resultados de estudio" ON resultados_estudio
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'view')
    );

CREATE POLICY "Crear resultados de estudio" ON resultados_estudio
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'create')
    );

CREATE POLICY "Actualizar resultados de estudio" ON resultados_estudio
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA DOCUMENTOS
-- =============================================

CREATE POLICY "Ver documentos de empresa/paciente" ON documentos
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        has_patient_access(paciente_id) AND
        has_permission('documentos', 'view')
    );

CREATE POLICY "Crear documentos con permisos" ON documentos
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_patient_access(paciente_id) AND
        has_permission('documentos', 'create')
    );

CREATE POLICY "Actualizar documentos con permisos" ON documentos
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('documentos', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA CONSENTIMIENTOS
-- =============================================

CREATE POLICY "Ver consentimientos de empresa/paciente" ON consentimientos
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        has_patient_access(paciente_id) AND
        has_permission('consentimientos', 'view')
    );

CREATE POLICY "Crear consentimientos con permisos" ON consentimientos
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_patient_access(paciente_id) AND
        has_permission('consentimientos', 'create')
    );

CREATE POLICY "Actualizar consentimientos con permisos" ON consentimientos
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('consentimientos', 'edit')
    );

-- =============================================
-- VALIDACIÓN EMPRESA_ID EN CATÁLOGOS GLOBALES
-- =============================================

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
$$;

-- =============================================
-- EXCEPCIÓN PARA ADMINISTRADORES
-- =============================================

-- Políticas de excepción para super_admin en todas las tablas
CREATE POLICY "Super admin acceso total citas" ON citas
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total encuentros" ON encuentros
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total notas_clinicas" ON notas_clinicas
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total recetas" ON recetas
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total ordenes_estudio" ON ordenes_estudio
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total resultados_estudio" ON resultados_estudio
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total documentos" ON documentos
    FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin acceso total consentimientos" ON consentimientos
    FOR ALL USING (is_super_admin());;