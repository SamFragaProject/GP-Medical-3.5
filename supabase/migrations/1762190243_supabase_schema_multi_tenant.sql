-- Migration: supabase_schema_multi_tenant
-- Created at: 1762190243

-- =============================================================================
-- MIGRACIÓN COMPLETA SUPABASE MULTI-TENANT
-- Fecha: 2024-11-04
-- Descripción: Esquema completo multi-tenant para sistema médico
-- =============================================================================

-- =============================================================================
-- A. EXTENSIONES IDEMPOTENTES
-- =============================================================================

-- Habilitar extensiones requeridas (idempotentes)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar UUID como PK por defecto
-- Esto se manejará a nivel de tabla individual

-- =============================================================================
-- B. FUNCIONES UTILITARIAS
-- =============================================================================

-- Función para obtener ID del usuario actual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Función para obtener JWT claims actuales
CREATE OR REPLACE FUNCTION jwt_claims()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::json;
$$;

-- Función para obtener empresa_id actual
CREATE OR REPLACE FUNCTION current_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (jwt_claims() ->> 'empresa_id')::uuid;
$$;

-- Función para obtener sede_id actual
CREATE OR REPLACE FUNCTION current_sede_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (jwt_claims() ->> 'sede_id')::uuid;
$$;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin(empresa_id_param uuid, sede_id_param uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios_perfil up
    JOIN usuarios_roles ur ON up.id = ur.usuario_id
    JOIN roles r ON ur.role_id = r.id
    WHERE up.user_id = current_user_id()
    AND up.empresa_id = empresa_id_param
    AND (sede_id_param IS NULL OR up.sede_id = sede_id_param)
    AND r.nombre = 'admin'
  );
$$;

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(
  resource_param text,
  action_param text,
  empresa_param uuid,
  sede_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios_perfil up
    JOIN usuarios_roles ur ON up.id = ur.usuario_id
    JOIN roles r ON ur.role_id = r.id
    JOIN user_menu_permissions ump ON r.id = ump.role_id
    WHERE up.user_id = current_user_id()
    AND up.empresa_id = empresa_param
    AND (sede_param IS NULL OR up.sede_id = sede_param)
    AND ump.resource = resource_param
    AND ump.action = action_param
    AND ump.allowed = true
  );
$$;

-- =============================================================================
-- C. TABLAS MULTI-TENANT
-- =============================================================================

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

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  codigo varchar(100),
  descripcion text,
  categoria varchar(100),
  tipo enum_tipo_producto NOT NULL,
  unidad_medida varchar(50) NOT NULL,
  precio_compra decimal(10,2) DEFAULT 0,
  precio_venta decimal(10,2) DEFAULT 0,
  stock_minimo integer DEFAULT 0,
  stock_maximo integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

-- Tabla de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  numero_lote varchar(100) NOT NULL,
  fecha_vencimiento date,
  fecha_ingreso timestamp with time zone DEFAULT now(),
  stock_actual integer DEFAULT 0,
  precio_compra decimal(10,2),
  proveedor varchar(255),
  estado enum_estado_lote DEFAULT 'disponible',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(producto_id, numero_lote)
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  lote_id uuid REFERENCES lotes(id),
  tipo_movimiento enum_tipo_movimiento NOT NULL,
  cantidad integer NOT NULL,
  precio_unitario decimal(10,2),
  motivo text,
  referencia_tipo varchar(50),
  referencia_id uuid,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  fecha_movimiento timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de órdenes de cobro
CREATE TABLE IF NOT EXISTS ordenes_cobro (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  numero_orden varchar(50) NOT NULL,
  fecha_orden timestamp with time zone DEFAULT now(),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  descuento decimal(10,2) DEFAULT 0,
  impuestos decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  estado enum_estado_orden_cobro DEFAULT 'pendiente',
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, numero_orden)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  monto decimal(10,2) NOT NULL,
  metodo_pago enum_metodo_pago NOT NULL,
  fecha_pago timestamp with time zone DEFAULT now(),
  numero_transaccion varchar(100),
  referencia_bancaria varchar(255),
  banco varchar(100),
  observaciones text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  numero_factura varchar(50) NOT NULL,
  fecha_factura timestamp with time zone DEFAULT now(),
  nit_cliente varchar(20),
  razon_social_cliente varchar(255),
  direccion_cliente text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  descuento decimal(10,2) DEFAULT 0,
  impuestos decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  estado enum_estado_factura DEFAULT 'emitida',
  archivo_pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(orden_cobro_id, numero_factura)
);

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

