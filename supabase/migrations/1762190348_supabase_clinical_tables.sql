-- Migration: supabase_clinical_tables
-- Created at: 1762190348

-- =============================================================================
-- TABLAS CLÍNICAS
-- =============================================================================

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  numero_paciente varchar(50),
  nombre varchar(255) NOT NULL,
  apellidos varchar(255) NOT NULL,
  fecha_nacimiento date,
  genero enum_genero,
  tipo_documento varchar(20) DEFAULT 'CI',
  numero_documento varchar(50),
  email varchar(255),
  telefono varchar(20),
  direccion text,
  ciudad varchar(100),
  pais varchar(100) DEFAULT 'Bolivia',
  contacto_emergencia jsonb DEFAULT '{}',
  seguro_medico jsonb DEFAULT '{}',
  alergias jsonb DEFAULT '[]',
  medicamentos jsonb DEFAULT '[]',
  diagnosticos_previos jsonb DEFAULT '[]',
  estado enum_estado_paciente DEFAULT 'activo',
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, numero_paciente),
  UNIQUE(empresa_id, numero_documento)
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento varchar(50) NOT NULL,
  titulo varchar(255) NOT NULL,
  archivo_url text,
  archivo_metadata jsonb DEFAULT '{}',
  contenido_text text,
  fecha_documento timestamp with time zone DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de consentimientos
CREATE TABLE IF NOT EXISTS consentimientos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_consentimiento varchar(100) NOT NULL,
  descripcion text NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamp with time zone,
  revoked_at timestamp with time zone,
  documento_url text,
  witness_signature text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_user_id uuid NOT NULL REFERENCES auth.users(id),
  fecha_hora timestamp with time zone NOT NULL,
  duracion_minutos integer DEFAULT 30,
  tipo_cita varchar(50) DEFAULT 'consulta',
  motivo text,
  estado enum_estado_cita DEFAULT 'programada',
  notas_previas text,
  notas_posteriores text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de encuentros
CREATE TABLE IF NOT EXISTS encuentros (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id uuid REFERENCES citas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_user_id uuid NOT NULL REFERENCES auth.users(id),
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone,
  tipo_encuentro varchar(50) DEFAULT 'consulta',
  motivo_consulta text,
  diagnostico_principal text,
  diagnosticos_secundarios jsonb DEFAULT '[]',
  tratamiento text,
  proximos_pasos text,
  estado enum_estado_encuentro DEFAULT 'en_curso',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de notas clínicas
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  encuentro_id uuid NOT NULL REFERENCES encuentros(id) ON DELETE CASCADE,
  medico_user_id uuid NOT NULL REFERENCES auth.users(id),
  tipo_nota varchar(50) NOT NULL,
  contenido text NOT NULL,
  fecha_nota timestamp with time zone DEFAULT now(),
  private boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de recetas
CREATE TABLE IF NOT EXISTS recetas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  encuentro_id uuid NOT NULL REFERENCES encuentros(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_user_id uuid NOT NULL REFERENCES auth.users(id),
  medicamentos jsonb NOT NULL DEFAULT '[]',
  instrucciones text,
  fecha_prescripcion timestamp with time zone DEFAULT now(),
  fecha_vencimiento timestamp with time zone,
  estado enum_estado_receta DEFAULT 'activa',
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de órdenes de estudio
CREATE TABLE IF NOT EXISTS ordenes_estudio (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  encuentro_id uuid NOT NULL REFERENCES encuentros(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_user_id uuid NOT NULL REFERENCES auth.users(id),
  tipo_estudio varchar(100) NOT NULL,
  descripcion text,
  fecha_orden timestamp with time zone DEFAULT now(),
  fecha_programada timestamp with time zone,
  resultados jsonb DEFAULT '{}',
  estado enum_estado_orden_estudio DEFAULT 'pendiente',
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de resultados de estudio
CREATE TABLE IF NOT EXISTS resultados_estudio (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_estudio_id uuid NOT NULL REFERENCES ordenes_estudio(id) ON DELETE CASCADE,
  fecha_resultado timestamp with time zone DEFAULT now(),
  resultado_completo jsonb NOT NULL,
  observaciones text,
  archivo_url text,
  tecnico_user_id uuid REFERENCES auth.users(id),
  revisado_por uuid REFERENCES auth.users(id),
  fecha_revision timestamp with time zone,
  estado enum_estado_resultado_estudio DEFAULT 'pendiente',
  created_at timestamp with time zone DEFAULT now()
);

SELECT 'Tablas clínicas aplicadas exitosamente' as status, now() as timestamp;;