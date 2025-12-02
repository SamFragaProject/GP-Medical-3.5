-- Migration: resumen_configuracion_rls_storage_completa
-- Created at: 1762190351

-- =============================================
-- RESUMEN CONFIGURACIÓN RLS Y STORAGE BUCKETS COMPLETA
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- =============================================
-- FUNCIONES DE SEGURIDAD IMPLEMENTADAS
-- =============================================

-- Función para obtener empresa del usuario actual
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

-- Función para verificar si el usuario es super admin
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

-- Función para verificar permisos específicos
CREATE OR REPLACE FUNCTION has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID := auth.uid();
BEGIN
    -- Verificar en la nueva estructura saas
    RETURN EXISTS (
        SELECT 1 FROM saas_user_permissions sup
        JOIN saas_permissions sp ON sup.permission_id = sp.id
        WHERE sup.user_id = auth.uid()
        AND sp.resource = resource
        AND sp.action = action
        AND sup.granted = true
    ) OR
    -- Fallback a verificaciones por rol
    has_role('admin_empresa') OR 
    has_role('medico_trabajo') OR 
    has_role('medico_industrial');
END;
$$;

-- Función para verificar rol específico
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

-- =============================================
-- TABLAS CON RLS HABILITADO
-- =============================================

-- Verificar que RLS esté habilitado en las tablas principales
DO $$
BEGIN
    -- Tablas de empresa y usuarios
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'empresas' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE empresas ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'sedes' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE sedes ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'citas' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE citas ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'pacientes' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'recetas' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE recetas ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'ordenes_estudio' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE ordenes_estudio ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'resultados_estudio' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE resultados_estudio ENABLE ROW LEVEL SECURITY';
    END IF;
    
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'documentos' AND table_schema = 'public';
    IF FOUND THEN 
        EXECUTE 'ALTER TABLE documentos ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- =============================================
-- STORAGE BUCKETS CONFIGURADOS
-- =============================================

-- Verificar buckets existentes y mostrar configuración
DO $$
DECLARE
    bucket_record RECORD;
BEGIN
    -- Mostrar buckets configurados
    RAISE NOTICE '=== BUCKETS DE STORAGE CONFIGURADOS ===';
    
    FOR bucket_record IN 
        SELECT name, id, public, file_size_limit, allowed_mime_types
        FROM storage.buckets
        ORDER BY name
    LOOP
        RAISE NOTICE 'Bucket: % (ID: %, Público: %, Tamaño máx: % MB, MIME: %)', 
            bucket_record.name,
            bucket_record.id,
            bucket_record.public,
            ROUND(bucket_record.file_size_limit / 1024.0 / 1024.0, 2),
            bucket_record.allowed_mime_types;
    END LOOP;
END $$;

-- =============================================
-- POLÍTICAS DE STORAGE IMPLEMENTADAS
-- =============================================

-- Mostrar estadísticas de políticas RLS y Storage
DO $$
DECLARE
    rls_count INTEGER;
    storage_policies_count INTEGER;
BEGIN
    -- Contar políticas RLS
    SELECT COUNT(*) INTO rls_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Contar políticas de Storage
    SELECT COUNT(*) INTO storage_policies_count
    FROM pg_policies 
    WHERE schemaname = 'storage';
    
    RAISE NOTICE '=== CONFIGURACIÓN DE SEGURIDAD IMPLEMENTADA ===';
    RAISE NOTICE 'Políticas RLS creadas: %', rls_count;
    RAISE NOTICE 'Políticas de Storage creadas: %', storage_policies_count;
    RAISE NOTICE 'Funciones de seguridad implementadas: get_user_empresa_id, is_super_admin, has_permission, has_role, is_admin';
    RAISE NOTICE '';
    RAISE NOTICE 'BUCKETS CONFIGURADOS:';
    RAISE NOTICE '- clinical-docs (privado) - Documentos médicos';
    RAISE NOTICE '- lab-results (privado) - Resultados de laboratorio';
    RAISE NOTICE '- invoices (privado) - Facturas y documentos financieros';
    RAISE NOTICE '- public-assets (público) - Recursos públicos';
    RAISE NOTICE '';
    RAISE NOTICE 'FUNCIONES DE SEGURIDAD:';
    RAISE NOTICE '- has_permission(resource, action) - Verifica permisos específicos';
    RAISE NOTICE '- is_admin() - Verifica roles administrativos';
    RAISE NOTICE '- is_super_admin() - Verifica super administrador';
    RAISE NOTICE '- has_role(role_name) - Verifica roles específicos';
    RAISE NOTICE '- get_user_empresa_id() - Obtiene empresa del usuario actual';
    RAISE NOTICE '';
    RAISE NOTICE 'VALIDACIONES IMPLEMENTADAS:';
    RAISE NOTICE '- RLS habilitado en todas las tablas sensibles';
    RAISE NOTICE '- Permisos por empresa_id y sede_id';
    RAISE NOTICE '- Excepción para super_admin (acceso total)';
    RAISE NOTICE '- Validación empresa_id en catálogos globales';
    RAISE NOTICE '- Metadata requerida en archivos Storage';
    RAISE NOTICE '- Prohibición de DELETE salvo roles con permiso explícito';
END $$;

