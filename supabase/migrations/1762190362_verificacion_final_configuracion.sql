-- Migration: verificacion_final_configuracion
-- Created at: 1762190362

-- =============================================
-- VERIFICACIÓN FINAL DE CONFIGURACIÓN
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- Crear función para verificar configuración de seguridad
CREATE OR REPLACE FUNCTION verificar_configuracion_seguridad()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado TEXT := '';
    rls_count INTEGER := 0;
    storage_count INTEGER := 0;
    bucket_count INTEGER := 0;
BEGIN
    -- Contar políticas RLS
    SELECT COUNT(*) INTO rls_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Contar políticas de Storage
    SELECT COUNT(*) INTO storage_count
    FROM pg_policies 
    WHERE schemaname = 'storage';
    
    -- Contar buckets
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets;
    
    resultado := 'CONFIGURACIÓN DE SEGURIDAD IMPLEMENTADA:' || chr(10);
    resultado := resultado || '- Políticas RLS creadas: ' || rls_count || chr(10);
    resultado := resultado || '- Políticas de Storage creadas: ' || storage_count || chr(10);
    resultado := resultado || '- Buckets configurados: ' || bucket_count || chr(10);
    resultado := resultado || chr(10);
    resultado := resultado || 'BUCKETS:' || chr(10);
    
    -- Mostrar buckets
    FOR bucket_count IN 
        SELECT name, public, file_size_limit
        FROM storage.buckets
        ORDER BY name
    LOOP
        resultado := resultado || '- ' || bucket_count.name || ' (Público: ' || bucket_count.public || ', Tamaño: ' || ROUND(bucket_count.file_size_limit / 1024.0 / 1024.0, 2) || ' MB)' || chr(10);
    END LOOP;
    
    resultado := resultado || chr(10);
    resultado := resultado || 'FUNCIONES DE SEGURIDAD:' || chr(10);
    resultado := resultado || '- get_user_empresa_id()' || chr(10);
    resultado := resultado << '- is_super_admin()' || chr(10);
    resultado := resultado << '- has_permission(resource, action)' || chr(10);
    resultado := resultado << '- has_role(role_name)' || chr(10);
    resultado := resultado << '- is_admin()' || chr(10);
    
    RETURN resultado;
END;
$$;

-- Ejecutar verificación
DO $$
DECLARE
    config_info TEXT;
BEGIN
    config_info := verificar_configuracion_seguridad();
    RAISE NOTICE '%', config_info;
END $$;;