-- =============================================
-- SCRIPT DE INICIALIZACIÓN DE ESQUEMA (CONSOLIDADO)
-- =============================================
-- Ejecute este script PRIMERO para crear todas las tablas necesarias.
-- Este script combina la infraestructura base con las tablas operativas (Pacientes, Citas, Examenes).

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNCIONES DE UTILIDAD
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLAS BASE DEL SISTEMA (Multi-Tenant)

-- Planes
CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(13),
    plan_id UUID REFERENCES planes_suscripcion(id),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sedes
CREATE TABLE IF NOT EXISTS sedes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERTAR ROLES POR DEFECTO
INSERT INTO roles (nombre, descripcion, es_sistema, activo) VALUES
    ('super_admin', 'Control total', true, true),
    ('admin_empresa', 'Administrador de empresa', true, true),
    ('medico', 'Médico', true, true),
    ('enfermera', 'Enfermera', true, true),
    ('recepcion', 'Recepción', true, true),
    ('paciente', 'Paciente', true, true)
ON CONFLICT (nombre) DO NOTHING;

-- Perfiles de Usuario (Vinculado a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Coincide con auth.users.id
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    avatar_url TEXT,
    rol_principal VARCHAR(50), -- Cache del rol para acceso rápido
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asignación de Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id, empresa_id)
);

-- 4. TABLAS OPERATIVAS (Médicas)

-- Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    documento VARCHAR(50),
    tipo_sangre VARCHAR(10),
    alergias TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    foto_url TEXT,
    estatus VARCHAR(50) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Citas
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES profiles(id),
    sede_id UUID REFERENCES sedes(id),
    tipo VARCHAR(100) NOT NULL, -- consulta, examen, etc.
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    motivo TEXT,
    estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, completada, cancelada
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Examenes (Simplificado para compatibilidad)
CREATE TABLE IF NOT EXISTS examenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    dictamen VARCHAR(50), -- apto, no_apto
    estado VARCHAR(50) DEFAULT 'pendiente',
    resultados JSONB DEFAULT '{}'::jsonb,
    observaciones TEXT,
    restricciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SISTEMA DE PERMISOS (RBAC)

-- Módulos
CREATE TABLE IF NOT EXISTS modulos_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO modulos_sistema (codigo, nombre) VALUES 
    ('dashboard', 'Dashboard'),
    ('pacientes', 'Pacientes'),
    ('citas', 'Citas'),
    ('examenes', 'Exámenes'),
    ('roles', 'Gestión de Roles')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos por Rol y Módulo
CREATE TABLE IF NOT EXISTS rol_modulo_permisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
    puede_ver BOOLEAN DEFAULT false,
    puede_crear BOOLEAN DEFAULT false,
    puede_editar BOOLEAN DEFAULT false,
    puede_borrar BOOLEAN DEFAULT false,
    puede_exportar BOOLEAN DEFAULT false,
    puede_aprobar BOOLEAN DEFAULT false,
    puede_firmar BOOLEAN DEFAULT false,
    puede_imprimir BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rol_id, modulo_id)
);

-- 6. TRIGGERS DE ACTUALIZACIÓN
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_modtime BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_modtime BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_examenes_modtime BEFORE UPDATE ON examenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Esquema inicializado correctamente. Ahora ejecute rbac_rls.sql' as status;
