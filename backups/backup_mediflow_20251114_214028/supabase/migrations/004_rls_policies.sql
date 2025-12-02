-- =============================================
-- ERP MÉDICO - MEDICINA DEL TRABAJO
-- Migración 004: Row Level Security Policies (Multi-tenant)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE limites_uso ENABLE ROW LEVEL SECURITY;
ALTER TABLE puestos_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes_ocupacionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE incapacidades_laborales ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificaciones_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictamenes_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_medico_laboral ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas_examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones_chatbot ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_chatbot ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE analisis_predictivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_chatbot ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_chatbot ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNCIONES AUXILIARES PARA RLS
-- =============================================

-- Función para obtener empresa del usuario actual
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT empresa_id FROM profiles WHERE id = auth.uid();
$$;

-- Función para verificar si el usuario es super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.nombre = 'super_admin'
        AND ur.activo = true
    );
$$;

-- Función para verificar rol específico del usuario
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.nombre = role_name
        AND ur.activo = true
    );
$$;

-- =============================================
-- POLÍTICAS PARA TABLAS BASE
-- =============================================

-- Políticas para empresas
CREATE POLICY "Super admin puede ver todas las empresas" ON empresas
    FOR SELECT USING (is_super_admin());

CREATE POLICY "Usuario puede ver su empresa" ON empresas
    FOR SELECT USING (id = get_user_empresa_id());

CREATE POLICY "Super admin puede insertar empresas" ON empresas
    FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "Super admin puede actualizar empresas" ON empresas
    FOR UPDATE USING (is_super_admin());

-- Políticas para sedes
CREATE POLICY "Usuario puede ver sedes de su empresa" ON sedes
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Admin empresa puede insertar sedes" ON sedes
    FOR INSERT WITH CHECK (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

CREATE POLICY "Admin empresa puede actualizar sedes" ON sedes
    FOR UPDATE USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

-- Políticas para profiles
CREATE POLICY "Usuario puede ver su perfil" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Usuario puede ver perfiles de su empresa" ON profiles
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Usuario puede actualizar su perfil" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin puede actualizar perfiles de su empresa" ON profiles
    FOR UPDATE USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

CREATE POLICY "Permitir inserción desde edge functions" ON profiles
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Políticas para user_roles
CREATE POLICY "Usuario puede ver roles de su empresa" ON user_roles
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Admin puede gestionar roles de su empresa" ON user_roles
    FOR ALL USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

-- =============================================
-- POLÍTICAS PARA MEDICINA DEL TRABAJO
-- =============================================

-- Políticas para puestos_trabajo
CREATE POLICY "Usuario puede ver puestos de su empresa" ON puestos_trabajo
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Personal médico puede gestionar puestos" ON puestos_trabajo
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('admin_empresa')
        ) OR is_super_admin()
    );

-- Políticas para pacientes
CREATE POLICY "Usuario puede ver pacientes de su empresa" ON pacientes
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Personal autorizado puede gestionar pacientes" ON pacientes
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('recepcion') OR
            has_role('admin_empresa')
        ) OR is_super_admin()
    );

-- Políticas para exámenes ocupacionales
CREATE POLICY "Personal médico puede ver exámenes de su empresa" ON examenes_ocupacionales
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar exámenes" ON examenes_ocupacionales
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('audiometrista') OR
            has_role('psicologo_laboral')
        ) OR is_super_admin()
    );

-- Políticas para evaluaciones de riesgo
CREATE POLICY "Usuario puede ver evaluaciones de su empresa" ON evaluaciones_riesgo
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Personal especializado puede gestionar evaluaciones" ON evaluaciones_riesgo
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('admin_empresa')
        ) OR is_super_admin()
    );

-- Políticas para incapacidades
CREATE POLICY "Personal autorizado puede ver incapacidades" ON incapacidades_laborales
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar incapacidades" ON incapacidades_laborales
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial')
        ) OR is_super_admin()
    );

-- Políticas para certificaciones
CREATE POLICY "Usuario puede ver certificaciones de su empresa" ON certificaciones_medicas
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar certificaciones" ON certificaciones_medicas
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial')
        ) OR is_super_admin()
    );

-- Políticas para dictámenes
CREATE POLICY "Usuario puede ver dictámenes de su empresa" ON dictamenes_medicos
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar dictámenes" ON dictamenes_medicos
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial')
        ) OR is_super_admin()
    );

-- Políticas para historial médico
CREATE POLICY "Personal médico puede ver historial" ON historial_medico_laboral
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Personal médico puede gestionar historial" ON historial_medico_laboral
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('audiometrista') OR
            has_role('psicologo_laboral')
        ) OR is_super_admin()
    );

-- Políticas para citas
CREATE POLICY "Usuario puede ver citas de su empresa" ON citas_examenes
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Personal autorizado puede gestionar citas" ON citas_examenes
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('recepcion') OR
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('admin_empresa')
        ) OR is_super_admin()
    );