-- =============================================================================
-- D. ÍNDICES RECOMENDADOS
-- =============================================================================

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellidos ON pacientes(nombre, apellidos);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_sede ON pacientes(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(numero_documento);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_user_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_empresa_sede_fecha ON citas(empresa_id, sede_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- Índices para órdenes de cobro
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_sede_estado ON ordenes_cobro(empresa_id, sede_id, estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_paciente ON ordenes_cobro(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha ON ordenes_cobro(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_numero ON ordenes_cobro(numero_orden);

-- Índices para inventario
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_sede ON movimientos_inventario(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_vencimiento ON lotes(producto_id, fecha_vencimiento);

-- Índices para usuarios_perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_sede ON usuarios_perfil(empresa_id, sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON auditoria(empresa_id, timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_user_fecha ON auditoria(user_id, timestamp_evento);

-- Índices para CRM
CREATE INDEX IF NOT EXISTS idx_tareas_crm_empresa_estado ON tareas_crm(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_asignado ON tareas_crm(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_vencimiento ON tareas_crm(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_crm_paciente ON tareas_crm(paciente_id);

-- =============================================================================
-- E. TRIGGERS
-- =============================================================================

-- Trigger para establecer valores por defecto del tenant
CREATE OR REPLACE FUNCTION set_default_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si la tabla tiene empresa_id y sede_id, aplicar valores del contexto
  IF TG_TABLE_NAME IN ('pacientes', 'ordenes_cobro', 'productos', 'campañas', 'tareas_crm') THEN
    IF NEW.empresa_id IS NULL THEN
      NEW.empresa_id := current_empresa_id();
    END IF;
  END IF;
  
  IF TG_TABLE_NAME IN ('pacientes', 'ordenes_cobro', 'movimientos_inventario', 'tareas_crm') THEN
    IF NEW.sede_id IS NULL THEN
      NEW.sede_id := current_sede_id();
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger a las tablas correspondientes
CREATE TRIGGER trigger_set_default_tenant_pacientes
  BEFORE INSERT OR UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER trigger_set_default_tenant_ordenes_cobro
  BEFORE INSERT OR UPDATE ON ordenes_cobro
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER trigger_set_default_tenant_productos
  BEFORE INSERT OR UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER trigger_set_default_tenant_movimientos_inventario
  BEFORE INSERT OR UPDATE ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER trigger_set_default_tenant_campañas
  BEFORE INSERT OR UPDATE ON campañas
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

CREATE TRIGGER trigger_set_default_tenant_tareas_crm
  BEFORE INSERT OR UPDATE ON tareas_crm
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

-- Trigger para actualizar inventario después de movimiento
CREATE OR REPLACE FUNCTION inventario_after_mov()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar stock en lote después de movimiento
  IF TG_OP = 'INSERT' AND NEW.lote_id IS NOT NULL THEN
    UPDATE lotes 
    SET stock_actual = stock_actual + CASE 
      WHEN NEW.tipo_movimiento = 'entrada' THEN NEW.cantidad
      WHEN NEW.tipo_movimiento = 'salida' THEN -NEW.cantidad
      ELSE 0
    END
    WHERE id = NEW.lote_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_inventario_after_mov
  AFTER INSERT ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION inventario_after_mov();

-- Trigger para notificar resultados
CREATE OR REPLACE FUNCTION resultado_notifica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si el resultado cambia a 'completado', actualizar la orden de estudio
  IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
    UPDATE ordenes_estudio 
    SET estado = 'completado', 
        resultados = NEW.resultado_completo
    WHERE id = NEW.orden_estudio_id;
    
    -- Aquí se podría agregar lógica para enviar notificaciones
    -- Por ejemplo, insertar en una cola de notificaciones o llamar a un webhook
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_resultado_notifica
  AFTER UPDATE ON resultados_estudio
  FOR EACH ROW EXECUTE FUNCTION resultado_notifica();

-- Trigger para generar factura al guardar orden de cobro
CREATE OR REPLACE FUNCTION orden_factura_guardar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  numero_factura_var varchar(50);
  items_json jsonb;
  contador_facturas integer;
BEGIN
  -- Solo ejecutar si el estado cambia a 'pagada'
  IF NEW.estado = 'pagada' AND (OLD.estado IS NULL OR OLD.estado != 'pagada') THEN
    -- Obtener siguiente número de factura
    SELECT COALESCE(MAX(CAST(numero_factura AS integer)), 0) + 1
    INTO contador_facturas
    FROM facturas 
    WHERE orden_cobro_id = NEW.id;
    
    numero_factura_var := LPAD(contador_facturas::text, 8, '0');
    
    -- Crear factura automáticamente
    INSERT INTO facturas (
      orden_cobro_id,
      numero_factura,
      fecha_factura,
      subtotal,
      descuento,
      impuestos,
      total
    ) VALUES (
      NEW.id,
      numero_factura_var,
      now(),
      NEW.subtotal,
      NEW.descuento,
      NEW.impuestos,
      NEW.total
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_orden_factura_guardar
  AFTER UPDATE ON ordenes_cobro
  FOR EACH ROW EXECUTE FUNCTION orden_factura_guardar();

-- =============================================================================
-- ENUMS DEFINITIONS
-- =============================================================================

-- Crear enums necesarios (idempotentes)
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

-- =============================================================================
-- FINAL
-- =============================================================================

-- Comentarios finales
COMMENT ON FUNCTION current_user_id() IS 'Obtiene el ID del usuario actual autenticado';
COMMENT ON FUNCTION jwt_claims() IS 'Obtiene los claims del JWT actual';
COMMENT ON FUNCTION current_empresa_id() IS 'Obtiene el ID de la empresa del contexto actual';
COMMENT ON FUNCTION current_sede_id() IS 'Obtiene el ID de la sede del contexto actual';
COMMENT ON FUNCTION is_admin(uuid, uuid) IS 'Verifica si el usuario es admin de la empresa/sede especificada';
COMMENT ON FUNCTION has_permission(text, text, uuid, uuid) IS 'Verifica si el usuario tiene permiso para realizar una acción';

-- Migración completada exitosamente
SELECT 'Migración multi-tenant aplicada exitosamente' as status, now() as timestamp;;