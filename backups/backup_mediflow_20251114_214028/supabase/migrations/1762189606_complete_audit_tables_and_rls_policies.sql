-- Migration: complete_audit_tables_and_rls_policies
-- Created at: 1762189606

-- Tabla de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_destino TEXT NOT NULL,
  metodo_http VARCHAR(10) DEFAULT 'POST',
  eventos TEXT[] NOT NULL,
  tabla_evento VARCHAR(100),
  condiciones_filtro JSONB,
  headers_adicionales JSONB DEFAULT '{}',
  autenticacion_tipo VARCHAR(50),
  autenticacion_config JSONB DEFAULT '{}',
  secret_firma VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'activo',
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

-- ACTIVAR RLS EN TODAS LAS TABLAS SENSIBLES
ALTER TABLE usuarios_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuentros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS GENERALES (SELECT - Solo empresa/sede del usuario)
CREATE POLICY "usuarios_perfil_select_policy" ON usuarios_perfil
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );

CREATE POLICY "pacientes_select_policy" ON pacientes
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );

CREATE POLICY "documentos_select_policy" ON documentos
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );

CREATE POLICY "citas_select_policy" ON citas
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );

CREATE POLICY "encuentros_select_policy" ON encuentros
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );

CREATE POLICY "productos_select_policy" ON productos
  FOR SELECT USING (
    is_admin() OR 
    empresa_id = current_empresa_id()
  );;