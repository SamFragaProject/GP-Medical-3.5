-- =====================================================
-- MIGRACIÓN: Programa NOM-011 Conservación Auditiva
-- GPMedical ERP Pro - Fundamentos Legales
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. TABLA: PROGRAMAS DE CONSERVACIÓN AUDITIVA
-- =====================================================

CREATE TABLE IF NOT EXISTS programas_conservacion_auditiva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    
    -- Identificación del programa
    anio INTEGER NOT NULL,
    folio VARCHAR(50),
    nombre_programa VARCHAR(200),
    descripcion TEXT,
    
    -- Fechas del programa
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_cierre_programa DATE,
    
    -- Cobertura
    total_trabajadores_expuestos INTEGER DEFAULT 0,
    trabajadores_evaluados INTEGER DEFAULT 0,
    trabajadores_con_dano INTEGER DEFAULT 0,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('planificado', 'activo', 'en_proceso', 'completado', 'cerrado')),
    
    -- Responsables
    responsable_medico_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responsable_empresa_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Documentos
    dictamen_tecnico_url TEXT,
    informe_anual_url TEXT,
    acta_cierre_url TEXT,
    
    -- Métricas del programa
    porcentaje_cobertura DECIMAL(5,2),
    porcentaje_epp_conforme DECIMAL(5,2),
    promedio_nivel_exposicion_db DECIMAL(5,2),
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, sede_id, anio)
);

CREATE INDEX IF NOT EXISTS idx_programas_auditiva_empresa ON programas_conservacion_auditiva(empresa_id);
CREATE INDEX IF NOT EXISTS idx_programas_auditiva_anio ON programas_conservacion_auditiva(anio);
CREATE INDEX IF NOT EXISTS idx_programas_auditiva_estado ON programas_conservacion_auditiva(estado);

-- =====================================================
-- 2. TABLA: ESTUDIOS DE AUDIOMETRÍA NOM-011
-- =====================================================

