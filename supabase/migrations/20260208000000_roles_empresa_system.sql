-- =====================================================
-- MIGRACIÓN: Sistema de Roles y Usuarios por Empresa
-- GPMedical ERP Pro - Multi-Tenant Role Management
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. TABLA DE ROLES POR EMPRESA
-- =====================================================

CREATE TABLE IF NOT EXISTS roles_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#3B82F6',
    icono VARCHAR(50) DEFAULT 'user',
    nivel_jerarquia INT DEFAULT 5 CHECK (nivel_jerarquia BETWEEN 1 AND 10),
    es_sistema BOOLEAN DEFAULT false,
    es_editable BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un código por empresa (o global si empresa_id es null)
    UNIQUE(empresa_id, codigo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_empresa_empresa ON roles_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_empresa_codigo ON roles_empresa(codigo);

-- =====================================================
-- 2. TABLA DE PERMISOS POR ROL
-- =====================================================

CREATE TABLE IF NOT EXISTS permisos_rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id UUID REFERENCES roles_empresa(id) ON DELETE CASCADE,
    modulo_codigo VARCHAR(50) NOT NULL,
    puede_ver BOOLEAN DEFAULT false,
    puede_crear BOOLEAN DEFAULT false,
    puede_editar BOOLEAN DEFAULT false,
    puede_borrar BOOLEAN DEFAULT false,
    puede_exportar BOOLEAN DEFAULT false,
    puede_ver_todos BOOLEAN DEFAULT false,
    puede_aprobar BOOLEAN DEFAULT false,
    puede_firmar BOOLEAN DEFAULT false,
    puede_imprimir BOOLEAN DEFAULT false,
    filtro_sede BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(rol_id, modulo_codigo)
);

CREATE INDEX IF NOT EXISTS idx_permisos_rol_rol ON permisos_rol(rol_id);

-- =====================================================
-- 3. TABLA DE USUARIOS POR EMPRESA (EXTENDIDA)
-- =====================================================

