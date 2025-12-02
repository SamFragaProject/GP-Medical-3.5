-- Migration: politicas_storage_y_vistas_materializadas
-- Created at: 1762190220

-- =============================================
-- POLÍTICAS DE STORAGE BUCKETS Y VISTAS MATERIALIZADAS
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
        ) AND
        -- Verificar metadata empresa_id coincide
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para subir documentos clínicos
CREATE POLICY "subir_documentos_clinicos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'clinical-docs' AND
        (
            is_admin() OR
            has_permission('documentos', 'create')
        ) AND
        -- Exigir metadata en el path: empresa_id/sede_id/paciente_id/
        array_length(storage.foldername(name), 1) >= 3 AND
        -- Verificar que el usuario pertenece a la empresa
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para actualizar documentos clínicos
CREATE POLICY "actualizar_documentos_clinicos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'clinical-docs' AND
        (
            is_admin() OR
            has_permission('documentos', 'edit')
        ) AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Prohibir eliminación salvo roles con permiso explícito
CREATE POLICY "prohibir_eliminacion_documentos_clinicos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'clinical-docs' AND false  -- Prohibir eliminación por defecto
    );

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
        ) AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para subir resultados de laboratorio
CREATE POLICY "subir_resultados_laboratorio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'lab-results' AND
        (
            is_admin() OR
            has_permission('resultados_estudio', 'create')
        ) AND
        array_length(storage.foldername(name), 1) >= 3 AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para actualizar resultados de laboratorio
CREATE POLICY "actualizar_resultados_laboratorio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'lab-results' AND
        (
            is_admin() OR
            has_permission('resultados_estudio', 'edit')
        ) AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Prohibir eliminación en resultados de laboratorio
CREATE POLICY "prohibir_eliminacion_resultados_laboratorio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'lab-results' AND false
    );

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
        ) AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para subir facturas
CREATE POLICY "subir_facturas" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'invoices' AND
        (
            is_admin() OR
            has_permission('facturas', 'create')
        ) AND
        array_length(storage.foldername(name), 1) >= 2 AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
    );

-- Política para actualizar facturas
CREATE POLICY "actualizar_facturas" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'invoices' AND
        (
            is_admin() OR
            has_permission('facturas', 'edit')
        ) AND
        (storage.foldername(name))[1] = get_user_empresa_id()::text
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
DECLARE
    path_parts TEXT[];
    empresa_id_check UUID;
    sede_id_check UUID;
    paciente_id_check UUID;
BEGIN
    -- Solo validar para buckets privados
    IF NEW.bucket_id NOT IN ('clinical-docs', 'lab-results', 'invoices') THEN
        RETURN NEW;
    END IF;
    
    -- Extraer partes del path: empresa_id/sede_id/paciente_id/filename
    path_parts := string_to_array(NEW.name, '/');
    
    -- Validar estructura mínima
    IF array_length(path_parts, 1) < 2 THEN
        RAISE EXCEPTION 'Estructura de path inválida. Debe ser: empresa_id/sede_id/paciente_id/filename';
    END IF;
    
    -- Validar empresa_id
    BEGIN
        empresa_id_check := path_parts[1]::UUID;
    EXCEPTION
        WHEN invalid_text_representation THEN
            RAISE EXCEPTION 'empresa_id inválido en el path';
    END;
    
    -- Verificar que la empresa_id coincida con la del usuario
    IF empresa_id_check != get_user_empresa_id() AND NOT is_super_admin() THEN
        RAISE EXCEPTION 'No tiene permisos para subir archivos a esta empresa';
    END IF;
    
    -- Validar sede_id si está presente
    IF array_length(path_parts, 1) >= 3 AND path_parts[2] IS NOT NULL THEN
        BEGIN
            sede_id_check := path_parts[2]::UUID;
        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE EXCEPTION 'sede_id inválido en el path';
        END;
    END IF;
    
    -- Validar paciente_id si está presente
    IF array_length(path_parts, 1) >= 4 AND path_parts[3] IS NOT NULL THEN
        BEGIN
            paciente_id_check := path_parts[3]::UUID;
        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE EXCEPTION 'paciente_id inválido en el path';
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para validar metadata
CREATE TRIGGER validate_storage_metadata_trigger
    BEFORE INSERT OR UPDATE ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION validate_storage_metadata();

-- =============================================
-- VISTA MATERIALIZADA: effective_permissions
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS effective_permissions AS
SELECT 
    p.id as user_id,
    p.empresa_id,
    p.sede_id,
    sp.name as permission_name,
    sp.resource,
    sp.action,
    sup.granted,
    sup.granted_at,
    r.nombre as role_name
FROM profiles p
LEFT JOIN saas_user_permissions sup ON p.id = sup.user_id
LEFT JOIN saas_permissions sp ON sup.permission_id = sp.id
LEFT JOIN usuarios_roles ur ON p.id = ur.usuario_id AND ur.activo = true
LEFT JOIN roles r ON ur.role_id = r.id
WHERE p.id = auth.uid()
   OR sp.name IN ('view_own_data', 'manage_own_profile');

