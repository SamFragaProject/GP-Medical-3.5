-- Migration: politicas_rls_tablas_clinicas
-- Created at: 1762190159

-- =============================================
-- POLÍTICAS RLS PARA TABLAS CLÍNICAS
-- Sistema ERP Médico - Medicina del Trabajo
-- =============================================

-- =============================================
-- HABILITAR RLS EN TABLAS CLÍNICAS
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

-- Política para SELECT en citas
CREATE POLICY "ver_citas_empresa_sede" ON citas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('citas', 'view')
    );

-- Política para INSERT en citas
CREATE POLICY "crear_citas_con_permisos" ON citas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'create')
    );

-- Política para UPDATE en citas
CREATE POLICY "actualizar_citas_con_permisos" ON citas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'edit')
    );

-- Política para DELETE en citas
CREATE POLICY "eliminar_citas_con_permisos" ON citas
    FOR DELETE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'delete')
    );

-- =============================================
-- POLÍTICAS RLS PARA ENCUENTROS CLÍNICOS
-- =============================================

-- Política para SELECT en encuentros
CREATE POLICY "ver_encuentros_empresa_sede" ON encuentros
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('encuentros', 'view')
    );

-- Política para INSERT en encuentros
CREATE POLICY "crear_encuentros_con_permisos" ON encuentros
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('encuentros', 'create')
    );

-- Política para UPDATE en encuentros
CREATE POLICY "actualizar_encuentros_con_permisos" ON encuentros
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('encuentros', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA NOTAS CLÍNICAS
-- =============================================

-- Política para SELECT en notas_clinicas
CREATE POLICY "ver_notas_clinicas" ON notas_clinicas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('notas_clinicas', 'view')
    );

-- Política para INSERT en notas_clinicas
CREATE POLICY "crear_notas_clinicas" ON notas_clinicas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        doctor_id = auth.uid() AND
        has_permission('notas_clinicas', 'create')
    );

-- Política para UPDATE en notas_clinicas
CREATE POLICY "actualizar_notas_clinicas" ON notas_clinicas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        (doctor_id = auth.uid() OR has_permission('notas_clinicas', 'edit'))
    );

-- =============================================
-- POLÍTICAS RLS PARA RECETAS MÉDICAS
-- =============================================

-- Política para SELECT en recetas
CREATE POLICY "ver_recetas_empresa_sede" ON recetas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('recetas', 'view')
    );

-- Política para INSERT en recetas
CREATE POLICY "crear_recetas_con_permisos" ON recetas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('recetas', 'create')
    );

-- Política para UPDATE en recetas
CREATE POLICY "actualizar_recetas_con_permisos" ON recetas
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('recetas', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA ÓRDENES DE ESTUDIO
-- =============================================

-- Política para SELECT en ordenes_estudio
CREATE POLICY "ver_ordenes_estudio" ON ordenes_estudio
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        (has_sede_access(sede_id) OR sede_id IS NULL) AND
        has_permission('ordenes_estudio', 'view')
    );

-- Política para INSERT en ordenes_estudio
CREATE POLICY "crear_ordenes_estudio" ON ordenes_estudio
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('ordenes_estudio', 'create')
    );

-- Política para UPDATE en ordenes_estudio
CREATE POLICY "actualizar_ordenes_estudio" ON ordenes_estudio
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('ordenes_estudio', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA RESULTADOS DE ESTUDIO
-- =============================================

-- Política para SELECT en resultados_estudio
CREATE POLICY "ver_resultados_estudio" ON resultados_estudio
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'view')
    );

-- Política para INSERT en resultados_estudio
CREATE POLICY "crear_resultados_estudio" ON resultados_estudio
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'create')
    );

-- Política para UPDATE en resultados_estudio
CREATE POLICY "actualizar_resultados_estudio" ON resultados_estudio
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('resultados_estudio', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA DOCUMENTOS
-- =============================================

-- Política para SELECT en documentos
CREATE POLICY "ver_documentos_empresa_paciente" ON documentos
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        has_patient_access(paciente_id) AND
        has_permission('documentos', 'view')
    );

-- Política para INSERT en documentos
CREATE POLICY "crear_documentos_con_permisos" ON documentos
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_patient_access(paciente_id) AND
        has_permission('documentos', 'create')
    );

-- Política para UPDATE en documentos
CREATE POLICY "actualizar_documentos_con_permisos" ON documentos
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('documentos', 'edit')
    );

-- =============================================
-- POLÍTICAS RLS PARA CONSENTIMIENTOS
-- =============================================

-- Política para SELECT en consentimientos
CREATE POLICY "ver_consentimientos_empresa_paciente" ON consentimientos
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        has_patient_access(paciente_id) AND
        has_permission('consentimientos', 'view')
    );

-- Política para INSERT en consentimientos
CREATE POLICY "crear_consentimientos_con_permisos" ON consentimientos
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_patient_access(paciente_id) AND
        has_permission('consentimientos', 'create')
    );

-- Política para UPDATE en consentimientos
CREATE POLICY "actualizar_consentimientos_con_permisos" ON consentimientos
    FOR UPDATE USING (
        empresa_id = get_user_empresa_id() AND
        has_permission('consentimientos', 'edit')
    );

-- =============================================
-- EXCEPCIONES PARA SUPER ADMINISTRADORES
-- =============================================

-- Super admin acceso total a todas las tablas clínicas
CREATE POLICY "super_admin_acceso_total_citas" ON citas
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_encuentros" ON encuentros
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_notas_clinicas" ON notas_clinicas
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_recetas" ON recetas
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_ordenes_estudio" ON ordenes_estudio
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_resultados_estudio" ON resultados_estudio
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_documentos" ON documentos
    FOR ALL USING (is_super_admin());

CREATE POLICY "super_admin_acceso_total_consentimientos" ON consentimientos
    FOR ALL USING (is_super_admin());;