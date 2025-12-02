-- Migration: alter_pacientes_table_add_missing_columns
-- Created at: 1762189328

-- Agregar columnas faltantes a tabla pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS numero_historia VARCHAR(50),
ADD COLUMN IF NOT EXISTS nombres VARCHAR(255),
ADD COLUMN IF NOT EXISTS documento VARCHAR(50),
ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20),
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS aseguradora VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero_poliza VARCHAR(100),
ADD COLUMN IF NOT EXISTS tipo_sangre VARCHAR(10),
ADD COLUMN IF NOT EXISTS alergias TEXT,
ADD COLUMN IF NOT EXISTS medicamentos_actuales TEXT,
ADD COLUMN IF NOT EXISTS antecedentes_familiares TEXT,
ADD COLUMN IF NOT EXISTS antecedentes_personales TEXT),
ADD COLUMN IF NOT EXISTS observacion TEXT;

-- Cambiar nombres de columnas existentes si es necesario
ALTER TABLE pacientes RENAME COLUMN nombre TO nombres_completo;
ALTER TABLE pacientes RENAME COLUMN sexo TO genero;

-- Combinar nombres y apellidos en nombres si no existe
UPDATE pacientes SET nombres = COALESCE(nombres, nombres_completo) WHERE nombres IS NULL;

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
);;