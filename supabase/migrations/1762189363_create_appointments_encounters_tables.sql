-- Migration: create_appointments_encounters_tables
-- Created at: 1762189363

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES usuarios_perfil(id),
  tipo_cita VARCHAR(100) NOT NULL,
  motivo_consulta TEXT,
  fecha_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_hora_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, en_proceso, completada, cancelada, no_asistio
  observaciones TEXT,
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  cancelado_por uuid REFERENCES usuarios_perfil(id),
  motivo_cancelacion TEXT,
  cita_original_id uuid REFERENCES citas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de encuentros clínicos
CREATE TABLE IF NOT EXISTS encuentros (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  cita_id uuid REFERENCES citas(id),
  doctor_id uuid REFERENCES usuarios_perfil(id),
  fecha_encuentro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_encuentro VARCHAR(100) NOT NULL, -- consulta, emergencia, seguimiento, etc.
  motivo_consulta TEXT,
  diagnostico_principal TEXT,
  diagnosticos_secundarios TEXT[],
  tratamiento_prescrito TEXT,
  proxima_cita_recomendada DATE,
  estado_paciente VARCHAR(50), -- estable, grave, critico, mejorado, etc.
  signos_vitales JSONB, -- {presion_arterial: "120/80", frecuencia_cardiaca: 72, temperatura: 36.5, etc.}
  medicamentos_prescritos JSONB, -- array de medicamentos con dosis y frecuencias
  examenes_solicitados JSONB, -- array de exámenes ordenados
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
  tipo_nota VARCHAR(100) NOT NULL, -- evolutiva, pre-operatoria, post-operatoria, etc.
  contenido TEXT NOT NULL,
  notas_privadas TEXT, -- notas que solo ve el médico
  fecha_nota TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modificada_por uuid REFERENCES usuarios_perfil(id),
  fecha_modificacion TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_citas_empresa_id ON citas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_citas_sede_id ON citas(sede_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_id ON citas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

CREATE INDEX IF NOT EXISTS idx_encuentros_empresa_id ON encuentros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_sede_id ON encuentros(sede_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_paciente_id ON encuentros(paciente_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_doctor_id ON encuentros(doctor_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_fecha ON encuentros(fecha_encuentro);

CREATE INDEX IF NOT EXISTS idx_notas_clinicas_empresa_id ON notas_clinicas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_encuentro_id ON notas_clinicas(encuentro_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_doctor_id ON notas_clinicas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_fecha ON notas_clinicas(fecha_nota);;