CREATE TABLE IF NOT EXISTS estudios_audiometria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    programa_id UUID REFERENCES programas_conservacion_auditiva(id) ON DELETE SET NULL,
    
    -- Paciente y contexto
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE SET NULL,
    puesto_trabajo VARCHAR(100),
    area_trabajo VARCHAR(100),
    
    -- Tipo de estudio según NOM-011
    tipo_estudio VARCHAR(20) NOT NULL CHECK (tipo_estudio IN ('ingreso', 'periodico', 'cambio_area', 'baja', 'especial', 'reevaluacion')),
    motivo_reevaluacion TEXT,
    
    -- Fechas
    fecha_estudio DATE NOT NULL,
    hora_estudio TIME,
    tiempo_exposicion_ruido_horas INTEGER, -- Horas previas al estudio
    
    -- Resultado general
    resultado VARCHAR(20) CHECK (resultado IN ('normal', 'observacion', 'dano_reversible', 'dano_irreversible', 'no_concluyente')),
    semaforo VARCHAR(10) CHECK (semaforo IN ('verde', 'amarillo', 'rojo')),
    
    -- Oído Derecho - Umbrales en dB por frecuencia
    od_250hz INTEGER,
    od_500hz INTEGER,
    od_1000hz INTEGER,
    od_1500hz INTEGER,
    od_2000hz INTEGER,
    od_3000hz INTEGER,
    od_4000hz INTEGER,
    od_6000hz INTEGER,
    od_8000hz INTEGER,
    
    -- Oído Izquierdo - Umbrales en dB por frecuencia
    oi_250hz INTEGER,
    oi_500hz INTEGER,
    oi_1000hz INTEGER,
    oi_1500hz INTEGER,
    oi_2000hz INTEGER,
    oi_3000hz INTEGER,
    oi_4000hz INTEGER,
    oi_6000hz INTEGER,
    oi_8000hz INTEGER,
    
    -- Promedios NOM-011
    od_promedio_500_1000_2000 DECIMAL(5,2),
    oi_promedio_500_1000_2000 DECIMAL(5,2),
    od_promedio_3000_4000_6000 DECIMAL(5,2),
    oi_promedio_3000_4000_6000 DECIMAL(5,2),
    
    -- Índices de audición
    indice_michel_od DECIMAL(5,2),
    indice_michel_oi DECIMAL(5,2),
    indice_michel_promedio DECIMAL(5,2),
    
    -- Comparativa con línea base (para estudios periódicos)
    tiene_linea_base BOOLEAN DEFAULT false,
    variacion_od_4000hz INTEGER,
    variacion_oi_4000hz INTEGER,
    variacion_significativa BOOLEAN DEFAULT false,
    
    -- Categorización NOM-011
    categoria_riesgo VARCHAR(5) CHECK (categoria_riesgo IN ('I', 'II', 'III', 'IV')),
    -- I: Sin daño, II: Observación, III: Daño, IV: Daño significativo
    
    -- Nivel de exposición laboral
    nivel_exposicion_db DECIMAL(5,2),
    tiempo_exposicion_diario_horas DECIMAL(4,2),
    excede_limite_nom BOOLEAN DEFAULT false,
    
    -- Interpretación
    interpretacion_tecnica TEXT,
    retardo_auditivo_od BOOLEAN DEFAULT false,
    retardo_auditivo_oi BOOLEAN DEFAULT false,
    
    -- Recomendaciones
    requiere_reevaluacion BOOLEAN DEFAULT false,
    tiempo_reevaluacion_meses INTEGER,
    requiere_proteccion BOOLEAN DEFAULT false,
    observaciones TEXT,
    
    -- Referencia al estudio anterior (si existe)
    estudio_anterior_id UUID REFERENCES estudios_audiometria(id) ON DELETE SET NULL,
    
    -- Equipo y calibración
    equipo_audiometro VARCHAR(100),
    numero_serie VARCHAR(50),
    ultima_calibracion DATE,
    proxima_calibracion DATE,
    
    -- Técnico
    tecnico_realiza_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tecnico_nombre VARCHAR(200),
    medico_interpreta_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    medico_nombre VARCHAR(200),
    cedula_profesional VARCHAR(50),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'completo' CHECK (estado IN ('pendiente', 'en_proceso', 'completo', 'invalidado')),
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audiometria_empresa ON estudios_audiometria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audiometria_paciente ON estudios_audiometria(paciente_id);
CREATE INDEX IF NOT EXISTS idx_audiometria_programa ON estudios_audiometria(programa_id);
CREATE INDEX IF NOT EXISTS idx_audiometria_tipo ON estudios_audiometria(tipo_estudio);
CREATE INDEX IF NOT EXISTS idx_audiometria_fecha ON estudios_audiometria(fecha_estudio);
CREATE INDEX IF NOT EXISTS idx_audiometria_semaforo ON estudios_audiometria(semaforo);
CREATE INDEX IF NOT EXISTS idx_audiometria_categoria ON estudios_audiometria(categoria_riesgo);

-- =====================================================
-- 3. TABLA: EPP AUDITIVO ENTREGADO
-- =====================================================

CREATE TABLE IF NOT EXISTS epp_auditivo_entregado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    programa_id UUID REFERENCES programas_conservacion_auditiva(id) ON DELETE SET NULL,
    
    -- Tipo de protección
    tipo_proteccion VARCHAR(50) NOT NULL, -- 'tapones_oidos', 'orejeras', 'tapones_personalizados', 'combinacion'
    marca VARCHAR(100),
    modelo VARCHAR(100),
    nrr_db DECIMAL(4,1), -- Nivel de Reducción de Ruido en dB
    
    -- Entrega
    fecha_entrega DATE NOT NULL,
    cantidad INTEGER DEFAULT 1,
    talla VARCHAR(20),
    color VARCHAR(30),
    
    -- Instrucción al trabajador
    instruccion_dada BOOLEAN DEFAULT false,
    fecha_instruccion DATE,
    entendimiento_verificado BOOLEAN DEFAULT false,
    
    -- Reposiciones
    es_reposicion BOOLEAN DEFAULT false,
    motivo_reposicion TEXT,
    epp_anterior_id UUID REFERENCES epp_auditivo_entregado(id) ON DELETE SET NULL,
    
    -- Control de uso
    fecha_verificacion_uso DATE,
    conforme_uso BOOLEAN,
    observaciones_uso TEXT,
    
    -- Responsable
    responsable_entrega_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_epp_auditivo_empresa ON epp_auditivo_entregado(empresa_id);