-- Índice para optimización
CREATE UNIQUE INDEX IF NOT EXISTS idx_effective_permissions_user_resource_action 
ON effective_permissions(user_id, resource, action);

-- =============================================
-- VISTA MATERIALIZADA: v_agenda_medico_dia
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS v_agenda_medico_dia AS
SELECT 
    c.id,
    c.empresa_id,
    c.sede_id,
    c.paciente_id,
    p.nombres || ' ' || p.apellidos as paciente_nombre,
    p.documento as paciente_documento,
    c.doctor_id,
    up.nombres || ' ' || up.apellidos as doctor_nombre,
    c.tipo_cita,
    c.fecha_hora_inicio,
    c.fecha_hora_fin,
    c.duracion_minutos,
    c.estado,
    c.motivo_consulta,
    c.observaciones,
    EXTRACT(HOUR FROM c.fecha_hora_inicio) as hora_inicio,
    EXTRACT(HOUR FROM c.fecha_hora_fin) as hora_fin,
    DATE(c.fecha_hora_inicio) as fecha_cita
FROM citas c
JOIN pacientes p ON c.paciente_id = p.id
LEFT JOIN profiles up ON c.doctor_id = up.id
WHERE c.activo = true
  AND p.activo = true;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_agenda_medico_dia_fecha ON v_agenda_medico_dia(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_agenda_medico_dia_doctor ON v_agenda_medico_dia(doctor_id, fecha_cita);
CREATE INDEX IF NOT EXISTS idx_agenda_medico_dia_empresa ON v_agenda_medico_dia(empresa_id, fecha_cita);

-- =============================================
-- VISTA MATERIALIZADA: v_kpis_sede
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS v_kpis_sede AS
SELECT 
    e.empresa_id,
    e.sede_id,
    s.nombre as sede_nombre,
    DATE_TRUNC('month', c.fecha_hora_inicio) as mes,
    COUNT(DISTINCT c.id) as total_citas,
    COUNT(DISTINCT CASE WHEN c.estado = 'completada' THEN c.id END) as citas_completadas,
    COUNT(DISTINCT CASE WHEN c.estado = 'cancelada' THEN c.id END) as citas_canceladas,
    COUNT(DISTINCT CASE WHEN c.estado = 'no_asistio' THEN c.id END) as citas_no_asistidas,
    COUNT(DISTINCT c.paciente_id) as pacientes_atendidos,
    AVG(c.duracion_minutos) as duracion_promedio_citas,
    COUNT(DISTINCT r.id) as recetas_expedidas,
    COUNT(DISTINCT oe.id) as ordenes_generadas
FROM sedes e
LEFT JOIN citas c ON e.id = c.sede_id 
    AND c.fecha_hora_inicio >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
    AND c.fecha_hora_inicio < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
LEFT JOIN pacientes p ON c.paciente_id = p.id
LEFT JOIN recetas r ON c.id = r.encuentro_id
LEFT JOIN ordenes_estudio oe ON c.id = oe.encuentro_id
GROUP BY e.empresa_id, e.sede_id, s.nombre, DATE_TRUNC('month', c.fecha_hora_inicio);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_kpis_sede_empresa_mes ON v_kpis_sede(empresa_id, sede_id, mes);
CREATE INDEX IF NOT EXISTS idx_kpis_sede_mes ON v_kpis_sede(mes);

-- =============================================
-- VISTA MATERIALIZADA: v_recetas_pendientes_dispensa
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS v_recetas_pendientes_dispensa AS
SELECT 
    r.id,
    r.empresa_id,
    r.sede_id,
    r.paciente_id,
    p.nombres || ' ' || p.apellidos as paciente_nombre,
    p.documento as paciente_documento,
    r.doctor_id,
    up.nombres || ' ' || up.apellidos as doctor_nombre,
    r.fecha_receta,
    r.numero_receta,
    r.diagnostico,
    r.vigencia_dias,
    r.dispensada,
    r.fecha_dispensacion,
    r.farmacia_dispensacion,
    r.medicamentos,
    CURRENT_DATE - r.fecha_receta::date as dias_desde_receta,
    r.fecha_receta::date + r.vigencia_dias as fecha_vencimiento,
    CASE 
        WHEN CURRENT_DATE > (r.fecha_receta::date + r.vigencia_dias) THEN 'vencida'
        WHEN CURRENT_DATE > (r.fecha_receta::date + r.vigencia_dias - 3) THEN 'por_vencer'
        ELSE 'vigente'
    END as estado_vigencia
FROM recetas r
JOIN pacientes p ON r.paciente_id = p.id
LEFT JOIN profiles up ON r.doctor_id = up.id
WHERE r.activa = true
  AND r.dispensada = false
  AND p.activo = true;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_empresa ON v_recetas_pendientes_dispensa(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_vencimiento ON v_recetas_pendientes_dispensa(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_paciente ON v_recetas_pendientes_dispensa(paciente_id);

-- =============================================
-- FUNCIÓN PARA REFRESCAR VISTAS MATERIALIZADAS
-- =============================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY effective_permissions;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_agenda_medico_dia;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_kpis_sede;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_recetas_pendientes_dispensa;
END;
$$;;