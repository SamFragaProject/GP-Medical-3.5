-- ============================================
-- SETUP MAESTRO GPMEDICAL v2 - CORREGIDO
-- ============================================

-- 1. LIMPIEZA (Cuidado: Borra datos existentes)
DROP TABLE IF EXISTS rrhh_asistencia CASCADE;
DROP TABLE IF EXISTS rrhh_incidencias CASCADE;
DROP TABLE IF EXISTS rrhh_vacaciones CASCADE;
DROP TABLE IF EXISTS empleados_detalles CASCADE;
DROP TABLE IF EXISTS puestos CASCADE;
DROP TABLE IF EXISTS departamentos CASCADE;
DROP TABLE IF EXISTS examenes CASCADE;
DROP TABLE IF EXISTS tipos_examen CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS empresas_cliente CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sedes CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLAS CORE
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'basico',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  apellido_paterno VARCHAR(100),
  rol VARCHAR(50) DEFAULT 'paciente',
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLAS RRHH
CREATE TABLE public.departamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.puestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(100) NOT NULL,
  departamento_id UUID REFERENCES departamentos(id),
  salario_min DECIMAL(12,2),
  salario_max DECIMAL(12,2),
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.empleados_detalles (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id),
  puesto_id UUID REFERENCES puestos(id),
  departamento_id UUID REFERENCES departamentos(id),
  fecha_contratacion DATE DEFAULT CURRENT_DATE,
  salario DECIMAL(12,2),
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rrhh_vacaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  tipo VARCHAR(50) DEFAULT 'vacaciones',
  estado VARCHAR(50) DEFAULT 'pendiente',
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rrhh_asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  fecha DATE DEFAULT CURRENT_DATE,
  hora_entrada TIME,
  hora_salida TIME,
  estado VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SEGURIDAD (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
-- (Habilitar para las demás tablas según necesidad)

-- POLÍTICAS PERMISIVAS (Modo Desarrollo/Setup)
-- Permitir que CUALQUIER usuario autenticado lea/escriba (simplificación para que no falle el setup)
CREATE POLICY "Acceso total a autenticados" ON usuarios
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Insertar propio usuario" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Publico Empresas Ver" ON empresas FOR SELECT USING (true);
CREATE POLICY "Publico Deptos Ver" ON departamentos FOR SELECT USING (true);
CREATE POLICY "Publico Puestos Ver" ON puestos FOR SELECT USING (true);

-- 6. DATOS INICIALES
INSERT INTO empresas (id, nombre, plan) VALUES 
('00000000-0000-0000-0000-000000000001', 'GPMedical Demo Corp', 'enterprise');

INSERT INTO departamentos (nombre, empresa_id) VALUES 
('Recursos Humanos', '00000000-0000-0000-0000-000000000001'),
('Medicina', '00000000-0000-0000-0000-000000000001'),
('Tecnología', '00000000-0000-0000-0000-000000000001');

