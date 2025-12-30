-- =====================================================
-- ESQUEMA COMPLETO - ERP MÉDICO MEDICINA DEL TRABAJO
-- Sistema SaaS Multi-tenant con Autenticación Real
-- =====================================================

-- NOTA: Este esquema debe ejecutarse en Supabase
-- Ejecutar en: Dashboard de Supabase > SQL Editor

-- =====================================================
-- 1. TABLAS DE EMPRESAS Y ESTRUCTURA ORGANIZACIONAL
-- =====================================================

CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  rfc TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  logo_url TEXT,
  plan_id TEXT DEFAULT 'basico' CHECK (plan_id IN ('basico', 'profesional', 'empresarial', 'corporativo')),
  activa BOOLEAN DEFAULT true,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS puestos_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel_riesgo TEXT CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto', 'muy_alto')),
  protocolo_examen_id UUID,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA DE PERFILES (INTEGRADA CON SUPABASE AUTH)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- Debe coincidir con auth.users.id
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT,
  apellido_materno TEXT,
  empresa_id UUID NOT NULL,
  sede_id UUID,
  -- Jerarquías del sistema (roles)
  hierarchy TEXT NOT NULL CHECK (hierarchy IN (
    'super_admin',          -- Administrador del sistema SaaS
    'admin_empresa',        -- Administrador de empresa cliente
    'medico_trabajo',       -- Médico del Trabajo
    'medico_especialista',  -- Médico Especialista
    'medico_industrial',    -- Médico Industrial
    'enfermera',            -- Enfermera
    'audiometrista',        -- Técnico Audiometrista
    'psicologo_laboral',    -- Psicólogo Laboral
    'recepcion',            -- Personal de Recepción
    'paciente'              -- Empleado/Paciente
  )),
  avatar_url TEXT,
  telefono TEXT,
  cedula_profesional TEXT,
  especialidad TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{
    "theme": "light",
    "language": "es",
    "timezone": "America/Mexico_City",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false,
      "appointmentReminders": true,
      "systemAlerts": true
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SISTEMA DE PERMISOS CENTRALIZADO
-- =====================================================

CREATE TABLE IF NOT EXISTS permisos_rol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hierarchy TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  resource TEXT NOT NULL, -- 'patients', 'examinations', 'billing', 'reports', 'inventory', etc.
  action TEXT NOT NULL,   -- 'create', 'read', 'update', 'delete', 'manage'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hierarchy, permission_key)
);

-- Insertar permisos por jerarquía
INSERT INTO permisos_rol (hierarchy, permission_key, resource, action, description) VALUES
-- Super Admin: Acceso total
('super_admin', 'all_access', '*', '*', 'Acceso total al sistema'),

-- Admin Empresa: Gestión completa de su empresa
('admin_empresa', 'patients_manage', 'patients', 'manage', 'Gestión completa de pacientes'),
('admin_empresa', 'medical_view', 'examinations', 'read', 'Ver historial médico'),
('admin_empresa', 'exams_manage', 'examinations', 'manage', 'Gestión de exámenes'),
('admin_empresa', 'billing_manage', 'billing', 'manage', 'Gestión de facturación'),
('admin_empresa', 'reports_view', 'reports', 'read', 'Ver reportes'),
('admin_empresa', 'inventory_manage', 'inventory', 'manage', 'Gestión de inventario'),
('admin_empresa', 'agenda_manage', 'appointments', 'manage', 'Gestión de agenda'),
('admin_empresa', 'system_admin', 'system', 'admin', 'Administración del sistema'),

-- Médico del Trabajo
('medico_trabajo', 'patients_manage', 'patients', 'manage', 'Gestión de pacientes'),
('medico_trabajo', 'medical_view', 'examinations', 'read', 'Ver historial médico'),
('medico_trabajo', 'exams_manage', 'examinations', 'manage', 'Gestión de exámenes'),
('medico_trabajo', 'reports_view', 'reports', 'read', 'Ver reportes'),
('medico_trabajo', 'agenda_manage', 'appointments', 'manage', 'Gestión de agenda'),

