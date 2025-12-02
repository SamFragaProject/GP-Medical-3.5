-- Migration: vistas_materializadas_kpis
-- Created at: 1762190273

-- =============================================
-- VISTAS MATERIALIZADAS PARA KPIs Y REPORTES
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

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
    (SELECT nombre || ' ' || apellido_paterno FROM profiles WHERE id = c.doctor_id) as doctor_nombre,
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
    COALESCE(s.empresa_id, c.empresa_id) as empresa_id,
    COALESCE(s.id, c.sede_id) as sede_id,
    COALESCE(s.nombre, 'Sin sede') as sede_nombre,
    DATE_TRUNC('month', c.fecha_hora_inicio) as mes,
    COUNT(DISTINCT c.id) as total_citas,
    COUNT(DISTINCT CASE WHEN c.estado = 'completada' THEN c.id END) as citas_completadas,
    COUNT(DISTINCT CASE WHEN c.estado = 'cancelada' THEN c.id END) as citas_canceladas,
    COUNT(DISTINCT CASE WHEN c.estado = 'no_asistio' THEN c.id END) as citas_no_asistidas,
    COUNT(DISTINCT c.paciente_id) as pacientes_atendidos,
    AVG(c.duracion_minutos)::numeric(10,2) as duracion_promedio_citas,
    COUNT(DISTINCT r.id) as recetas_expedidas,
    COUNT(DISTINCT oe.id) as ordenes_generadas,
    -- Cálculos adicionales
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT c.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN c.estado = 'completada' THEN c.id END) * 100.0 / COUNT(DISTINCT c.id))
            ELSE 0 
        END, 2
    ) as porcentaje_citas_completadas,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT c.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN c.estado = 'cancelada' THEN c.id END) * 100.0 / COUNT(DISTINCT c.id))
            ELSE 0 
        END, 2
    ) as porcentaje_citas_canceladas
FROM sedes s
RIGHT JOIN citas c ON s.id = c.sede_id 
    AND c.fecha_hora_inicio >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
    AND c.fecha_hora_inicio < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
LEFT JOIN pacientes p ON c.paciente_id = p.id
LEFT JOIN recetas r ON c.id = r.encuentro_id AND r.activa = true
LEFT JOIN ordenes_estudio oe ON c.id = oe.encuentro_id
GROUP BY s.empresa_id, s.id, s.nombre, DATE_TRUNC('month', c.fecha_hora_inicio), c.empresa_id, c.sede_id;

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
    (SELECT nombre || ' ' || apellido_paterno FROM profiles WHERE id = r.doctor_id) as doctor_nombre,
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
    END as estado_vigencia,
    jsonb_array_length(r.medicamentos) as total_medicamentos
FROM recetas r
JOIN pacientes p ON r.paciente_id = p.id
WHERE r.activa = true
  AND r.dispensada = false
  AND p.activo = true;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_empresa ON v_recetas_pendientes_dispensa(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_vencimiento ON v_recetas_pendientes_dispensa(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_paciente ON v_recetas_pendientes_dispensa(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recetas_pendientes_estado ON v_recetas_pendientes_dispensa(estado_vigencia);

-- =============================================
-- VISTA MATERIALIZADA: v_resumen_pacientes_activos
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS v_resumen_pacientes_activos AS
SELECT 
    p.empresa_id,
    p.sede_id,
    s.nombre as sede_nombre,
    COUNT(DISTINCT p.id) as total_pacientes,
    COUNT(DISTINCT CASE WHEN p.genero = 'M' THEN p.id END) as pacientes_masculino,
    COUNT(DISTINCT CASE WHEN p.genero = 'F' THEN p.id END) as pacientes_femenino,
    COUNT(DISTINCT c.id) as citas_programadas,
    COUNT(DISTINCT e.id) as encuentros_realizados,
    AVG(
        CASE 
            WHEN p.fecha_nacimiento IS NOT NULL 
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento))
            ELSE NULL 
        END
    )::numeric(5,2) as edad_promedio,
    COUNT(DISTINCT r.id) as recetas_pendientes,
    COUNT(DISTINCT oe.id) as estudios_pendientes
FROM pacientes p
LEFT JOIN sedes s ON p.sede_id = s.id
LEFT JOIN citas c ON p.id = c.paciente_id AND c.estado IN ('programada', 'confirmada')
LEFT JOIN encuentros e ON p.id = e.paciente_id 
    AND e.fecha_encuentro >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
LEFT JOIN recetas r ON p.id = r.paciente_id AND r.activa = true AND r.dispensada = false
LEFT JOIN ordenes_estudio oe ON p.id = oe.paciente_id AND oe.estado = 'pendiente'
WHERE p.activo = true
GROUP BY p.empresa_id, p.sede_id, s.nombre;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_resumen_pacientes_empresa ON v_resumen_pacientes_activos(empresa_id, sede_id);

-- =============================================
-- FUNCIÓN PARA REFRESCAR VISTAS MATERIALIZADAS
-- =============================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refrescar vistas materializadas con concurrencia para evitar bloqueos
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_agenda_medico_dia;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_kpis_sede;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_recetas_pendientes_dispensa;
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_resumen_pacientes_activos;
    
    RAISE NOTICE 'Vistas materializadas actualizadas correctamente';
END;
$$;

-- =============================================
-- FUNCIÓN PARA PROGRAMAR REFRESCO AUTOMÁTICO
-- =============================================

CREATE OR REPLACE FUNCTION schedule_view_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Programar refresco después de cambios en datos relevantes
    IF TG_TABLE_NAME IN ('citas', 'pacientes', 'recetas', 'ordenes_estudio', 'encuentros') THEN
        PERFORM pg_notify('refresh_views', TG_TABLE_NAME);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para refresco automático
CREATE TRIGGER trigger_refresh_views_citas
    AFTER INSERT OR UPDATE OR DELETE ON citas
    FOR EACH ROW EXECUTE FUNCTION schedule_view_refresh();

CREATE TRIGGER trigger_refresh_views_pacientes
    AFTER INSERT OR UPDATE OR DELETE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION schedule_view_refresh();

CREATE TRIGGER trigger_refresh_views_recetas
    AFTER INSERT OR UPDATE OR DELETE ON recetas
    FOR EACH ROW EXECUTE FUNCTION schedule_view_refresh();;