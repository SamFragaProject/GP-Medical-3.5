-- =====================================================
-- MIGRACIÓN: Sistema de Episodios Médicos (Pipeline)
-- GPMedical ERP Pro - Flujo de Atención
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. CATÁLOGOS DE ESTADO Y TIPO
-- =====================================================

CREATE TABLE IF NOT EXISTS episodio_tipos (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    sla_default_minutos INTEGER DEFAULT 60,
    activo BOOLEAN DEFAULT true
);

INSERT INTO episodio_tipos (codigo, nombre, descripcion, icono, sla_default_minutos) VALUES
('INGRESO', 'Examen de Ingreso', 'Evaluación médica para pre-empleo', 'UserPlus', 120),
('PERIODICO', 'Examen Periódico', 'Evaluación anual o programada', 'CalendarRange', 90),
('CONSULTA', 'Consulta General', 'Atención médica general o urgencia menor', 'Stethoscope', 45),
('ACCIDENTE', 'Accidente Trabajo', 'Atención inicial de accidente laboral', 'Ambulance', 60),
('RETIRO', 'Examen de Retiro', 'Evaluación de egreso', 'LogOut', 90),
('NOM035', 'Evaluación Psicosocial', 'Aplicación de cuestionarios NOM-035', 'Brain', 45)
ON CONFLICT (codigo) DO UPDATE SET activo = true;

CREATE TABLE IF NOT EXISTS episodio_estados (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    fase VARCHAR(20) NOT NULL, -- 'recepcion', 'enfermeria', 'medico', 'cierre'
    color VARCHAR(20) DEFAULT 'gray',
    descripcion TEXT
);

INSERT INTO episodio_estados (codigo, nombre, orden, fase, color, descripcion) VALUES
('REGISTRADO', 'Registrado', 1, 'recepcion', 'blue', 'Paciente registrado en recepción'),
('EN_ESPERA_ENF', 'Espera Enfermería', 2, 'enfermeria', 'orange', 'Esperando toma de signos vitales'),
('EN_ATENCION_ENF', 'Atención Enfermería', 3, 'enfermeria', 'indigo', 'Siendo atendido por enfermería'),
('EN_ESPERA_MED', 'Espera Médico', 4, 'medico', 'orange', 'Esperando consulta médica'),
('EN_ATENCION_MED', 'Atención Médico', 5, 'medico', 'purple', 'En consulta con el médico'),
('EN_ESPERA_EST', 'Espera Estudios', 6, 'medico', 'yellow', 'Realizándose estudios complementarios'),
('DICTAMINACION', 'Dictaminación', 7, 'medico', 'cyan', 'Médico generando dictamen'),
('CERRADO', 'Cerrado', 8, 'cierre', 'green', 'Episodio concluido exitosamente'),
('CANCELADO', 'Cancelado', 9, 'cierre', 'red', 'Episodio cancelado')
ON CONFLICT (codigo) DO UPDATE SET fase = EXCLUDED.fase;

-- =====================================================
-- 2. TABLA PRINCIPAL: EPISODIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS episodios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(50) UNIQUE NOT NULL,
    
    -- Relaciones
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE SET NULL,
    
    -- Configuración
    tipo_episodio VARCHAR(20) REFERENCES episodio_tipos(codigo),
    motivo_visita TEXT,
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgencia')),
    
    -- Estado Actual
    estado VARCHAR(20) NOT NULL REFERENCES episodio_estados(codigo) DEFAULT 'REGISTRADO',
    fase_actual VARCHAR(20) DEFAULT 'recepcion',
    
    -- Asignaciones
    medico_asignado_id UUID REFERENCES profiles(id),
    enfermera_asignada_id UUID REFERENCES profiles(id),
    
    -- Tiempos (SLA)
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    fecha_inicio_atencion TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ,
    tiempo_transcurrido_min INTEGER DEFAULT 0,
    tiempo_sla_limite_min INTEGER,
    sla_cumplido BOOLEAN,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_episodios_empresa ON episodios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_episodios_paciente ON episodios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_episodios_estado ON episodios(estado);
