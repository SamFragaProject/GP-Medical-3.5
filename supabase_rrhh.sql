-- ============================================
-- MÓDULO RRHH - EXTENSIÓN DE ESQUEMA
-- ============================================

-- 1. DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  responsable_id UUID REFERENCES usuarios(id), -- Jefe del departamento
  departamento_padre_id UUID REFERENCES departamentos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PUESTOS
CREATE TABLE IF NOT EXISTS puestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  nivel_jerarquico INT DEFAULT 1,
  salario_base_min DECIMAL(12,2),
  salario_base_max DECIMAL(12,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DETALLES DE EMPLEADO (Extensión de Usuarios)
-- Se usa para guardar datos sensibles o específicos de RRHH que no están en la tabla base de usuarios
CREATE TABLE IF NOT EXISTS empleados_detalles (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Relaciones Organizacionales
  departamento_id UUID REFERENCES departamentos(id),
  puesto_id UUID REFERENCES puestos(id),
  jefe_directo_id UUID REFERENCES usuarios(id),
  
  -- Datos Contractuales
  numero_empleado VARCHAR(50),
  fecha_ingreso DATE,
  tipo_contrato VARCHAR(50), -- indefinido, temporal, honorarios
  salario_mensual DECIMAL(12,2),
  
  -- Gestión de Tiempo
  dias_vacaciones_disponibles INT DEFAULT 0,
  dias_vacaciones_usados INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VACACIONES
CREATE TABLE IF NOT EXISTS rrhh_vacaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_solicitados INT NOT NULL,
  motivo TEXT,
  
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada
  aprobado_por_id UUID REFERENCES usuarios(id),
  fecha_aprobacion TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INCIDENCIAS (Bajas, retardos, incapacidades)
CREATE TABLE IF NOT EXISTS rrhh_incidencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL, -- incapacidad, retardo, falta, permiso
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  dias_afectados INT DEFAULT 1,
  
  motivo TEXT,
  comprobante_url TEXT,
  
  estado VARCHAR(20) DEFAULT 'pendiente',
  registrado_por_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASISTENCIA (Checador)
CREATE TABLE IF NOT EXISTS rrhh_asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME,
  hora_salida TIME,
  
  tipo VARCHAR(20) DEFAULT 'presencial', -- presencial, home_office
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  dispositivo_info TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticias básicas de seguridad (RLS) - Deshabilitadas por defecto para facilitar inicio
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE puestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_vacaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_asistencia ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas para desarrollo (Permiten todo a usuarios autenticados)
CREATE POLICY "Acceso total departamentos" ON departamentos FOR ALL USING (true);
CREATE POLICY "Acceso total puestos" ON puestos FOR ALL USING (true);
CREATE POLICY "Acceso total empleados_detalles" ON empleados_detalles FOR ALL USING (true);
CREATE POLICY "Acceso total rrhh_vacaciones" ON rrhh_vacaciones FOR ALL USING (true);
CREATE POLICY "Acceso total rrhh_incidencias" ON rrhh_incidencias FOR ALL USING (true);
CREATE POLICY "Acceso total rrhh_asistencia" ON rrhh_asistencia FOR ALL USING (true);