-- Agregar columnas a profiles si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rol_empresa_id UUID REFERENCES roles_empresa(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sedes_acceso UUID[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invitado_por UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMPTZ;

-- Índice para usuarios por empresa
CREATE INDEX IF NOT EXISTS idx_profiles_empresa ON profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rol_empresa ON profiles(rol_empresa_id);

-- =====================================================
-- 4. TABLA DE INVITACIONES PENDIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS invitaciones_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    sedes_acceso UUID[] DEFAULT '{}',
    cargo VARCHAR(100),
    token VARCHAR(64) UNIQUE NOT NULL,
    expira_en TIMESTAMPTZ NOT NULL,
    usado BOOLEAN DEFAULT false,
    creado_por UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, email)
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones_usuario(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_empresa ON invitaciones_usuario(empresa_id);

-- =====================================================
-- 5. CATÁLOGO DE MÓDULOS DEL SISTEMA
-- =====================================================

INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, orden, ruta, es_premium, requiere_licencia_medica, activo)
VALUES
    ('dashboard', 'Dashboard', 'Panel principal con métricas', 'layout-dashboard', 'from-blue-500 to-indigo-600', 'operativo', 1, '/dashboard', false, false, true),
    ('pacientes', 'Pacientes', 'Gestión de pacientes/trabajadores', 'users', 'from-emerald-500 to-teal-600', 'operativo', 2, '/pacientes', false, false, true),
    ('citas', 'Agenda', 'Citas y programación', 'calendar', 'from-purple-500 to-violet-600', 'operativo', 3, '/agenda', false, false, true),
    ('expedientes', 'Expediente Clínico', 'Historia clínica y consultas', 'file-medical', 'from-rose-500 to-pink-600', 'operativo', 4, '/expediente', false, true, true),
    ('estudios', 'Estudios Médicos', 'Audiometría, espirometría, labs', 'activity', 'from-cyan-500 to-blue-600', 'operativo', 5, '/estudios', false, true, true),
    ('recetas', 'Recetas', 'Prescripciones médicas', 'pill', 'from-amber-500 to-orange-600', 'operativo', 6, '/recetas', false, true, true),
    ('facturacion', 'Facturación', 'Emisión de CFDI', 'receipt', 'from-green-500 to-emerald-600', 'administrativo', 7, '/facturacion', true, false, true),
    ('inventario', 'Inventario', 'Control de farmacia e insumos', 'package', 'from-slate-500 to-gray-600', 'administrativo', 8, '/inventario', false, false, true),
    ('reportes', 'Reportes', 'Informes y estadísticas', 'bar-chart-2', 'from-indigo-500 to-purple-600', 'administrativo', 9, '/reportes', false, false, true),
    ('usuarios', 'Usuarios', 'Gestión de usuarios y roles', 'user-cog', 'from-blue-600 to-indigo-700', 'configuracion', 10, '/usuarios', false, false, true),
    ('configuracion', 'Configuración', 'Ajustes del sistema', 'settings', 'from-gray-500 to-slate-600', 'configuracion', 11, '/configuracion', false, false, true),
    ('nom035', 'NOM-035', 'Evaluaciones psicosociales', 'brain', 'from-violet-500 to-purple-600', 'especial', 12, '/nom-035', true, false, true),
    ('nom036', 'NOM-036', 'Ergonomía', 'accessibility', 'from-teal-500 to-cyan-600', 'especial', 13, '/nom-036', true, false, true),
    ('ia', 'Asistente IA', 'Chatbot médico inteligente', 'bot', 'from-pink-500 to-rose-600', 'especial', 14, '/ia', true, false, true)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 6. FUNCIÓN PARA CREAR ROLES BASE AL CREAR EMPRESA
-- =====================================================

CREATE OR REPLACE FUNCTION crear_roles_base_empresa(p_empresa_id UUID)
RETURNS void AS $$
DECLARE
    v_rol_admin_id UUID;
    v_rol_medico_id UUID;
    v_rol_enfermera_id UUID;
    v_rol_recepcion_id UUID;
    v_rol_asistente_id UUID;
BEGIN
    -- ROL: Admin Empresa
    INSERT INTO roles_empresa (empresa_id, codigo, nombre, descripcion, color, icono, nivel_jerarquia, es_sistema, es_editable)
    VALUES (p_empresa_id, 'admin_empresa', 'Administrador', 'Gestión completa de la empresa', '#3B82F6', 'shield', 1, true, false)
    RETURNING id INTO v_rol_admin_id;
    
    -- Permisos Admin (acceso total a su empresa)
    INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
    SELECT v_rol_admin_id, m.codigo, true, true, true, true, true, true, true, false, true
    FROM modulos_sistema m WHERE m.activo = true;
    
    -- ROL: Médico
    INSERT INTO roles_empresa (empresa_id, codigo, nombre, descripcion, color, icono, nivel_jerarquia, es_sistema, es_editable)
    VALUES (p_empresa_id, 'medico', 'Médico', 'Atención clínica y diagnóstico', '#10B981', 'stethoscope', 2, true, true)
    RETURNING id INTO v_rol_medico_id;
    
    -- Permisos Médico
    INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
    VALUES
        (v_rol_medico_id, 'dashboard', true, false, false, false, false, false, false, false, false),
        (v_rol_medico_id, 'pacientes', true, true, true, false, true, false, false, false, true),
        (v_rol_medico_id, 'citas', true, true, true, false, true, false, false, false, true),
        (v_rol_medico_id, 'expedientes', true, true, true, false, true, false, true, true, true),
        (v_rol_medico_id, 'estudios', true, true, true, false, true, false, true, true, true),
        (v_rol_medico_id, 'recetas', true, true, true, false, true, false, false, true, true),
        (v_rol_medico_id, 'reportes', true, true, false, false, true, false, false, false, true),
        (v_rol_medico_id, 'inventario', true, false, false, false, false, false, false, false, false),
        (v_rol_medico_id, 'ia', true, false, false, false, false, false, false, false, false);
    
    -- ROL: Enfermera
    INSERT INTO roles_empresa (empresa_id, codigo, nombre, descripcion, color, icono, nivel_jerarquia, es_sistema, es_editable)
    VALUES (p_empresa_id, 'enfermera', 'Enfermería', 'Apoyo clínico y toma de signos', '#EC4899', 'heart-pulse', 3, true, true)
    RETURNING id INTO v_rol_enfermera_id;
    
    -- Permisos Enfermera
    INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
    VALUES
        (v_rol_enfermera_id, 'dashboard', true, false, false, false, false, false, false, false, false),
        (v_rol_enfermera_id, 'pacientes', true, false, true, false, false, false, false, false, false),
        (v_rol_enfermera_id, 'citas', true, false, true, false, false, false, false, false, false),
        (v_rol_enfermera_id, 'expedientes', true, false, true, false, false, false, false, false, true),
        (v_rol_enfermera_id, 'estudios', true, true, true, false, false, false, false, false, true);
    
    -- ROL: Recepción
    INSERT INTO roles_empresa (empresa_id, codigo, nombre, descripcion, color, icono, nivel_jerarquia, es_sistema, es_editable)
    VALUES (p_empresa_id, 'recepcion', 'Recepción', 'Atención al público y citas', '#06B6D4', 'phone', 4, true, true)
    RETURNING id INTO v_rol_recepcion_id;
    
    -- Permisos Recepción
    INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
    VALUES
        (v_rol_recepcion_id, 'dashboard', true, false, false, false, false, false, false, false, false),
        (v_rol_recepcion_id, 'pacientes', true, true, true, false, false, false, false, false, true),
        (v_rol_recepcion_id, 'citas', true, true, true, true, true, true, false, false, true),
        (v_rol_recepcion_id, 'facturacion', true, true, false, false, false, false, false, false, true);
    
    -- ROL: Asistente
    INSERT INTO roles_empresa (empresa_id, codigo, nombre, descripcion, color, icono, nivel_jerarquia, es_sistema, es_editable)
    VALUES (p_empresa_id, 'asistente', 'Asistente', 'Apoyo administrativo general', '#8B5CF6', 'clipboard', 5, true, true)
    RETURNING id INTO v_rol_asistente_id;
    
    -- Permisos Asistente
    INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
    VALUES
        (v_rol_asistente_id, 'dashboard', true, false, false, false, false, false, false, false, false),
        (v_rol_asistente_id, 'pacientes', true, false, false, false, false, false, false, false, false),
        (v_rol_asistente_id, 'citas', true, false, true, false, false, false, false, false, false),
        (v_rol_asistente_id, 'reportes', true, false, false, false, true, false, false, false, true);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TRIGGER PARA AUTO-CREAR ROLES AL CREAR EMPRESA
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_crear_roles_empresa()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM crear_roles_base_empresa(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_crear_roles_empresa ON empresas;
CREATE TRIGGER tr_crear_roles_empresa
    AFTER INSERT ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_crear_roles_empresa();

-- =====================================================
-- 8. RLS (Row Level Security)
-- =====================================================

ALTER TABLE roles_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones_usuario ENABLE ROW LEVEL SECURITY;

-- Política: Ver roles de mi empresa o roles globales
CREATE POLICY roles_empresa_select ON roles_empresa
    FOR SELECT USING (
        empresa_id IS NULL OR 
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

-- Política: Solo admin puede insertar/actualizar roles de su empresa
CREATE POLICY roles_empresa_insert ON roles_empresa
    FOR INSERT WITH CHECK (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM roles_empresa r 
                JOIN profiles p ON p.rol_empresa_id = r.id 
                WHERE p.id = auth.uid() AND r.codigo = 'admin_empresa')
    );

CREATE POLICY roles_empresa_update ON roles_empresa
    FOR UPDATE USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()) AND
        es_editable = true
    );