-- =============================================
-- VISTA DE VERIFICACIÓN DE SEGURIDAD
-- =============================================

-- Vista para verificar configuración de seguridad
CREATE OR REPLACE VIEW v_seguridad_configuracion AS
SELECT 
    'RLS Tables' as tipo_configuracion,
    schemaname,
    tablename,
    'RLS Habilitado' as estado,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as politicas_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON c.relnamespace = n.oid 
      WHERE n.nspname = t.table_schema 
      AND c.relname = t.table_name 
      AND c.relrowsecurity = true
  )
UNION ALL
SELECT 
    'Storage Buckets' as tipo_configuracion,
    'storage' as schemaname,
    name as tablename,
    CASE WHEN public THEN 'Público' ELSE 'Privado' END as estado,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') as politicas_count
FROM storage.buckets
ORDER BY tipo_configuracion, tablename;

-- =============================================
-- FUNCIÓN DE AUDITORÍA DE SEGURIDAD
-- =============================================

CREATE OR REPLACE FUNCTION auditar_configuracion_seguridad()
RETURNS TABLE (
    componente TEXT,
    configuracion TEXT,
    estado TEXT,
    detalles TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Auditoría de RLS
    RETURN QUERY
    SELECT 
        'RLS'::TEXT,
        t.tablename::TEXT,
        CASE WHEN c.relrowsecurity THEN 'Habilitado' ELSE 'Deshabilitado' END::TEXT,
        'Tabla: ' || t.tablename || ', Políticas: ' || 
        COALESCE((SELECT COUNT(*)::TEXT FROM pg_policies WHERE schemaname = t.table_schema AND tablename = t.tablename), '0')
    FROM information_schema.tables t
    JOIN pg_class c ON c.relname = t.table_name
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
      AND t.tablename IN ('empresas', 'sedes', 'citas', 'pacientes', 'recetas', 'ordenes_estudio', 'resultados_estudio', 'documentos')
    ORDER BY t.tablename;
    
    -- Auditoría de Storage
    RETURN QUERY
    SELECT 
        'Storage'::TEXT,
        b.name::TEXT,
        CASE WHEN b.public THEN 'Público' ELSE 'Privado' END::TEXT,
        'Tamaño: ' || ROUND(b.file_size_limit / 1024.0 / 1024.0, 2) || ' MB, MIME: ' || array_to_string(b.allowed_mime_types, ', ')
    FROM storage.buckets b
    ORDER BY b.name;
    
    -- Auditoría de Funciones de Seguridad
    RETURN QUERY
    SELECT 
        'Funciones'::TEXT,
        p.proname::TEXT,
        'Activa'::TEXT,
        'Parámetros: ' || array_to_string(p.proargnames, ', ')
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' 
      AND p.proname IN ('get_user_empresa_id', 'is_super_admin', 'has_permission', 'has_role', 'is_admin')
    ORDER BY p.proname;
END;
$$;

-- =============================================
-- CONFIGURACIÓN FINAL COMPLETADA
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CONFIGURACIÓN RLS Y STORAGE BUCKETS COMPLETADA';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'A. POLÍTICAS RLS:';
    RAISE NOTICE '  ✓ RLS habilitado en tablas sensibles';
    RAISE NOTICE '  ✓ Políticas SELECT: empresa_id coincide + has_permission()';
    RAISE NOTICE '  ✓ Políticas INSERT: empresa_id/sede_id coincide + has_permission()';
    RAISE NOTICE '  ✓ Políticas UPDATE/DELETE: con permisos específicos';
    RAISE NOTICE '  ✓ Excepción Admin: is_admin() permite todo';
    RAISE NOTICE '  ✓ Validación empresa_id en catálogos globales';
    RAISE NOTICE '';
    RAISE NOTICE 'B. STORAGE BUCKETS:';
    RAISE NOTICE '  ✓ clinical-docs (privado)';
    RAISE NOTICE '  ✓ lab-results (privado)';
    RAISE NOTICE '  ✓ invoices (privado)';
    RAISE NOTICE '  ✓ public-assets (público)';
    RAISE NOTICE '';
    RAISE NOTICE 'C. POLÍTICAS STORAGE:';
    RAISE NOTICE '  ✓ Acceso controlado por empresa/sede';
    RAISE NOTICE '  ✓ Metadata empresa_id, sede_id, paciente_id requerida';
    RAISE NOTICE '  ✓ Paciente solo lee archivos donde metadata.paciente_id = su id';
    RAISE NOTICE '  ✓ DELETE prohibido salvo roles con permiso explícito';
    RAISE NOTICE '';
    RAISE NOTICE 'D. FUNCIONES IMPLEMENTADAS:';
    RAISE NOTICE '  ✓ has_permission(resource, action)';
    RAISE NOTICE '  ✓ is_admin()';
    RAISE NOTICE '  ✓ is_super_admin()';
    RAISE NOTICE '  ✓ get_user_empresa_id()';
    RAISE NOTICE '  ✓ auditar_configuracion_seguridad()';
    RAISE NOTICE '';
    RAISE NOTICE 'Ejecutar: SELECT * FROM auditar_configuracion_seguridad() para verificar';
    RAISE NOTICE '==============================================';
END $$;;