CREATE INDEX IF NOT EXISTS idx_epp_auditivo_paciente ON epp_auditivo_entregado(paciente_id);
CREATE INDEX IF NOT EXISTS idx_epp_auditivo_fecha ON epp_auditivo_entregado(fecha_entrega);

-- =====================================================
-- 4. TABLA: ÁREAS CON RIESGO DE EXPOSICIÓN AL RUIDO
-- =====================================================

CREATE TABLE IF NOT EXISTS areas_exposicion_ruido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    programa_id UUID REFERENCES programas_conservacion_auditiva(id) ON DELETE SET NULL,
    
    nombre_area VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    -- Mediciones
    nivel_ruido_db DECIMAL(5,2),
    fecha_medicion DATE,
    tipo_medicion VARCHAR(20), -- 'dosimetria', 'integrador', 'sonometro'
    cumple_nom011 BOOLEAN,
    
    -- Clasificación
    zona_ruido VARCHAR(20) CHECK (zona_ruido IN ('no_danina', 'observacion', 'dañina', 'muy_danina')),
    requiere_epp BOOLEAN DEFAULT false,
    
    -- Trabajadores expuestos
    numero_trabajadores INTEGER DEFAULT 0,
    puestos_afectados TEXT[],
    
    -- Medidas de control
    medidas_ingenieria TEXT[],
    medidas_administrativas TEXT[],
    
    -- Documentación
    foto_url TEXT,
    plano_ubicacion TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_areas_ruido_empresa ON areas_exposicion_ruido(empresa_id);
CREATE INDEX IF NOT EXISTS idx_areas_ruido_programa ON areas_exposicion_ruido(programa_id);
CREATE INDEX IF NOT EXISTS idx_areas_ruido_zona ON areas_exposicion_ruido(zona_ruido);

-- =====================================================
-- 5. FUNCIÓN: CALCULAR SEMÁFORO NOM-011
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_semaforo_nom011(
    p_od_500 INTEGER, p_od_1000 INTEGER, p_od_2000 INTEGER, p_od_3000 INTEGER, p_od_4000 INTEGER, p_od_6000 INTEGER,
    p_oi_500 INTEGER, p_oi_1000 INTEGER, p_oi_2000 INTEGER, p_oi_3000 INTEGER, p_oi_4000 INTEGER, p_oi_6000 INTEGER,
    p_od_prom_500_1000_2000 DECIMAL DEFAULT NULL,
    p_oi_prom_500_1000_2000 DECIMAL DEFAULT NULL,
    p_od_prom_3000_4000_6000 DECIMAL DEFAULT NULL,
    p_oi_prom_3000_4000_6000 DECIMAL DEFAULT NULL
)
RETURNS VARCHAR(10) AS $$
DECLARE
    v_od_prom_500_1000_2000 DECIMAL;
    v_oi_prom_500_1000_2000 DECIMAL;
    v_od_prom_3000_4000_6000 DECIMAL;
    v_oi_prom_3000_4000_6000 DECIMAL;
    v_semaforo VARCHAR(10) := 'verde';
