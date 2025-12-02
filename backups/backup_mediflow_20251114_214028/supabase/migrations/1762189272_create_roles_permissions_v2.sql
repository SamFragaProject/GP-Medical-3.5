-- Migration: create_roles_permissions_v2
-- Created at: 1762189272

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  nivel_permisos INTEGER DEFAULT 1,
  es_personalizado BOOLEAN DEFAULT false,
  es_activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Agregar constraints únicos después de crear las tablas
DO $$
BEGIN
  -- Constraint único para roles por empresa
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_empresa_nombre_key') THEN
    ALTER TABLE roles ADD CONSTRAINT roles_empresa_nombre_key UNIQUE (empresa_id, nombre);
  END IF;
  
  -- Constraint único para usuarios_roles
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_roles_usuario_role_empresa_key') THEN
    ALTER TABLE usuarios_roles ADD CONSTRAINT usuarios_roles_usuario_role_empresa_key 
    UNIQUE (usuario_id, role_id, empresa_id);
  END IF;
  
  -- Constraint único para permisos
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_menu_permissions_role_permission_table_key') THEN
    ALTER TABLE user_menu_permissions ADD CONSTRAINT user_menu_permissions_role_permission_table_key 
    UNIQUE (role_id, permission_name, table_name);
  END IF;
END $$;;