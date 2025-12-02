-- Migration: create_prescriptions_orders_results_tables
-- Created at: 1762189406

-- Tabla de recetas médicas
CREATE TABLE IF NOT EXISTS recetas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  encuentro_id uuid REFERENCES encuentros(id) ON DELETE SET NULL,
  doctor_id uuid NOT NULL REFERENCES usuarios_perfil(id),
  fecha_receta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_receta VARCHAR(50) UNIQUE,
  diagnostico TEXT,
  observaciones TEXT,
  vigencia_dias INTEGER DEFAULT 30,
  dispensada BOOLEAN DEFAULT false,
  fecha_dispensacion TIMESTAMP WITH TIME ZONE,
  farmacia_dispensacion VARCHAR(255),
  medicamentos JSONB NOT NULL, -- array de medicamentos con detalles
  -- Estructura medicamentos: [{medicamento: "", dosis: "", frecuencia: "", duracion: "", indicaciones: ""}]
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de órdenes de estudio
CREATE TABLE IF NOT EXISTS ordenes_estudio (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  encuentro_id uuid REFERENCES encuentros(id) ON DELETE SET NULL,
  doctor_id uuid NOT NULL REFERENCES usuarios_perfil(id),
  fecha_orden TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_orden VARCHAR(50) UNIQUE,
  tipo_estudio VARCHAR(100) NOT NULL, -- laboratorio, imagen, etc.
  estudios JSONB NOT NULL, -- array de estudios solicitados
  -- Estructura estudios: [{estudio: "", observaciones: "", urgente: false, fecha_limite: ""}]
  prioridad VARCHAR(20) DEFAULT 'normal', -- normal, urgente, estadisticas
  instrucciones TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en_proceso, completado, cancelado
  fecha_programada TIMESTAMP WITH TIME ZONE,
  tecnico_id uuid REFERENCES usuarios_perfil(id),
  resultados_completados BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de estudio
CREATE TABLE IF NOT EXISTS resultados_estudio (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  orden_estudio_id uuid NOT NULL REFERENCES ordenes_estudio(id) ON DELETE CASCADE,
  estudio_individual VARCHAR(100) NOT NULL, -- nombre específico del estudio
  fecha_resultado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tecnico_id uuid REFERENCES usuarios_perfil(id),
  resultados_detalle JSONB NOT NULL, -- valores específicos y rangos
  -- Estructura: {parametro: "", valor: "", unidad: "", rango_referencia: "", flag: "normal|alto|bajo"}
  hallazgos TEXT,
  conclusion TEXT,
  recomendaciones TEXT,
  imagenes_url TEXT[], -- URLs de imágenes relacionadas
  archivos_adjuntos TEXT[], -- URLs de archivos
  revision_medica BOOLEAN DEFAULT false,
  doctor_revision_id uuid REFERENCES usuarios_perfil(id),
  fecha_revision TIMESTAMP WITH TIME ZONE,
  notas_revision TEXT,
  notificado_paciente BOOLEAN DEFAULT false,
  fecha_notificacion TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_recetas_empresa_id ON recetas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_recetas_sede_id ON recetas(sede_id);
CREATE INDEX IF NOT EXISTS idx_recetas_paciente_id ON recetas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recetas_doctor_id ON recetas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_recetas_fecha ON recetas(fecha_receta);
CREATE INDEX IF NOT EXISTS idx_recetas_numero ON recetas(numero_receta);
CREATE INDEX IF NOT EXISTS idx_recetas_dispensada ON recetas(dispensada);

CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_empresa_id ON ordenes_estudio(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_sede_id ON ordenes_estudio(sede_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_paciente_id ON ordenes_estudio(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_doctor_id ON ordenes_estudio(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_fecha ON ordenes_estudio(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_numero ON ordenes_estudio(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_tipo ON ordenes_estudio(tipo_estudio);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_estado ON ordenes_estudio(estado);

CREATE INDEX IF NOT EXISTS idx_resultados_estudio_empresa_id ON resultados_estudio(empresa_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_orden_id ON resultados_estudio(orden_estudio_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_fecha ON resultados_estudio(fecha_resultado);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_estudio ON resultados_estudio(estudio_individual);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_tecnico_id ON resultados_estudio(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_revision ON resultados_estudio(revision_medica);;