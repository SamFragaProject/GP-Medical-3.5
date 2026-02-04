-- ============================================
-- ESQUEMA DE BASE DE DATOS - GPMedical ERP
-- Medicina Ocupacional SaaS Multi-Tenant
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLAS CORE
-- ============================================

-- Empresas (Tenants principales - tus clientes)
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(13),
  razon_social VARCHAR(255),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'basico', -- basico, profesional, enterprise
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sedes (sucursales de cada empresa)
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios (empleados del sistema)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  empresa_id UUID REFERENCES empresas(id),
  sede_id UUID REFERENCES sedes(id),
  rol VARCHAR(50) NOT NULL DEFAULT 'paciente',
  -- Roles: super_admin, admin_saas, contador_saas, admin_empresa, medico, enfermera, recepcion, asistente, paciente
  cedula_profesional VARCHAR(20),
  especialidad VARCHAR(100),
  telefono VARCHAR(20),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLAS DE PACIENTES
-- ============================================

-- Empresas cliente (empresas que envían trabajadores)
CREATE TABLE IF NOT EXISTS empresas_cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- Tu empresa
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(13),
  contacto_nombre VARCHAR(255),
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacientes (trabajadores)
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_cliente_id UUID REFERENCES empresas_cliente(id),
  numero_empleado VARCHAR(50),
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  curp VARCHAR(18),
  nss VARCHAR(11), -- Número de seguro social
  rfc VARCHAR(13),
  fecha_nacimiento DATE,
  genero VARCHAR(20),
  estado_civil VARCHAR(50),
  escolaridad VARCHAR(100),
  puesto VARCHAR(255),
  departamento VARCHAR(255),
  antiguedad_empresa DATE,
  tipo_sangre VARCHAR(5),
  alergias TEXT,
  enfermedades_cronicas TEXT,
  telefono VARCHAR(20),
  telefono_emergencia VARCHAR(20),
  contacto_emergencia VARCHAR(255),
  email VARCHAR(255),
  direccion TEXT,
  foto_url TEXT,
  estatus VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, incapacidad
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABLAS DE CITAS Y EXÁMENES
-- ============================================

-- Citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES usuarios(id),
  sede_id UUID REFERENCES sedes(id),
  tipo VARCHAR(100) NOT NULL, -- pre_empleo, periodico, egreso, especial, consulta
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,
  estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, en_curso, completada, cancelada, no_asistio
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de exámenes (catálogo)
CREATE TABLE IF NOT EXISTS tipos_examen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_minutos INT DEFAULT 30,
  precio DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exámenes realizados
CREATE TABLE IF NOT EXISTS examenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  cita_id UUID REFERENCES citas(id),
  tipo_examen_id UUID REFERENCES tipos_examen(id),
  medico_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(100) NOT NULL, -- pre_empleo, periodico, egreso, especial
  fecha DATE NOT NULL,
  resultados JSONB, -- Datos del examen
  observaciones TEXT,
  dictamen VARCHAR(50), -- apto, apto_con_restricciones, no_apto, pendiente
  restricciones TEXT,
  vigencia_hasta DATE,
  certificado_url TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en_proceso, completado, cancelado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historia clínica
CREATE TABLE IF NOT EXISTS historia_clinica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES usuarios(id),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  tipo VARCHAR(50), -- consulta, nota, antecedente
  -- Formato SOAP
  subjetivo TEXT, -- Lo que el paciente refiere
  objetivo TEXT, -- Lo que el médico observa
  analisis TEXT, -- Diagnóstico/análisis
  plan TEXT, -- Tratamiento/plan
  diagnostico_cie10 VARCHAR(20),
  diagnostico_descripcion TEXT,
  signos_vitales JSONB, -- {peso, talla, presion, temperatura, fc, fr, spo2}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLAS DE FACTURACIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_cliente_id UUID REFERENCES empresas_cliente(id),
  folio VARCHAR(50),
  uuid_cfdi VARCHAR(50),
  fecha DATE NOT NULL,
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2),
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagada, cancelada
  xml_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historia_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener empresa_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función helper para verificar si es super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND rol IN ('super_admin', 'admin_saas')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- POLÍTICAS: Super Admin ve todo
CREATE POLICY "Super admin full access" ON empresas
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super admin full access" ON usuarios
  FOR ALL USING (is_super_admin());

-- POLÍTICAS: Usuarios ven solo su empresa
CREATE POLICY "Users see own empresa" ON empresas
  FOR SELECT USING (id = get_user_empresa_id());

CREATE POLICY "Users see own empresa sedes" ON sedes
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa usuarios" ON usuarios
  FOR SELECT USING (empresa_id = get_user_empresa_id() OR id = auth.uid());

CREATE POLICY "Users see own empresa clientes" ON empresas_cliente
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa pacientes" ON pacientes
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa citas" ON citas
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa tipos_examen" ON tipos_examen
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa examenes" ON examenes
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa historia" ON historia_clinica
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users see own empresa facturas" ON facturas
  FOR ALL USING (empresa_id = get_user_empresa_id());

-- ============================================
-- 7. DATOS INICIALES
-- ============================================

-- Empresa demo (tu empresa)
INSERT INTO empresas (id, nombre, rfc, plan, activo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'GPMedical', 'GPM123456ABC', 'enterprise', true);

-- Sede demo
INSERT INTO sedes (empresa_id, nombre, direccion) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sede Principal', 'CDMX, México');

-- NOTA: Los usuarios se crean mediante Supabase Auth
-- Después de crear un usuario en Auth, insertar aquí con el mismo ID

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