-- Médico Especialista
('medico_especialista', 'patients_manage', 'patients', 'manage', 'Gestión de pacientes'),
('medico_especialista', 'medical_view', 'examinations', 'read', 'Ver historial médico'),
('medico_especialista', 'exams_manage', 'examinations', 'manage', 'Gestión de exámenes'),
('medico_especialista', 'reports_view', 'reports', 'read', 'Ver reportes'),

-- Recepción
('recepcion', 'patients_manage', 'patients', 'manage', 'Gestión de pacientes'),
('recepcion', 'billing_view', 'billing', 'read', 'Ver facturación'),
('recepcion', 'agenda_manage', 'appointments', 'manage', 'Gestión de agenda'),

-- Paciente
('paciente', 'medical_view', 'examinations', 'read', 'Ver su propio historial médico')
ON CONFLICT (hierarchy, permission_key) DO NOTHING;

-- =====================================================
-- 4. TABLAS DE PACIENTES Y MEDICINA DEL TRABAJO
-- =====================================================

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  numero_empleado TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  fecha_nacimiento DATE NOT NULL,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro')),
  email TEXT,
  telefono TEXT,
  puesto_trabajo_id UUID,
  estatus TEXT DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo', 'incapacitado', 'suspendido')),
  nss TEXT,
  curp TEXT,
  tipo_sangre TEXT,
  alergias TEXT,
  enfermedades_cronicas TEXT,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero_empleado)
);

CREATE TABLE IF NOT EXISTS protocolos_medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_examen TEXT NOT NULL CHECK (tipo_examen IN ('ingreso', 'periodico', 'egreso', 'post_incidente', 'reintegro')),
  examenes_incluidos JSONB NOT NULL DEFAULT '[]'::jsonb,
  vigencia_dias INTEGER DEFAULT 365,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS examenes_ocupacionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  medico_id UUID,
  protocolo_id UUID,
  tipo_examen TEXT NOT NULL CHECK (tipo_examen IN ('ingreso', 'periodico', 'egreso', 'post_incidente', 'reintegro')),
  fecha_programada DATE,
  fecha_realizada DATE,
  estado TEXT DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado')),
  aptitud_medica TEXT CHECK (aptitud_medica IN ('apto', 'apto_con_limitaciones', 'no_apto', 'pendiente')),
  limitaciones TEXT,
  observaciones_medicas TEXT,
  recomendaciones TEXT,
  fecha_vigencia DATE,
  resultados JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_medico_laboral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('examen', 'incapacidad', 'accidente', 'enfermedad', 'vacunacion', 'otro')),
  fecha_evento DATE NOT NULL,
  descripcion TEXT NOT NULL,
  diagnostico TEXT,
  tratamiento TEXT,
  dias_incapacidad INTEGER DEFAULT 0,
  medico_id UUID,
  documentos JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluaciones_riesgo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  puesto_trabajo_id UUID,
  evaluador_id UUID NOT NULL,
  fecha_evaluacion DATE NOT NULL,
  tipo_evaluacion TEXT CHECK (tipo_evaluacion IN ('ergonomica', 'ambiental', 'psicosocial', 'integral')),
  factores_riesgo JSONB NOT NULL DEFAULT '[]'::jsonb,
  nivel_riesgo_general TEXT CHECK (nivel_riesgo_general IN ('bajo', 'medio', 'alto', 'muy_alto')),
  recomendaciones TEXT,
  plan_accion JSONB DEFAULT '[]'::jsonb,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')),
  documentos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TABLAS DE CERTIFICACIONES Y DICTÁMENES
-- =====================================================

CREATE TABLE IF NOT EXISTS certificaciones_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  examen_id UUID,
  medico_id UUID NOT NULL,
  tipo_certificado TEXT NOT NULL CHECK (tipo_certificado IN ('aptitud', 'incapacidad', 'reintegro', 'cambio_puesto', 'otro')),
  fecha_emision DATE NOT NULL,
  fecha_vigencia DATE,
  folio TEXT UNIQUE NOT NULL,
  contenido TEXT NOT NULL,
  firma_digital TEXT,
  estado TEXT DEFAULT 'vigente' CHECK (estado IN ('vigente', 'vencido', 'revocado')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABLAS DE AGENDA Y CITAS
-- =====================================================

CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  medico_id UUID,
  tipo_cita TEXT NOT NULL CHECK (tipo_cita IN ('examen_ocupacional', 'consulta', 'seguimiento', 'urgencia')),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
  motivo TEXT,
  notas TEXT,
  sala TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLAS DE INVENTARIO Y GESTIÓN
-- =====================================================

CREATE TABLE IF NOT EXISTS inventario_medico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre_producto TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('medicamento', 'insumo_medico', 'equipo', 'material_curacion', 'otro')),
  codigo_producto TEXT,
  cantidad_actual INTEGER DEFAULT 0,
  cantidad_minima INTEGER DEFAULT 0,
  unidad_medida TEXT,
  lote TEXT,
  fecha_caducidad DATE,
  ubicacion TEXT,
  proveedor TEXT,
  costo_unitario NUMERIC(10,2),
  estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible', 'agotado', 'por_vencer', 'vencido')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TABLAS DE CHATBOT Y SISTEMA DE QUEJAS
