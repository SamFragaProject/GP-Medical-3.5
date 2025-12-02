-- Migration: create_main_tenant_tables_fixed
-- Created at: 1762189227

-- Tabla de empresas (multi-tenant root)
CREATE TABLE IF NOT EXISTS empresas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  razon_social VARCHAR(255),
  nit VARCHAR(50) UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  activa BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sedes (pertenecen a empresa)
CREATE TABLE IF NOT EXISTS sedes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  activa BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de usuario (multi-tenant)
CREATE TABLE IF NOT EXISTS usuarios_perfil (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  user_id uuid NOT NULL UNIQUE, -- Referencia a auth.users
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  telefono VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  fecha_nacimiento DATE,
  genero VARCHAR(10),
  rol VARCHAR(50) DEFAULT 'usuario',
  especialidad VARCHAR(100),
  numero_colegiatura VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  avatar_url TEXT,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_empresas_activa ON empresas(activa);
CREATE INDEX IF NOT EXISTS idx_sedes_empresa_id ON sedes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_empresa_id ON usuarios_perfil(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_sede_id ON usuarios_perfil(sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_user_id ON usuarios_perfil(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_activo ON usuarios_perfil(activo);;