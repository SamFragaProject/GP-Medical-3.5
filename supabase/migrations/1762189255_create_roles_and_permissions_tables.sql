-- Migration: create_roles_and_permissions_tables
-- Created at: 1762189255

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  nivel_permisos INTEGER DEFAULT 1, -- 1=básico, 2=intermedio, 3=avanzado, 4=admin
  es_personalizado BOOLEAN DEFAULT false,
  es_activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, nombre)
);

-- Tabla de relación usuarios-roles
CREATE TABLE IF NOT EXISTS usuarios_roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES usuarios_perfil(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  asignado_por uuid REFERENCES usuarios_perfil(id),
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, role_id, empresa_id)
);

-- Tabla de permisos de menú/usuario
CREATE TABLE IF NOT EXISTS user_menu_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_name VARCHAR(100) NOT NULL, -- nombre del permiso
  table_name VARCHAR(100), -- tabla relacionada
  operation VARCHAR(20) NOT NULL, -- SELECT, INSERT, UPDATE, DELETE, ALL
  condition_expression TEXT, -- expresión SQL para condiciones adicionales
  menu_path VARCHAR(200), -- path del menú
  menu_label VARCHAR(100), -- etiqueta del menú
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_name, table_name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_empresa_id ON roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_activo ON roles(es_activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario_id ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role_id ON usuarios_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_empresa_id ON usuarios_roles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_activo ON usuarios_roles(activo);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_role_id ON user_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_permission_name ON user_menu_permissions(permission_name);;