-- =====================================================

CREATE TABLE IF NOT EXISTS conversaciones_chatbot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  tipo_conversacion TEXT CHECK (tipo_conversacion IN ('asistente_usuario', 'soporte_tecnico', 'atc', 'quejas_sugerencias')),
  contexto_pagina TEXT,
  rol_usuario TEXT,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'escalada')),
  sentiment_general TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mensajes_chatbot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL,
  mensaje TEXT NOT NULL,
  es_usuario BOOLEAN NOT NULL,
  tipo_mensaje TEXT DEFAULT 'texto' CHECK (tipo_mensaje IN ('texto', 'imagen', 'archivo', 'audio')),
  sentiment TEXT CHECK (sentiment IN ('positivo', 'neutral', 'negativo')),
  confidence_score NUMERIC(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TABLAS DE ALERTAS Y NOTIFICACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS alertas_riesgo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('examen_vencido', 'certificado_proximo_vencer', 'inventario_bajo', 'incidencia_alta_riesgo', 'otro')),
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  entidad_id UUID,
  entidad_tipo TEXT,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'atendida', 'ignorada')),
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_atencion TIMESTAMPTZ,
  atendido_por UUID,
  notas TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. VISTAS PARA DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW vista_dashboard_empresa AS
SELECT 
  e.id as empresa_id,
  e.nombre as empresa_nombre,
  COUNT(DISTINCT p.id) as total_pacientes,
  COUNT(DISTINCT CASE WHEN ex.estado = 'programado' THEN ex.id END) as examenes_programados,
  COUNT(DISTINCT CASE WHEN ex.estado = 'completado' THEN ex.id END) as examenes_completados,
  COUNT(DISTINCT CASE WHEN c.estado = 'programada' THEN c.id END) as citas_pendientes,
  COUNT(DISTINCT CASE WHEN a.estado = 'activa' THEN a.id END) as alertas_activas
FROM empresas e
LEFT JOIN pacientes p ON e.id = p.empresa_id AND p.estatus = 'activo'
LEFT JOIN examenes_ocupacionales ex ON e.id = ex.empresa_id
LEFT JOIN citas c ON e.id = c.empresa_id
LEFT JOIN alertas_riesgo a ON e.id = a.empresa_id
GROUP BY e.id, e.nombre;

-- =====================================================
-- 11. FUNCIONES Y TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes_ocupacionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Política básica: Los usuarios solo ven datos de su empresa
CREATE POLICY "Usuarios ven datos de su empresa"
  ON pacientes FOR ALL
  USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios ven exámenes de su empresa"
  ON examenes_ocupacionales FOR ALL
  USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- Super admin ve todo
CREATE POLICY "Super admin ve todo"
  ON pacientes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND hierarchy = 'super_admin'
    )
  );

-- =====================================================
-- 13. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_empresa ON profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hierarchy ON profiles(hierarchy);
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_estatus ON pacientes(estatus);
CREATE INDEX IF NOT EXISTS idx_examenes_empresa ON examenes_ocupacionales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_examenes_paciente ON examenes_ocupacionales(paciente_id);
CREATE INDEX IF NOT EXISTS idx_examenes_estado ON examenes_ocupacionales(estado);
CREATE INDEX IF NOT EXISTS idx_citas_empresa ON citas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_alertas_empresa ON alertas_riesgo(empresa_id);
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_riesgo(estado);

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================

-- Para verificar que todo se creó correctamente:
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