BEGIN
    -- Calcular promedios si no se proporcionaron
    v_od_prom_500_1000_2000 := COALESCE(p_od_prom_500_1000_2000, (p_od_500 + p_od_1000 + p_od_2000) / 3.0);
    v_oi_prom_500_1000_2000 := COALESCE(p_oi_prom_500_1000_2000, (p_oi_500 + p_oi_1000 + p_oi_2000) / 3.0);
    v_od_prom_3000_4000_6000 := COALESCE(p_od_prom_3000_4000_6000, (p_od_3000 + p_od_4000 + p_od_6000) / 3.0);
    v_oi_prom_3000_4000_6000 := COALESCE(p_oi_prom_3000_4000_6000, (p_oi_3000 + p_oi_4000 + p_oi_6000) / 3.0);
    
    -- Criterios para SEMÁFORO ROJO (daño auditivo significativo)
    -- Promedio 500-1000-2000 > 25 dB en cualquier oído
    IF v_od_prom_500_1000_2000 > 25 OR v_oi_prom_500_1000_2000 > 25 THEN
        RETURN 'rojo';
    END IF;
    
    -- Promedio 3000-4000-6000 > 25 dB en cualquier oído (frecuencias de exposición laboral)
    IF v_od_prom_3000_4000_6000 > 25 OR v_oi_prom_3000_4000_6000 > 25 THEN
        RETURN 'rojo';
    END IF;
    
    -- Criterios para SEMÁFORO AMARILLO (observación)
    -- Promedio 500-1000-2000 > 20 dB o < 25 dB
    IF v_od_prom_500_1000_2000 > 20 OR v_oi_prom_500_1000_2000 > 20 THEN
        v_semaforo := 'amarillo';
    END IF;
    
    -- Promedio 3000-4000-6000 > 20 dB o < 25 dB
    IF v_od_prom_3000_4000_6000 > 20 OR v_oi_prom_3000_4000_6000 > 20 THEN
        v_semaforo := 'amarillo';
    END IF;
    
    -- Diferencia interaural > 15 dB en frecuencias de 3000-4000-6000 Hz (sospecha de daño inducido por ruido)
    IF ABS(v_od_prom_3000_4000_6000 - v_oi_prom_3000_4000_6000) > 15 THEN
        v_semaforo := 'amarillo';
    END IF;
    
    RETURN v_semaforo;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN: CALCULAR CATEGORÍA DE RIESGO NOM-011
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_categoria_riesgo_nom011(
    p_od_500 INTEGER, p_od_1000 INTEGER, p_od_2000 INTEGER, p_od_3000 INTEGER, p_od_4000 INTEGER, p_od_6000 INTEGER,
    p_oi_500 INTEGER, p_oi_1000 INTEGER, p_oi_2000 INTEGER, p_oi_3000 INTEGER, p_oi_4000 INTEGER, p_oi_6000 INTEGER
)
RETURNS VARCHAR(5) AS $$
DECLARE
    v_od_prom_conv DECIMAL;
    v_oi_prom_conv DECIMAL;
    v_od_prom_3000_4000_6000 DECIMAL;
    v_oi_prom_3000_4000_6000 DECIMAL;
    v_semaforo VARCHAR(10);
