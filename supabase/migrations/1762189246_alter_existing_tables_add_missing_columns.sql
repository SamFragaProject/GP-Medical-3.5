-- Migration: alter_existing_tables_add_missing_columns
-- Created at: 1762189246

-- Agregar columnas faltantes a tabla empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS razon_social VARCHAR(255),
ADD COLUMN IF NOT EXISTS nit VARCHAR(50),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- Cambiar nombre de config_json a configuracion si es necesario
ALTER TABLE empresas RENAME COLUMN config_json TO configuracion;

-- Agregar columnas faltantes a tabla sedes
ALTER TABLE sedes 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS configuracion JSONB DEFAULT '{}';

-- Crear tabla usuarios_perfil si no existe
CREATE TABLE IF NOT EXISTS usuarios_perfil (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
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
);;