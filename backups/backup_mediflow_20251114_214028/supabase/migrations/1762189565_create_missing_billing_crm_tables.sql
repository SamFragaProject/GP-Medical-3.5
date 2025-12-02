-- Migration: create_missing_billing_crm_tables
-- Created at: 1762189565

-- Tabla de órdenes de cobro
CREATE TABLE IF NOT EXISTS ordenes_cobro (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  cita_id uuid REFERENCES citas(id),
  encuentro_id uuid REFERENCES encuentros(id),
  numero_orden VARCHAR(50) UNIQUE,
  fecha_orden TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuentos DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_vencimiento DATE,
  metodo_pago VARCHAR(50),
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de campañas
CREATE TABLE IF NOT EXISTS campañas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_campaña VARCHAR(100) NOT NULL, -- promocional, recordatorio, seguimiento, salud_publica
  canal VARCHAR(50) NOT NULL, -- email, sms, whatsapp, llamada, presencial
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  presupuesto DECIMAL(12,2),
  costo_real DECIMAL(12,2) DEFAULT 0,
  meta_objetivo TEXT, -- incrementar_citas, recordatorio_vacunas, seguimiento_pacientes, etc.
  target_audiencia TEXT, -- descripcion del grupo objetivo
  filtros_criterios JSONB, -- criterios para seleccionar pacientes objetivo
  contenido_mensaje TEXT,
  estado VARCHAR(50) DEFAULT 'planificada', -- planificada, activa, pausada, completada, cancelada
  responsable_id uuid REFERENCES usuarios_perfil(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_ultima_actividad TIMESTAMP WITH TIME ZONE,
  metricas JSONB DEFAULT '{}', -- envios, abiertos, clics, respuestas, conversiones
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  campaña_id uuid REFERENCES campañas(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_mensaje VARCHAR(100) NOT NULL, -- promocional, recordatorio, seguimiento, cumpleaños, etc.
  canal VARCHAR(50) NOT NULL, -- email, sms, whatsapp, llamada, presencial
  asunto VARCHAR(255),
  contenido TEXT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, enviado, entregado, leido, respondido, fallido
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  fecha_lectura TIMESTAMP WITH TIME ZONE,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  respuesta_contenido TEXT,
  usuario_creador uuid NOT NULL REFERENCES usuarios_perfil(id),
  usuario_envio uuid REFERENCES usuarios_perfil(id),
  error_mensaje TEXT,
  intentos_envio INTEGER DEFAULT 0,
  max_intentos INTEGER DEFAULT 3,
  prioridad VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
  tags TEXT[],
  metadata JSONB DEFAULT '{}', -- datos adicionales específicos del canal
  archivo_adjunto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas CRM
CREATE TABLE IF NOT EXISTS tareas_crm (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  mensaje_id uuid REFERENCES mensajes(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_tarea VARCHAR(100) NOT NULL, -- seguimiento, recordatorio, promocion, soporte, cierre_venta
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en_proceso, completada, cancelada, reprogramada
  prioridad VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  tiempo_estimado_minutos INTEGER,
  tiempo_real_minutos INTEGER,
  asignado_a uuid REFERENCES usuarios_perfil(id),
  asignado_por uuid REFERENCES usuarios_perfil(id),
  progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  resultado TEXT,
  proximo_seguimiento DATE,
  notas TEXT,
  etiquetas TEXT[],
  relacionada_con VARCHAR(100), -- cita, tratamiento, pago, etc.
  referencia_id uuid, -- ID del registro relacionado
  recordatorio_24h BOOLEAN DEFAULT false,
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para CRM
CREATE INDEX IF NOT EXISTS idx_campañas_empresa_id ON campañas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campañas_sede_id ON campañas(sede_id);
CREATE INDEX IF NOT EXISTS idx_campañas_fecha_inicio ON campañas(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_campañas_estado ON campañas(estado);
CREATE INDEX IF NOT EXISTS idx_campañas_responsable ON campañas(responsable_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_empresa_id ON mensajes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_sede_id ON mensajes(sede_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_paciente_id ON mensajes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_campaña_id ON mensajes(campaña_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_estado ON mensajes(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha_programada ON mensajes(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario_creador ON mensajes(usuario_creador);

CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_id ON tareas_crm(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_sede_id ON tareas_crm(sede_id);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_paciente_id ON tareas_crm(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_estado ON tareas_crm(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_asignado_a ON tareas_crm(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_vencimiento ON tareas_crm(fecha_vencimiento);;