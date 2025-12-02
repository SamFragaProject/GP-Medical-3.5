-- Migration: supabase_enums_tables
-- Created at: 1762190328

-- =============================================================================
-- ENUMS Y TABLAS PRINCIPALES
-- =============================================================================

-- Enums necesarios (idempotentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_usuario') THEN
    CREATE TYPE enum_estado_usuario AS ENUM ('activo', 'inactivo', 'suspendido', 'vacaciones');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_genero') THEN
    CREATE TYPE enum_genero AS ENUM ('masculino', 'femenino', 'otro', 'no_especifica');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_paciente') THEN
    CREATE TYPE enum_estado_paciente AS ENUM ('activo', 'inactivo', 'fallecido', 'trasladado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_cita') THEN
    CREATE TYPE enum_estado_cita AS ENUM ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_encuentro') THEN
    CREATE TYPE enum_estado_encuentro AS ENUM ('en_curso', 'completado', 'cancelado', 'transferido');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_receta') THEN
    CREATE TYPE enum_estado_receta AS ENUM ('activa', 'vencida', 'cancelada', 'agotada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_orden_estudio') THEN
    CREATE TYPE enum_estado_orden_estudio AS ENUM ('pendiente', 'en_proceso', 'completada', 'cancelada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_resultado_estudio') THEN
    CREATE TYPE enum_estado_resultado_estudio AS ENUM ('pendiente', 'en_proceso', 'completado', 'revisado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_producto') THEN
    CREATE TYPE enum_tipo_producto AS ENUM ('medicamento', 'insumo_medico', 'equipo', 'suministro', 'otro');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_lote') THEN
    CREATE TYPE enum_estado_lote AS ENUM ('disponible', 'agotado', 'vencido', 'retirado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_movimiento') THEN
    CREATE TYPE enum_tipo_movimiento AS ENUM ('entrada', 'salida', 'ajuste', 'transferencia', 'devolucion');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_orden_cobro') THEN
    CREATE TYPE enum_estado_orden_cobro AS ENUM ('pendiente', 'parcial', 'pagada', 'vencida', 'cancelada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_metodo_pago') THEN
    CREATE TYPE enum_metodo_pago AS ENUM ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque', 'otro');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_factura') THEN
    CREATE TYPE enum_estado_factura AS ENUM ('emitida', 'enviada', 'pagada', 'vencida', 'anulada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_campaña') THEN
    CREATE TYPE enum_tipo_campaña AS ENUM ('promocion', 'bienestar', 'prevencion', 'recordatorio', 'educativa');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_campaña') THEN
    CREATE TYPE enum_estado_campaña AS ENUM ('activa', 'pausada', 'completada', 'cancelada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_mensaje') THEN
    CREATE TYPE enum_tipo_mensaje AS ENUM ('recordatorio_cita', 'resultado_estudio', 'promocion', 'educativo', 'alerta');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_canal_mensaje') THEN
    CREATE TYPE enum_canal_mensaje AS ENUM ('email', 'sms', 'whatsapp', 'push', 'telefono');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_mensaje') THEN
    CREATE TYPE enum_estado_mensaje AS ENUM ('pendiente', 'enviado', 'entregado', 'leido', 'fallido');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_tarea') THEN
    CREATE TYPE enum_tipo_tarea AS ENUM ('seguimiento', 'llamada', 'cita_programada', 'tarea_interna', 'recordatorio');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_prioridad_tarea') THEN
    CREATE TYPE enum_prioridad_tarea AS ENUM ('baja', 'media', 'alta', 'urgente');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_estado_tarea_crm') THEN
    CREATE TYPE enum_estado_tarea_crm AS ENUM ('pendiente', 'en_proceso', 'completada', 'cancelada');
  END IF;
END
$$;

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre varchar(255) NOT NULL,
  ruc varchar(20) UNIQUE,
  direccion text,
  telefono varchar(20),
  email varchar(255),
  logo_url text,
  configuracion jsonb DEFAULT '{}',
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de sedes
CREATE TABLE IF NOT EXISTS sedes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  direccion text,
  telefono varchar(20),
  responsable_nombre varchar(255),
  configuracion jsonb DEFAULT '{}',
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS usuarios_perfil (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  numero_empleado varchar(50),
  especialidad_id uuid,
  nombre varchar(255) NOT NULL,
  apellidos varchar(255) NOT NULL,
  telefono varchar(20),
  estado enum_estado_usuario DEFAULT 'activo',
  configuracion jsonb DEFAULT '{}',
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, empresa_id, sede_id)
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(100) NOT NULL,
  descripcion text,
  permisos_base jsonb DEFAULT '[]',
  jerarquia integer DEFAULT 1,
  configuracion jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, nombre)
);

-- Tabla de relación usuarios-roles
CREATE TABLE IF NOT EXISTS usuarios_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid NOT NULL REFERENCES usuarios_perfil(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES usuarios_perfil(id),
  fecha_concesion timestamp with time zone DEFAULT now(),
  fecha_vencimiento timestamp with time zone,
  activo boolean DEFAULT true,
  UNIQUE(usuario_id, role_id)
);

-- Tabla de permisos de menú por usuario
CREATE TABLE IF NOT EXISTS user_menu_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource varchar(100) NOT NULL,
  action varchar(50) NOT NULL,
  allowed boolean DEFAULT true,
  condicion jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

SELECT 'Enums y tablas principales aplicadas exitosamente' as status, now() as timestamp;;