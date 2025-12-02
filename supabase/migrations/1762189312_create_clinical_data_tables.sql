-- Migration: create_clinical_data_tables
-- Created at: 1762189312

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  numero_historia VARCHAR(50) UNIQUE,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  fecha_nacimiento DATE,
  genero VARCHAR(10),
  estado_civil VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  contacto_emergencia_nombre VARCHAR(255),
  contacto_emergencia_telefono VARCHAR(20),
  aseguradora VARCHAR(255),
  numero_poliza VARCHAR(100),
  tipo_sangre VARCHAR(10),
  alergias TEXT,
  medicamentos_actuales TEXT,
  antecedentes_familiares TEXT,
  antecedentes_personales TEXT,
  observacion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  archivo_tipo VARCHAR(50),
  archivo_tamaño INTEGER,
  fecha_documento DATE,
  subido_por uuid REFERENCES usuarios_perfil(id),
  tags TEXT[],
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de consentimientos informados
CREATE TABLE IF NOT EXISTS consentimientos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  procedimiento VARCHAR(255) NOT NULL,
  descripcion_procedimiento TEXT,
  riesgos TEXT,
  beneficios TEXT,
  alternativas TEXT,
  fecha_consentimiento TIMESTAMP WITH TIME ZONE,
  paciente_firmado BOOLEAN DEFAULT false,
  paciente_fecha_firma TIMESTAMP WITH TIME ZONE,
  testigo_nombre VARCHAR(255),
  testigo_documento VARCHAR(50),
  testigo_firmado BOOLEAN DEFAULT false,
  testigo_fecha_firma TIMESTAMP WITH TIME ZONE,
  doctor_id uuid REFERENCES usuarios_perfil(id),
  doctor_firmado BOOLEAN DEFAULT false,
  doctor_fecha_firma TIMESTAMP WITH TIME ZONE,
  documento_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_sede_id ON pacientes(sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON pacientes(activo);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_paciente_id ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_activo ON documentos(activo);
CREATE INDEX IF NOT EXISTS idx_consentimientos_empresa_id ON consentimientos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_paciente_id ON consentimientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_fecha ON consentimientos(fecha_consentimiento);
CREATE INDEX IF NOT EXISTS idx_consentimientos_activo ON consentimientos(activo);;