CREATE INDEX IF NOT EXISTS idx_episodios_fase ON episodios(fase_actual);
CREATE INDEX IF NOT EXISTS idx_episodios_fecha ON episodios(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_episodios_medico ON episodios(medico_asignado_id);

-- =====================================================
-- 3. COLA DE TRABAJO (WAITLIST)
-- =====================================================

CREATE TABLE IF NOT EXISTS cola_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episodio_id UUID NOT NULL REFERENCES episodios(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Rol requerido para atender
    rol_requerido VARCHAR(20) NOT NULL, -- 'medico', 'enfermera', 'recepcion', 'laboratorista'
    
    -- Estado en cola
    estado_cola VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_cola IN ('pendiente', 'asignado', 'en_proceso')),
    
    -- Tiempos en cola
    entrada_cola TIMESTAMPTZ DEFAULT NOW(),
    inicio_atencion TIMESTAMPTZ,
    tiempo_espera_min INTEGER DEFAULT 0,
    
    -- Prioridad dinámica
    prioridad_score INTEGER DEFAULT 0, -- Calculado según tipo y tiempo espera
    
    usuario_asignado_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cola_empresa ON cola_trabajo(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cola_rol ON cola_trabajo(rol_requerido);
CREATE INDEX IF NOT EXISTS idx_cola_estado ON cola_trabajo(estado_cola);
CREATE INDEX IF NOT EXISTS idx_cola_prioridad ON cola_trabajo(prioridad_score DESC);

-- =====================================================
-- 4. MOVIMIENTOS E HISTORIAL
-- =====================================================

CREATE TABLE IF NOT EXISTS episodio_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episodio_id UUID NOT NULL REFERENCES episodios(id) ON DELETE CASCADE,
    
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    
    usuario_id UUID REFERENCES profiles(id),
    observaciones TEXT,
    
    duracion_estado_anterior_min INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_episodio ON episodio_movimientos(episodio_id);

-- =====================================================
-- 5. FUNCIONES Y TRIGGERS
-- =====================================================

-- Generar Folio Episodio
CREATE OR REPLACE FUNCTION generar_folio_episodio()
RETURNS TRIGGER AS $$
DECLARE
    v_consecutivo INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO v_consecutivo
    FROM episodios
    WHERE fecha_registro::DATE = CURRENT_DATE;
    
    NEW.folio := 'epi-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_consecutivo::TEXT, 4, '0');
    
    -- Asignar SLA default si no viene
    IF NEW.tiempo_sla_limite_min IS NULL THEN
        SELECT sla_default_minutos INTO NEW.tiempo_sla_limite_min
        FROM episodio_tipos WHERE codigo = NEW.tipo_episodio;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_folio_episodio
    BEFORE INSERT ON episodios
    FOR EACH ROW
    EXECUTE FUNCTION generar_folio_episodio();

-- Gestión automática de Cola de Trabajo
CREATE OR REPLACE FUNCTION gestionar_cola_trabajo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el estado cambia, sacar de cola anterior
    IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
        DELETE FROM cola_trabajo WHERE episodio_id = NEW.id AND estado_cola = 'pendiente';
    END IF;

    -- Insertar en nueva cola según estado
    IF NEW.estado = 'REGISTRADO' THEN
        -- No entra a cola (o cola recepción si se requiere)
    ELSIF NEW.estado = 'EN_ESPERA_ENF' THEN
        INSERT INTO cola_trabajo (episodio_id, empresa_id, rol_requerido)
        VALUES (NEW.id, NEW.empresa_id, 'enfermera');
    ELSIF NEW.estado = 'EN_ESPERA_MED' THEN
        INSERT INTO cola_trabajo (episodio_id, empresa_id, rol_requerido)
        VALUES (NEW.id, NEW.empresa_id, 'medico');
    ELSIF NEW.estado IN ('EN_ATENCION_ENF', 'EN_ATENCION_MED') THEN
        -- Actualizar cola a 'en_proceso' si existe
        UPDATE cola_trabajo SET estado_cola = 'en_proceso', inicio_atencion = NOW(), usuario_asignado_id = NEW.updated_by
        WHERE episodio_id = NEW.id AND estado_cola = 'pendiente';
    END IF;
    
    -- Registrar movimiento
    IF TG_OP = 'insert' OR OLD.estado != NEW.estado THEN
        INSERT INTO episodio_movimientos (episodio_id, estado_anterior, estado_nuevo, usuario_id)
        VALUES (NEW.id, CASE WHEN TG_OP = 'UPDATE' THEN OLD.estado ELSE NULL END, NEW.estado, NEW.updated_by);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_gestionar_cola
    AFTER INSERT OR UPDATE ON episodios
    FOR EACH ROW
    EXECUTE FUNCTION gestionar_cola_trabajo();

-- =====================================================
-- 6. RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE episodios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cola_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodio_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodio_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodio_estados ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura generales (Catalogos)
CREATE POLICY lectura_publica_tipos ON episodio_tipos FOR SELECT USING (true);
CREATE POLICY lectura_publica_estados ON episodio_estados FOR SELECT USING (true);

-- Políticas de Episodios
CREATE POLICY episodios_select ON episodios
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY episodios_all ON episodios
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

-- Políticas de Cola
CREATE POLICY cola_select ON cola_trabajo
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY cola_all ON cola_trabajo
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE episodios IS 'Episodios de atención médica (visitas)';
COMMENT ON TABLE cola_trabajo IS 'Lista de espera activa por rol';
