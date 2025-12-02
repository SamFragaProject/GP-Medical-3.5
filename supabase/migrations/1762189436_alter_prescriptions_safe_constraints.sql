-- Migration: alter_prescriptions_safe_constraints
-- Created at: 1762189436

-- Agregar columnas faltantes a tabla recetas sin constraint estricto inicialmente
ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS empresa_id uuid,
ADD COLUMN IF NOT EXISTS sede_id uuid,
ADD COLUMN IF NOT EXISTS encuentro_id uuid,
ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES usuarios_perfil(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS fecha_receta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS numero_receta VARCHAR(50),
ADD COLUMN IF NOT EXISTS diagnostico TEXT,
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS vigencia_dias INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS dispensada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_dispensacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS farmacia_dispensacion VARCHAR(255),
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- Actualizar campos con datos existentes
UPDATE recetas SET fecha_receta = fecha_emision WHERE fecha_receta IS NULL AND fecha_emision IS NOT NULL;

-- Tabla de órdenes de estudio
CREATE TABLE IF NOT EXISTS ordenes_estudio (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  encuentro_id uuid REFERENCES encuentros(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES usuarios_perfil(id) ON DELETE SET NULL,
  fecha_orden TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_orden VARCHAR(50) UNIQUE,
  tipo_estudio VARCHAR(100) NOT NULL,
  estudios JSONB NOT NULL,
  prioridad VARCHAR(20) DEFAULT 'normal',
  instrucciones TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_programada TIMESTAMP WITH TIME ZONE,
  tecnico_id uuid REFERENCES usuarios_perfil(id) ON DELETE SET NULL,
  resultados_completados BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de estudio
CREATE TABLE IF NOT EXISTS resultados_estudio (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  orden_estudio_id uuid NOT NULL REFERENCES ordenes_estudio(id) ON DELETE CASCADE,
  estudio_individual VARCHAR(100) NOT NULL,
  fecha_resultado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tecnico_id uuid REFERENCES usuarios_perfil(id) ON DELETE SET NULL,
  resultados_detalle JSONB NOT NULL,
  hallazgos TEXT,
  conclusion TEXT,
  recomendaciones TEXT,
  imagenes_url TEXT[],
  archivos_adjuntos TEXT[],
  revision_medica BOOLEAN DEFAULT false,
  doctor_revision_id uuid REFERENCES usuarios_perfil(id) ON DELETE SET NULL,
  fecha_revision TIMESTAMP WITH TIME ZONE,
  notas_revision TEXT,
  notificado_paciente BOOLEAN DEFAULT false,
  fecha_notificacion TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);;