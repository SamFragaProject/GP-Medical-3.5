-- Migration: politicas_storage_corregidas
-- Created at: 1762190240

-- =============================================
-- POLÍTICAS DE STORAGE BUCKETS (CORREGIDAS)
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- =============================================
-- POLÍTICAS DE STORAGE - BUCKET clinical-docs
-- =============================================

-- Política para leer documentos clínicos
CREATE POLICY "ver_documentos_clinicos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'clinical-docs' AND
        (
            -- Admin y personal médico tienen acceso
            is_admin() OR
            has_permission('documentos', 'view')
        )
    );

-- Política para subir documentos clínicos
CREATE POLICY "subir_documentos_clinicos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'clinical-docs' AND
        (
            is_admin() OR
            has_permission('documentos', 'create')
        )
    );

-- Política para actualizar documentos clínicos
CREATE POLICY "actualizar_documentos_clinicos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'clinical-docs' AND
        (
            is_admin() OR
            has_permission('documentos', 'edit')
        )
    );

-- Prohibir eliminación salvo roles con permiso explícito
CREATE POLICY "prohibir_eliminacion_documentos_clinicos" ON storage.objects
    FOR DELETE USING (bucket_id = 'clinical-docs' AND false);

-- =============================================
-- POLÍTICAS DE STORAGE - BUCKET lab-results
-- =============================================

-- Política para leer resultados de laboratorio
CREATE POLICY "ver_resultados_laboratorio" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'lab-results' AND
        (
            is_admin() OR
            has_permission('resultados_estudio', 'view')
        )
    );

-- Política para subir resultados de laboratorio
CREATE POLICY "subir_resultados_laboratorio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'lab-results' AND
        (
            is_admin() OR
            has_permission('resultados_estudio', 'create')
        )
    );

-- Política para actualizar resultados de laboratorio
CREATE POLICY "actualizar_resultados_laboratorio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'lab-results' AND
        (
            is_admin() OR
            has_permission('resultados_estudio', 'edit')
        )
    );

-- Prohibir eliminación en resultados de laboratorio
CREATE POLICY "prohibir_eliminacion_resultados_laboratorio" ON storage.objects
    FOR DELETE USING (bucket_id = 'lab-results' AND false);

-- =============================================
-- POLÍTICAS DE STORAGE - BUCKET invoices
-- =============================================

-- Política para leer facturas
CREATE POLICY "ver_facturas" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'invoices' AND
        (
            is_admin() OR
            has_permission('facturas', 'view')
        )
    );

-- Política para subir facturas
CREATE POLICY "subir_facturas" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'invoices' AND
        (
            is_admin() OR
            has_permission('facturas', 'create')
        )
    );

-- Política para actualizar facturas
CREATE POLICY "actualizar_facturas" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'invoices' AND
        (
            is_admin() OR
            has_permission('facturas', 'edit')
        )
    );

-- =============================================
-- POLÍTICAS DE STORAGE - BUCKET public-assets (PÚBLICO)
-- =============================================

-- Política para leer assets públicos (acceso público de lectura)
CREATE POLICY "ver_assets_publicos" ON storage.objects
    FOR SELECT USING (bucket_id = 'public-assets');

-- Política para subir assets públicos (solo admin)
CREATE POLICY "subir_assets_publicos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'public-assets' AND is_admin()
    );

-- =============================================
-- FUNCIÓN AUXILIAR PARA VALIDAR METADATA DE ARCHIVOS
-- =============================================

CREATE OR REPLACE FUNCTION validate_storage_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo validar para buckets privados
    IF NEW.bucket_id NOT IN ('clinical-docs', 'lab-results', 'invoices') THEN
        RETURN NEW;
    END IF;
    
    -- Verificar que el usuario tenga permisos
    IF NOT (is_admin() OR has_permission('documentos', 'create')) THEN
        RAISE EXCEPTION 'No tiene permisos para subir archivos';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para validar metadata
CREATE TRIGGER validate_storage_metadata_trigger
    BEFORE INSERT OR UPDATE ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION validate_storage_metadata();;