BEGIN
    -- Calcular promedios conversacionales (500-1000-2000 Hz)
    v_od_prom_conv := (p_od_500 + p_od_1000 + p_od_2000) / 3.0;
    v_oi_prom_conv := (p_oi_500 + p_oi_1000 + p_oi_2000) / 3.0;
    
    -- Calcular promedios en frecuencias de exposición laboral (3000-4000-6000 Hz)
    v_od_prom_3000_4000_6000 := (p_od_3000 + p_od_4000 + p_od_6000) / 3.0;
    v_oi_prom_3000_4000_6000 := (p_oi_3000 + p_oi_4000 + p_oi_6000) / 3.0;
    
    -- Determinar categoría según criterios NOM-011
    -- Categoría I: Audición normal (promedios ≤ 25 dB en ambos oídos)
    IF v_od_prom_conv <= 25 AND v_oi_prom_conv <= 25 AND v_od_prom_3000_4000_6000 <= 25 AND v_oi_prom_3000_4000_6000 <= 25 THEN
        RETURN 'I';
    END IF;
    
    -- Categoría IV: Daño significativo (promedio conversacional > 40 dB o diferencia interaural > 30 dB)
    IF v_od_prom_conv > 40 OR v_oi_prom_conv > 40 OR ABS(v_od_prom_conv - v_oi_prom_conv) > 30 THEN
        RETURN 'IV';
    END IF;
    
    -- Categoría III: Daño auditivo (promedio conversacional > 25 dB o promedio 3000-4000-6000 > 25 dB)
    IF v_od_prom_conv > 25 OR v_oi_prom_conv > 25 OR v_od_prom_3000_4000_6000 > 25 OR v_oi_prom_3000_4000_6000 > 25 THEN
        RETURN 'III';
    END IF;
    
    -- Categoría II: Observación (otros casos con alteraciones leves)
    RETURN 'II';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN: CALCULAR ÍNDICE DE MICHEL
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_indice_michel(
    p_od_1000 INTEGER, p_od_2000 INTEGER, p_od_4000 INTEGER,
    p_oi_1000 INTEGER, p_oi_2000 INTEGER, p_oi_4000 INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    v_od_indice DECIMAL;
    v_oi_indice DECIMAL;
BEGIN
    -- Fórmula del índice de Michel: 
    -- (Umbral 1000 Hz + 2 × Umbral 2000 Hz + Umbral 4000 Hz) / 4
    v_od_indice := (p_od_1000 + 2 * p_od_2000 + p_od_4000) / 4.0;
    v_oi_indice := (p_oi_1000 + 2 * p_oi_2000 + p_oi_4000) / 4.0;
    
    -- Retornar el promedio de ambos oídos
    RETURN (v_od_indice + v_oi_indice) / 2.0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGER PARA CALCULAR AUTOMÁTICAMENTE VALORES DERIVADOS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_calcular_audiometria()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular promedios
    NEW.od_promedio_500_1000_2000 := (NEW.od_500hz + NEW.od_1000hz + NEW.od_2000hz) / 3.0;
    NEW.oi_promedio_500_1000_2000 := (NEW.oi_500hz + NEW.oi_1000hz + NEW.oi_2000hz) / 3.0;
    NEW.od_promedio_3000_4000_6000 := (NEW.od_3000hz + NEW.od_4000hz + NEW.od_6000hz) / 3.0;
    NEW.oi_promedio_3000_4000_6000 := (NEW.oi_3000hz + NEW.oi_4000hz + NEW.oi_6000hz) / 3.0;
    
    -- Calcular semáforo
    NEW.semaforo := calcular_semaforo_nom011(
        NEW.od_500hz, NEW.od_1000hz, NEW.od_2000hz, NEW.od_3000hz, NEW.od_4000hz, NEW.od_6000hz,
        NEW.oi_500hz, NEW.oi_1000hz, NEW.oi_2000hz, NEW.oi_3000hz, NEW.oi_4000hz, NEW.oi_6000hz,
        NEW.od_promedio_500_1000_2000, NEW.oi_promedio_500_1000_2000,
        NEW.od_promedio_3000_4000_6000, NEW.oi_promedio_3000_4000_6000
    );
    
    -- Calcular categoría de riesgo
    NEW.categoria_riesgo := calcular_categoria_riesgo_nom011(
        NEW.od_500hz, NEW.od_1000hz, NEW.od_2000hz, NEW.od_3000hz, NEW.od_4000hz, NEW.od_6000hz,
        NEW.oi_500hz, NEW.oi_1000hz, NEW.oi_2000hz, NEW.oi_3000hz, NEW.oi_4000hz, NEW.oi_6000hz
    );
    
    -- Calcular índice de Michel
    NEW.indice_michel_od := (NEW.od_1000hz + 2 * NEW.od_2000hz + NEW.od_4000hz) / 4.0;
    NEW.indice_michel_oi := (NEW.oi_1000hz + 2 * NEW.oi_2000hz + NEW.oi_4000hz) / 4.0;
    NEW.indice_michel_promedio := (NEW.indice_michel_od + NEW.indice_michel_oi) / 2.0;
    
    -- Determinar resultado
    NEW.resultado := CASE NEW.categoria_riesgo
        WHEN 'I' THEN 'normal'
        WHEN 'II' THEN 'observacion'
        WHEN 'III' THEN 'dano_reversible'
        WHEN 'IV' THEN 'dano_irreversible'
    END;
    
    -- Detectar retardo auditivo (diferencia > 15 dB entre oídos en frecuencias altas)
    NEW.retardo_auditivo_od := (NEW.od_promedio_3000_4000_6000 - NEW.oi_promedio_3000_4000_6000) > 15;
    NEW.retardo_auditivo_oi := (NEW.oi_promedio_3000_4000_6000 - NEW.od_promedio_3000_4000_6000) > 15;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calcular_audiometria ON estudios_audiometria;
CREATE TRIGGER tr_calcular_audiometria
    BEFORE INSERT OR UPDATE ON estudios_audiometria
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calcular_audiometria();

-- =====================================================
-- 9. RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE programas_conservacion_auditiva ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_audiometria ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_auditivo_entregado ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas_exposicion_ruido ENABLE ROW LEVEL SECURITY;

-- Políticas para programas
CREATE POLICY programas_auditiva_select ON programas_conservacion_auditiva
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY programas_auditiva_all ON programas_conservacion_auditiva
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('medico', 'admin_empresa', 'super_admin'))
            OR EXISTS (
                SELECT 1 FROM profiles p
                JOIN roles_empresa r ON p.rol_empresa_id = r.id
                WHERE p.id = auth.uid() AND r.codigo IN ('medico', 'admin_empresa')
            )
        )
    );

