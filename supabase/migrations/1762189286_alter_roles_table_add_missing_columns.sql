-- Migration: alter_roles_table_add_missing_columns
-- Created at: 1762189286

-- Agregar columnas faltantes a tabla roles
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS nivel_permisos INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS es_activo BOOLEAN DEFAULT true;

-- Cambiar nombre de permissions_json a configuracion si es necesario  
ALTER TABLE roles RENAME COLUMN permissions_json TO configuracion;

-- Tabla de relación usuarios-roles  
CREATE TABLE IF NOT EXISTS usuarios_roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES usuarios_perfil(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  asignado_por uuid REFERENCES usuarios_perfil(id),
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS user_menu_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_name VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  operation VARCHAR(20) NOT NULL,
  condition_expression TEXT,
  menu_path VARCHAR(200),
  menu_label VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_roles_empresa_id ON roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_activo ON roles(es_activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario_id ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role_id ON usuarios_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_empresa_id ON usuarios_roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_activo ON usuarios_roles(activo);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_role_id ON user_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_permission_name ON user_menu_permissions(permission_name);;