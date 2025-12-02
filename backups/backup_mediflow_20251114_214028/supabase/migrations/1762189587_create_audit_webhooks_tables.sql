-- Migration: create_audit_webhooks_tables
-- Created at: 1762189587

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  usuario_id uuid REFERENCES usuarios_perfil(id),
  accion VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, LOGIN_FAILED
  tabla_afectada VARCHAR(100),
  registro_id uuid,
  registro_anterior JSONB, -- datos antes del cambio
  registro_nuevo JSONB, -- datos después del cambio
  campos_modificados TEXT[], -- array de campos que cambiaron
  ip_address INET,
  user_agent TEXT,
  sesion_id VARCHAR(255),
  motivo_cambio TEXT,
  aplicacion VARCHAR(100), -- web, mobile, api, system
  modulo VARCHAR(100), -- citas, pacientes, inventario, etc.
  gravedad VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
  timestamp_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_destino TEXT NOT NULL,
  metodo_http VARCHAR(10) DEFAULT 'POST', -- GET, POST, PUT, PATCH, DELETE
  eventos TEXT[] NOT NULL, -- array de eventos que disparan el webhook
  -- eventos posibles: cita_creada, cita_actualizada, paciente_registrado, venta_completada, etc.
  tabla_evento VARCHAR(100), -- tabla que dispara el evento
  condiciones_filtro JSONB, -- condiciones para filtrar cuándo disparar
  headers_adicionales JSONB DEFAULT '{}', -- headers HTTP personalizados
  autenticacion_tipo VARCHAR(50), -- none, bearer, basic, signature
  autenticacion_config JSONB DEFAULT '{}', -- configuración de autenticación
  secret_firma VARCHAR(255), -- secreto para firmar requests
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, pausado, error
  intentos_maximos INTEGER DEFAULT 3,
  timeout_segundos INTEGER DEFAULT 30,
  ultimo_envio TIMESTAMP WITH TIME ZONE,
  proximo_reintento TIMESTAMP WITH TIME ZONE,
  total_envios INTEGER DEFAULT 0,
  envios_exitosos INTEGER DEFAULT 0,
  envios_fallidos INTEGER DEFAULT 0,
  ultimo_error TEXT,
  created_by uuid REFERENCES usuarios_perfil(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  evento_disparador VARCHAR(100) NOT NULL,
  datos_envio JSONB, -- datos que se enviaron
  respuesta_servidor JSONB, -- respuesta del servidor de destino
  status_code INTEGER,
  tiempo_respuesta_ms INTEGER,
  exitoso BOOLEAN,
  error_mensaje TEXT,
  reintento_numero INTEGER DEFAULT 0,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoría y webhooks
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_id ON auditoria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_sede_id ON auditoria(sede_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro_id ON auditoria(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria(timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_gravedad ON auditoria(gravedad);

CREATE INDEX IF NOT EXISTS idx_webhooks_empresa_id ON webhooks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_sede_id ON webhooks(sede_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_estado ON webhooks(estado);
CREATE INDEX IF NOT EXISTS idx_webhooks_eventos ON webhooks USING GIN(eventos);
CREATE INDEX IF NOT EXISTS idx_webhooks_tabla_evento ON webhooks(tabla_evento);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_evento ON webhook_logs(evento_disparador);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_fecha ON webhook_logs(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_exitoso ON webhook_logs(exitoso);;