-- =============================================
-- ERP MÉDICO - MEDICINA DEL TRABAJO
-- Migración 001: Tablas Base SaaS Multi-tenant
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLAS BASE SAAS MULTI-TENANT
-- =============================================

-- Tabla de planes de suscripción
CREATE TABLE planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_anual DECIMAL(10,2) NOT NULL DEFAULT 0,
    limite_usuarios INTEGER DEFAULT NULL, -- NULL = ilimitado
    limite_pacientes INTEGER DEFAULT NULL,
    limite_consultas_mes INTEGER DEFAULT NULL,
    limite_almacenamiento_gb INTEGER DEFAULT NULL,
    incluye_chatbot BOOLEAN DEFAULT false,
    incluye_ia_predictiva BOOLEAN DEFAULT false,
    incluye_integraciones BOOLEAN DEFAULT false,
    incluye_whitelabel BOOLEAN DEFAULT false,
    incluye_api_publica BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    caracteristicas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empresas (tenants)
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(13) UNIQUE,
    email VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    pais VARCHAR(100) DEFAULT 'México',
    logo_url TEXT,
    sitio_web VARCHAR(255),
    tipo_empresa VARCHAR(50) DEFAULT 'privada', -- privada, publica, ong
    sector_economico VARCHAR(100),
    numero_empleados INTEGER,
    configuracion JSONB DEFAULT '{}'::jsonb,
    plan_id UUID REFERENCES planes_suscripcion(id),
    activa BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sedes/sucursales
CREATE TABLE sedes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    email VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    coordinador_medico UUID, -- referencia a users
    es_sede_principal BOOLEAN DEFAULT false,
    activa BOOLEAN DEFAULT true,
    configuracion JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles del sistema
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB DEFAULT '[]'::jsonb,
    es_sistema BOOLEAN DEFAULT false, -- roles del sistema no se pueden eliminar
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios extendida (profiles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    telefono VARCHAR(20),
    avatar_url TEXT,
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    cedula_profesional VARCHAR(50),
    especialidad VARCHAR(100),
    numero_empleado VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    configuracion_personal JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignación de roles a usuarios
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    asignado_por UUID REFERENCES profiles(id),
    activo BOOLEAN DEFAULT true,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id, empresa_id)
);

-- Tabla de suscripciones
CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES planes_suscripcion(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'activa', -- activa, cancelada, suspendida, trial
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    precio_mensual DECIMAL(10,2),
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    renovacion_automatica BOOLEAN DEFAULT true,
    dias_trial INTEGER DEFAULT 0,
    metadatos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de límites de uso por empresa
CREATE TABLE limites_uso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    periodo_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    periodo_fin TIMESTAMP WITH TIME ZONE,
    usuarios_activos INTEGER DEFAULT 0,
    pacientes_registrados INTEGER DEFAULT 0,
    consultas_realizadas INTEGER DEFAULT 0,
    almacenamiento_usado_gb DECIMAL(10,2) DEFAULT 0,
    llamadas_api INTEGER DEFAULT 0,
    mensajes_chatbot INTEGER DEFAULT 0,
    reportes_generados INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX idx_empresas_plan ON empresas(plan_id);
CREATE INDEX idx_sedes_empresa ON sedes(empresa_id);
CREATE INDEX idx_profiles_empresa ON profiles(empresa_id);
CREATE INDEX idx_profiles_sede ON profiles(sede_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_empresa ON user_roles(empresa_id);
CREATE INDEX idx_suscripciones_empresa ON suscripciones(empresa_id);
CREATE INDEX idx_limites_uso_empresa ON limites_uso(empresa_id);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON sedes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planes_updated_at BEFORE UPDATE ON planes_suscripcion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_limites_uso_updated_at BEFORE UPDATE ON limites_uso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();