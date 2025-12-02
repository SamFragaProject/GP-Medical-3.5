-- Migration: supabase_crm_audit_tables
-- Created at: 1762190376

-- =============================================================================
-- TABLAS CRM Y AUDITORÍA
-- =============================================================================

-- Tabla de campañas
CREATE TABLE IF NOT EXISTS campañas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  descripcion text,
  fecha_inicio timestamp with time zone,
  fecha_fin timestamp with time zone,
  tipo_campaña enum_tipo_campaña NOT NULL,
  presupuesto decimal(10,2),
  estado enum_estado_campaña DEFAULT 'activa',
  configuracion jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaña_id uuid REFERENCES campañas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  destinatario varchar(255) NOT NULL,
  contenido text NOT NULL,
  tipo_mensaje enum_tipo_mensaje NOT NULL,
  canal enum_canal_mensaje NOT NULL,
  fecha_envio timestamp with time zone DEFAULT now(),
  estado enum_estado_mensaje DEFAULT 'pendiente',
  fecha_entrega timestamp with time zone,
  respuesta_recibida boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de tareas CRM
CREATE TABLE IF NOT EXISTS tareas_crm (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  titulo varchar(255) NOT NULL,
  descripcion text,
  tipo_tarea enum_tipo_tarea NOT NULL,
  prioridad enum_prioridad_tarea DEFAULT 'media',
  estado enum_estado_tarea_crm DEFAULT 'pendiente',
  fecha_vencimiento timestamp with time zone,
  asignado_a uuid REFERENCES auth.users(id),
  creado_por uuid NOT NULL REFERENCES auth.users(id),
  fecha_completado timestamp with time zone,
  notas text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id),
  tabla_afectada varchar(100) NOT NULL,
  registro_id uuid,
  accion varchar(20) NOT NULL,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  ip_address inet,
  user_agent text,
  timestamp_evento timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  url_destino text NOT NULL,
  eventos jsonb NOT NULL DEFAULT '[]',
  secret_key varchar(255),
  activo boolean DEFAULT true,
  retry_count integer DEFAULT 3,
  timeout_segundos integer DEFAULT 30,
  configuracion jsonb DEFAULT '{}',
  fecha_ultimo_evento timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

SELECT 'Tablas CRM y auditoría aplicadas exitosamente' as status, now() as timestamp;;