-- Políticas para audiometrías
CREATE POLICY audiometria_select ON estudios_audiometria
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY audiometria_all ON estudios_audiometria
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('medico', 'enfermera', 'admin_empresa', 'super_admin'))
            OR EXISTS (
                SELECT 1 FROM profiles p
                JOIN roles_empresa r ON p.rol_empresa_id = r.id
                WHERE p.id = auth.uid() AND r.codigo IN ('medico', 'enfermera', 'admin_empresa')
            )
        )
    );

-- Políticas para EPP
CREATE POLICY epp_auditivo_select ON epp_auditivo_entregado
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY epp_auditivo_all ON epp_auditivo_entregado
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('medico', 'enfermera', 'admin_empresa', 'super_admin'))
            OR EXISTS (
                SELECT 1 FROM profiles p
                JOIN roles_empresa r ON p.rol_empresa_id = r.id
                WHERE p.id = auth.uid() AND r.codigo IN ('medico', 'enfermera', 'admin_empresa')
            )
        )
    );

-- Políticas para áreas
CREATE POLICY areas_ruido_select ON areas_exposicion_ruido
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY areas_ruido_all ON areas_exposicion_ruido
    FOR ALL USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('medico', 'admin_empresa', 'super_admin'))
            OR EXISTS (
                SELECT 1 FROM profiles p
                JOIN roles_empresa r ON p.rol_empresa_id = r.id
                WHERE p.id = auth.uid() AND r.codigo IN ('medico', 'admin_empresa')
            )
        )
    );

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE programas_conservacion_auditiva IS 'Programas anuales de conservación auditiva según NOM-011';
COMMENT ON TABLE estudios_audiometria IS 'Estudios de audiometría con cálculos NOM-011';
COMMENT ON TABLE epp_auditivo_entregado IS 'Control de entrega de EPP auditivo a trabajadores';
COMMENT ON TABLE areas_exposicion_ruido IS 'Áreas de la empresa con evaluación de exposición al ruido';
COMMENT ON FUNCTION calcular_semaforo_nom011 IS 'Calcula el semáforo de riesgo según criterios NOM-011';
COMMENT ON FUNCTION calcular_categoria_riesgo_nom011 IS 'Calcula la categoría de riesgo auditivo I-IV según NOM-011';
