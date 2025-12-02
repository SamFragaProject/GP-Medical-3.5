-- Migration: alter_appointments_encounters_tables
-- Created at: 1762189380

-- Agregar columnas faltantes a tabla citas
ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS tipo_cita VARCHAR(100),
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS fecha_recordatorio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelado_por uuid REFERENCES usuarios_perfil(id),
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT,
ADD COLUMN IF NOT EXISTS cita_original_id uuid REFERENCES citas(id),
ADD COLUMN IF NOT EXISTS fecha_hora_inicio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_hora_fin TIMESTAMP WITH TIME ZONE;

-- Actualizar fecha_hora_inicio si no existe fecha_hora_inicio
UPDATE citas SET fecha_hora_inicio = fecha_hora WHERE fecha_hora_inicio IS NULL;

-- Cambiar nombre de medico_id a doctor_id si es necesario
ALTER TABLE citas RENAME COLUMN medico_id TO doctor_id;

-- Tabla de encuentros clínicos
CREATE TABLE IF NOT EXISTS encuentros (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  cita_id uuid REFERENCES citas(id),
  doctor_id uuid REFERENCES usuarios_perfil(id),
  fecha_encuentro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_encuentro VARCHAR(100) NOT NULL,
  motivo_consulta TEXT,
  diagnostico_principal TEXT,
  diagnosticos_secundarios TEXT[],
  tratamiento_prescrito TEXT,
  proxima_cita_recomendada DATE,
  estado_paciente VARCHAR(50),
  signos_vitales JSONB,
  medicamentos_prescritos JSONB,
  examenes_solicitados JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notas clínicas
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  encuentro_id uuid NOT NULL REFERENCES encuentros(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES usuarios_perfil(id),
  tipo_nota VARCHAR(100) NOT NULL,
  contenido TEXT NOT NULL,
  notas_privadas TEXT,
  fecha_nota TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modificada_por uuid REFERENCES usuarios_perfil(id),
  fecha_modificacion TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);;