-- Políticas para laboratorios
CREATE POLICY "Personal médico puede ver laboratorios" ON laboratorios
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar laboratorios" ON laboratorios
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial')
        ) OR is_super_admin()
    );

-- Políticas para imagenología
CREATE POLICY "Personal médico puede ver imagenología" ON imagenologia
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Médicos pueden gestionar imagenología" ON imagenologia
    FOR ALL USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial')
        ) OR is_super_admin()
    );

-- =============================================
-- POLÍTICAS PARA CHATBOT Y IA
-- =============================================

-- Políticas para base de conocimiento
CREATE POLICY "Usuario puede ver base conocimiento global" ON base_conocimiento
    FOR SELECT USING (empresa_id IS NULL OR empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Admin puede gestionar base conocimiento de su empresa" ON base_conocimiento
    FOR ALL USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

-- Políticas para conversaciones chatbot
CREATE POLICY "Usuario puede ver sus conversaciones" ON conversaciones_chatbot
    FOR SELECT USING (
        user_id = auth.uid() OR
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa')) OR
        is_super_admin()
    );

CREATE POLICY "Usuario puede crear conversaciones" ON conversaciones_chatbot
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        empresa_id = get_user_empresa_id()
    );

CREATE POLICY "Permitir inserción desde edge functions" ON conversaciones_chatbot
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Políticas para mensajes chatbot
CREATE POLICY "Usuario puede ver mensajes de sus conversaciones" ON mensajes_chatbot
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversaciones_chatbot c
            WHERE c.id = mensajes_chatbot.conversacion_id
            AND (c.user_id = auth.uid() OR 
                 (c.empresa_id = get_user_empresa_id() AND has_role('admin_empresa')) OR
                 is_super_admin())
        )
    );

CREATE POLICY "Permitir inserción mensajes desde edge functions" ON mensajes_chatbot
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Políticas para tickets de soporte
CREATE POLICY "Usuario puede ver tickets relacionados" ON tickets_soporte
    FOR SELECT USING (
        usuario_id = auth.uid() OR
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa')) OR
        is_super_admin()
    );

CREATE POLICY "Usuario puede crear tickets" ON tickets_soporte
    FOR INSERT WITH CHECK (
        usuario_id = auth.uid() AND
        empresa_id = get_user_empresa_id()
    );

-- Políticas para alertas de riesgo
CREATE POLICY "Usuario puede ver alertas de su empresa" ON alertas_riesgo
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Permitir inserción alertas desde edge functions" ON alertas_riesgo
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Políticas para recomendaciones IA
CREATE POLICY "Usuario puede ver recomendaciones de su empresa" ON recomendaciones_ia
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Permitir inserción recomendaciones desde edge functions" ON recomendaciones_ia
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Políticas para análisis predictivos
CREATE POLICY "Personal autorizado puede ver análisis" ON analisis_predictivos
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND (
            has_role('medico_trabajo') OR
            has_role('medico_industrial') OR
            has_role('admin_empresa')
        ) OR is_super_admin()
    );

-- Políticas para métricas chatbot
CREATE POLICY "Admin puede ver métricas de su empresa" ON metricas_chatbot
    FOR SELECT USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

-- Políticas para configuración chatbot
CREATE POLICY "Admin puede ver configuración de su empresa" ON configuracion_chatbot
    FOR SELECT USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

CREATE POLICY "Admin puede gestionar configuración chatbot" ON configuracion_chatbot
    FOR ALL USING (
        (empresa_id = get_user_empresa_id() AND has_role('admin_empresa'))
        OR is_super_admin()
    );

-- =============================================
-- POLÍTICAS ESPECIALES PARA PACIENTES (Auto-consulta)
-- =============================================

-- Política para que pacientes vean su propio historial
CREATE POLICY "Paciente puede ver su propio historial" ON historial_medico_laboral
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pacientes p
            WHERE p.id = historial_medico_laboral.paciente_id
            AND p.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
    );

-- Política para que pacientes vean sus propios exámenes
CREATE POLICY "Paciente puede ver sus propios exámenes" ON examenes_ocupacionales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pacientes p
            WHERE p.id = examenes_ocupacionales.paciente_id
            AND p.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
    );

-- =============================================
-- POLÍTICAS PARA PLANES Y SUSCRIPCIONES
-- =============================================

-- Políticas para planes (lectura pública)
CREATE POLICY "Todos pueden ver planes activos" ON planes_suscripcion
    FOR SELECT USING (activo = true);

CREATE POLICY "Super admin puede gestionar planes" ON planes_suscripcion
    FOR ALL USING (is_super_admin());

-- Políticas para suscripciones
CREATE POLICY "Usuario puede ver suscripción de su empresa" ON suscripciones
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Super admin puede gestionar suscripciones" ON suscripciones
    FOR ALL USING (is_super_admin());

-- Políticas para límites de uso
CREATE POLICY "Usuario puede ver límites de su empresa" ON limites_uso
    FOR SELECT USING (empresa_id = get_user_empresa_id() OR is_super_admin());

CREATE POLICY "Permitir actualización límites desde edge functions" ON limites_uso
    FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));