-- Política para permisos
CREATE POLICY permisos_rol_select ON permisos_rol
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM roles_empresa r 
                WHERE r.id = rol_id AND (r.empresa_id IS NULL OR r.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())))
    );

-- Política para invitaciones
CREATE POLICY invitaciones_select ON invitaciones_usuario
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY invitaciones_insert ON invitaciones_usuario
    FOR INSERT WITH CHECK (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

-- =====================================================
-- 9. FUNCIÓN PARA GENERAR TOKEN DE INVITACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION generar_token_invitacion()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. FUNCIÓN PARA ACEPTAR INVITACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION aceptar_invitacion(p_token VARCHAR(64), p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_invitacion invitaciones_usuario%ROWTYPE;
BEGIN
    -- Buscar invitación válida
    SELECT * INTO v_invitacion 
    FROM invitaciones_usuario 
    WHERE token = p_token AND usado = false AND expira_en > NOW();
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Actualizar perfil del usuario
    UPDATE profiles SET
        empresa_id = v_invitacion.empresa_id,
        rol_empresa_id = v_invitacion.rol_empresa_id,
        sedes_acceso = v_invitacion.sedes_acceso,
        cargo = v_invitacion.cargo,
        nombre = COALESCE(nombre, v_invitacion.nombre),
        activo = true,
        invitado_por = v_invitacion.creado_por
    WHERE id = p_user_id;
    
    -- Marcar invitación como usada
    UPDATE invitaciones_usuario SET usado = true WHERE id = v_invitacion.id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE roles_empresa IS 'Roles personalizados por empresa. Los roles del sistema tienen es_sistema=true';
COMMENT ON TABLE permisos_rol IS 'Permisos granulares por rol y módulo';
COMMENT ON TABLE invitaciones_usuario IS 'Invitaciones pendientes para nuevos usuarios';
COMMENT ON FUNCTION crear_roles_base_empresa IS 'Auto-crea los 5 roles base cuando se crea una nueva empresa';
