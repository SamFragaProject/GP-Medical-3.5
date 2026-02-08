-- =====================================================
-- MIGRACIÓN: Programa NOM-036 Ergonomía
-- GPMedical ERP Pro - Fundamentos Legales
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. TABLA: PROGRAMAS DE ERGONOMÍA NOM-036
-- =====================================================

CREATE TABLE IF NOT EXISTS programas_ergonomia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    
    -- Identificación
    anio INTEGER NOT NULL,
    nombre_programa VARCHAR(200),
    descripcion TEXT,
    
    -- Fechas
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_cierre DATE,
    
    -- Cobertura
    total_puestos_evaluados INTEGER DEFAULT 0,
    total_trabajadores_capacitados INTEGER DEFAULT 0,
    total_riesgos_identificados INTEGER DEFAULT 0,
    total_medidas_implementadas INTEGER DEFAULT 0,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('planificado', 'activo', 'en_proceso', 'completado', 'cerrado')),
    
    -- Responsables
    responsable_medico_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responsable_empresa_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Documentos
    diagnostico_ergonomico_url TEXT,
    programa_trabajo_url TEXT,
    informe_anual_url TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, sede_id, anio)
);

CREATE INDEX IF NOT EXISTS idx_programas_ergonomia_empresa ON programas_ergonomia(empresa_id);
CREATE INDEX IF NOT EXISTS idx_programas_ergonomia_anio ON programas_ergonomia(anio);
CREATE INDEX IF NOT EXISTS idx_programas_ergonomia_estado ON programas_ergonomia(estado);

-- =====================================================
-- 2. TABLA: EVALUACIONES ERGONÓMICAS
-- =====================================================

CREATE TABLE IF NOT EXISTS evaluaciones_ergonomicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    programa_id UUID REFERENCES programas_ergonomia(id) ON DELETE SET NULL,
    
    -- Paciente/Trabajador evaluado (puede ser NULL si es evaluación de puesto)
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    
    -- Puesto evaluado
    puesto_trabajo VARCHAR(100) NOT NULL,
    area_trabajo VARCHAR(100),
    descripcion_tarea TEXT,
    
    -- Método de evaluación
    metodo_evaluacion VARCHAR(20) NOT NULL CHECK (metodo_evaluacion IN ('REBA', 'RUEDA', 'OWAS', 'NIOSH', 'OSHA', 'MANUAL')),
    
    -- Fecha
    fecha_evaluacion DATE NOT NULL,
    duracion_evaluacion_minutos INTEGER,
    
    -- Puntuación y nivel de riesgo
    puntuacion_total INTEGER,
    nivel_riesgo VARCHAR(20) CHECK (nivel_riesgo IN ('aceptable', 'medio', 'alto', 'muy_alto')),
    color_riesgo VARCHAR(20), -- 'verde', 'amarillo', 'naranja', 'rojo'
    
    -- Factores de riesgo identificados
    factores_riesgo TEXT[] DEFAULT '{}',
    -- Posibles valores: 'postura_forzada', 'movimientos_repetitivos', 'manejo_cargas', 'iluminacion_inadecuada', 
    -- 'temperatura_extrema', 'vibracion', 'ritmo_excesivo', 'pausas_insuficientes', 'monotonia', 'sobreesfuerzo'
    
    -- Recomendaciones
    recomendaciones TEXT[] DEFAULT '{}',
    medidas_control TEXT[] DEFAULT '{}',
    
    -- Datos específicos según método (almacenados en JSON)
    datos_raw JSONB DEFAULT '{}'::jsonb,
    
    -- Interpretación
    interpretacion_resultado TEXT,
    requiere_intervencion BOOLEAN DEFAULT false,
    prioridad_intervencion VARCHAR(20) CHECK (prioridad_intervencion IN ('baja', 'media', 'alta', 'urgente')),
    
    -- Seguimiento
    fecha_seguimiento DATE,
    resultado_seguimiento TEXT,
    
    -- Multimedia
    fotos_antes JSONB DEFAULT '[]'::jsonb,
    fotos_despues JSONB DEFAULT '[]'::jsonb,
    video_evaluacion_url TEXT,
    
    -- Evaluador
    evaluador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    evaluador_nombre VARCHAR(200),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'con_seguimiento', 'cerrado')),
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_empresa ON evaluaciones_ergonomicas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_paciente ON evaluaciones_ergonomicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_programa ON evaluaciones_ergonomicas(programa_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_metodo ON evaluaciones_ergonomicas(metodo_evaluacion);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_riesgo ON evaluaciones_ergonomicas(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ergo_fecha ON evaluaciones_ergonomicas(fecha_evaluacion);

-- =====================================================
-- 3. TABLA: CAPACITACIONES EN ERGONOMÍA
-- =====================================================

CREATE TABLE IF NOT EXISTS capacitaciones_ergonomia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    programa_id UUID REFERENCES programas_ergonomia(id) ON DELETE SET NULL,
    
    -- Información de la capacitación
    tema VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_capacitacion VARCHAR(50), -- 'induccion', 'reentrenamiento', 'especifica', 'charla'
    
    -- Fecha y duración
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    duracion_horas DECIMAL(4,2),
    
    -- Lugar
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    lugar VARCHAR(200),
    
    -- Instructor
    instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    instructor_nombre VARCHAR(200),
    instructor_externo VARCHAR(200),
    
    -- Participantes
    numero_participantes INTEGER DEFAULT 0,
    participantes_ids UUID[] DEFAULT '{}',
    areas_participantes TEXT[] DEFAULT '{}',
    
    -- Evaluación
    material_entregado BOOLEAN DEFAULT false,
    evaluacion_efectividad BOOLEAN DEFAULT false,
    calificacion_promedio DECIMAL(3,2),
    
    -- Documentos
    lista_asistencia_url TEXT,
    material_capacitacion_url TEXT,
    evidencia_fotografica JSONB DEFAULT '[]'::jsonb,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'reprogramada')),
    
    -- Observaciones
    observaciones TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacitaciones_ergo_empresa ON capacitaciones_ergonomia(empresa_id);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_ergo_programa ON capacitaciones_ergonomia(programa_id);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_ergo_fecha ON capacitaciones_ergonomia(fecha);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_ergo_estado ON capacitaciones_ergonomia(estado);

-- =====================================================
-- 4. TABLA: CATÁLOGO DE FACTORES DE RIESGO ERGONÓMICO
-- =====================================================

CREATE TABLE IF NOT EXISTS factores_riesgo_ergonomico_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL, -- 'fisico', 'cognitivo', 'organizacional', 'psicosocial'
    subcategoria VARCHAR(50),
    
    -- Características
    sintomas_asociados TEXT[] DEFAULT '{}',
    enfermedades_asociadas TEXT[] DEFAULT '{}',
    medidas_preventivas TEXT[] DEFAULT '{}',
    
    -- Evaluación
    metodo_evaluacion_recomendado VARCHAR(20), -- 'REBA', 'RUEDA', 'OWAS', 'NIOSH'
    umbral_riesgo_bajo INTEGER,
    umbral_riesgo_medio INTEGER,
    umbral_riesgo_alto INTEGER,
    
    -- NOM-036
    requiere_atencion_nom036 BOOLEAN DEFAULT false,
    prioridad_nom036 INTEGER DEFAULT 5,
    
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_factores_riesgo_categoria ON factores_riesgo_ergonomico_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_factores_riesgo_activo ON factores_riesgo_ergonomico_catalogo(activo);

-- =====================================================
-- 5. FUNCIÓN: CALCULAR REBA (Rapid Entire Body Assessment)
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_reba(
    -- Grupo A: Cuello, Tronco, Piernas
    p_cuello INTEGER, -- 1-3: 1=0-20°, 2=20-45°, 3=>45°
    p_tronco INTEGER, -- 1-5: 1=0°, 2=0-20°, 3=20-60°, 4=>60°, 5=twist
    p_piernas INTEGER, -- 1-4: 1=bipedestación, 2=sentado, 3=una pierna, 4=inestable
    
    -- Grupo B: Brazos, Antebrazos, Muñecas
    p_brazo INTEGER, -- 1-6: 1=0-20°, 2=20-45°, 3=45-90°, 4=>90°, 5=extension, 6=abduccion
    p_antebrazo INTEGER, -- 1-2: 1=60-100°, 2=<60° o >100°
    p_muneca INTEGER, -- 1-3: 1=neutral, 2=0-15°, 3=>15°
    
    -- Factores de corrección
    p_carga INTEGER, -- 0-3: 0=<5kg, 1=5-10kg, 2=10+kg, 3=sorpresa
    p_agarrre INTEGER, -- 0-3: 0=bueno, 1=regular, 2=malo, 3=inusual
    p_actividad INTEGER -- 0-3: 0=estatico, 1=repetitivo, 2=posturas_cambio, 3=in estable
)
RETURNS JSONB AS $$
DECLARE
    v_score_a INTEGER;
    v_score_b INTEGER;
    v_score_c INTEGER;
    v_nivel_riesgo VARCHAR(20);
    v_color VARCHAR(20);
    v_accion TEXT;
BEGIN
    -- Tabla de puntuación para Grupo A (Cuello, Tronco, Piernas)
    -- Simplificación: Score A base
    v_score_a := p_cuello + p_tronco + p_piernas - 2; -- Ajuste base
    IF v_score_a < 1 THEN v_score_a := 1; END IF;
    IF v_score_a > 12 THEN v_score_a := 12; END IF;
    
    -- Tabla de puntuación para Grupo B (Brazo, Antebrazo, Muñeca)
    v_score_b := p_brazo + p_antebrazo + p_muneca - 2;
    IF v_score_b < 1 THEN v_score_b := 1; END IF;
    IF v_score_b > 12 THEN v_score_b := 12; END IF;
    
    -- Tabla C: Combinación de A y B (simplificada)
    -- En implementación real, usar tabla lookup completa
    v_score_c := v_score_a + v_score_b + p_carga + p_agarrre + p_actividad;
    
    -- Nivel de riesgo según Score C
    IF v_score_c <= 3 THEN
        v_nivel_riesgo := 'aceptable';
        v_color := 'verde';
        v_accion := 'Riesgo aceptable. No se requiere acción.';
    ELSIF v_score_c <= 7 THEN
        v_nivel_riesgo := 'medio';
        v_color := 'amarillo';
        v_accion := 'Riesgo medio. Se requiere investigación y cambios próximamente.';
    ELSIF v_score_c <= 10 THEN
        v_nivel_riesgo := 'alto';
        v_color := 'naranja';
        v_accion := 'Riesgo alto. Se requiere investigación y cambios pronto.';
    ELSE
        v_nivel_riesgo := 'muy_alto';
        v_color := 'rojo';
        v_accion := 'Riesgo muy alto. Se requiere implementar cambios inmediatamente.';
    END IF;
    
    RETURN jsonb_build_object(
        'score_a', v_score_a,
        'score_b', v_score_b,
        'score_c', v_score_c,
        'nivel_riesgo', v_nivel_riesgo,
        'color', v_color,
        'accion_recomendada', v_accion,
        'cuello', p_cuello,
        'tronco', p_tronco,
        'piernas', p_piernas,
        'brazo', p_brazo,
        'antebrazo', p_antebrazo,
        'muneca', p_muneca,
        'carga', p_carga,
        'agarre', p_agarrre,
        'actividad', p_actividad
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN: CALCULAR NIOSH (Lifting Equation)
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_niosh(
    p_hc DECIMAL, -- Horizontal Component (cm)
    p_vc DECIMAL, -- Vertical Component (cm)
    p_dc DECIMAL, -- Distance Component (cm) - recorrido vertical
    p_f INTEGER,  -- Frequency (lifts/min)
    p_a INTEGER,  -- Asymmetry Angle (degrees)
    p_c DECIMAL,  -- Coupling (0.9=poor, 1.0=fair, 1.1=good)
    p_peso_carga DECIMAL -- Peso real de la carga (kg)
)
RETURNS JSONB AS $$
DECLARE
    v_rwl DECIMAL; -- Recommended Weight Limit
    v_li DECIMAL;  -- Lifting Index
    v_nivel_riesgo VARCHAR(20);
    v_color VARCHAR(20);
    v_accion TEXT;
    v_fm DECIMAL; -- Frequency Multiplier
    v_am DECIMAL; -- Asymmetry Multiplier
BEGIN
    -- Multiplicador de frecuencia (simplificado)
    v_fm := CASE 
        WHEN p_f <= 0.2 THEN 1.0
        WHEN p_f <= 1 THEN 0.94
        WHEN p_f <= 4 THEN 0.84
        WHEN p_f <= 6 THEN 0.75
        WHEN p_f <= 8 THEN 0.52
        WHEN p_f <= 9 THEN 0.37
        WHEN p_f <= 10 THEN 0.0
        ELSE 0.0
    END;
    
    -- Multiplicador de asimetría
    v_am := 1 - 0.0032 * p_a;
    IF v_am < 0.71 THEN v_am := 0.71; END IF;
    
    -- Calcular RWL (fórmula simplificada)
    -- RWL = LC * HM * VM * DM * AM * FM * CM
    -- LC = 23 kg (constante)
    v_rwl := 23.0 * 
             (25.0 / p_hc) * -- Horizontal Multiplier
             (1 - 0.003 * ABS(p_vc - 75)) * -- Vertical Multiplier
             (0.82 + 4.5 / p_dc) * -- Distance Multiplier
             v_am * v_fm * p_c;
    
    -- Calcular LI (Lifting Index)
    IF v_rwl > 0 THEN
        v_li := p_peso_carga / v_rwl;
    ELSE
        v_li := 99.0; -- Valor máximo si RWL es 0
    END IF;
    
    -- Nivel de riesgo según LI
    IF v_li <= 1.0 THEN
        v_nivel_riesgo := 'aceptable';
        v_color := 'verde';
        v_accion := 'Carga aceptable para la mayoría de los trabajadores.';
    ELSIF v_li <= 2.0 THEN
        v_nivel_riesgo := 'medio';
        v_color := 'amarillo';
        v_accion := 'Algunos trabajadores pueden estar en riesgo. Requiere monitoreo.';
    ELSIF v_li <= 3.0 THEN
        v_nivel_riesgo := 'alto';
        v_color := 'naranja';
        v_accion := 'Muchos trabajadores están en riesgo. Se requieren cambios.';
    ELSE
        v_nivel_riesgo := 'muy_alto';
        v_color := 'rojo';
        v_accion := 'La mayoría de los trabajadores están en riesgo. Cambios inmediatos requeridos.';
    END IF;
    
    RETURN jsonb_build_object(
        'rwl', ROUND(v_rwl::numeric, 2),
        'li', ROUND(v_li::numeric, 2),
        'nivel_riesgo', v_nivel_riesgo,
        'color', v_color,
        'accion_recomendada', v_accion,
        'peso_carga', p_peso_carga,
        'distancia_horizontal', p_hc,
        'altura_origen', p_vc,
        'recorrido_vertical', p_dc,
        'frecuencia', p_f,
        'angulo_asimetria', p_a,
        'agarre', p_c
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN: CALCULAR OWAS (Ovako Working Posture Analysis)
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_owas(
    p_espalda INTEGER, -- 1-4: 1=recta, 2=flexionada, 3=rotada/torcida, 4=flex_y_rot
    p_brazos INTEGER,  -- 1-3: 1=abajo, 2=ambos_arriba, 3=uno_arriba
    p_piernas INTEGER, -- 1-7: 1=sentado, 2=parado_dos_pies, 3=una_pierna, 4=2pies_flexionadas, etc
    p_carga INTEGER    -- 1-3: 1=<10kg, 2=10-20kg, 3=>20kg o sorpresa
)
RETURNS JSONB AS $$
DECLARE
    v_categoria INTEGER;
    v_accion TEXT;
    v_color VARCHAR(20);
BEGIN
    -- OWAS categoriza en 4 acciones según la combinación de postura y carga
    -- Simplificación: Score basado en suma ponderada
    v_categoria := p_espalda + p_brazos + p_piernas + p_carga;
    
    IF v_categoria <= 6 THEN
        v_accion := 'Acción 1: Postura natural. No se requiere acción.';
        v_color := 'verde';
    ELSIF v_categoria <= 9 THEN
        v_accion := 'Acción 2: Postura a corregir en próxima pausa.';
        v_color := 'amarillo';
    ELSIF v_categoria <= 12 THEN
        v_accion := 'Acción 3: Postura a corregir pronto.';
        v_color := 'naranja';
    ELSE
        v_accion := 'Acción 4: Postura a corregir inmediatamente.';
        v_color := 'rojo';
    END IF;
    
    RETURN jsonb_build_object(
        'score', v_categoria,
        'categoria_accion', SUBSTRING(v_accion FROM 8 FOR 1),
        'accion', v_accion,
        'color', v_color,
        'espalda', p_espalda,
        'brazos', p_brazos,
        'piernas', p_piernas,
        'carga', p_carga
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGER PARA CALCULAR AUTOMÁTICAMENTE EVALUACIONES
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_calcular_evaluacion_ergonomica()
RETURNS TRIGGER AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Calcular según el método seleccionado
    CASE NEW.metodo_evaluacion
        WHEN 'REBA' THEN
            IF NEW.datos_raw ? 'cuello' THEN
                v_resultado := calcular_reba(
                    (NEW.datos_raw->>'cuelno')::INTEGER,
                    (NEW.datos_raw->>'tronco')::INTEGER,
                    (NEW.datos_raw->>'piernas')::INTEGER,
                    (NEW.datos_raw->>'brazo')::INTEGER,
                    (NEW.datos_raw->>'antebrazo')::INTEGER,
                    (NEW.datos_raw->>'muneca')::INTEGER,
                    COALESCE((NEW.datos_raw->>'carga')::INTEGER, 0),
                    COALESCE((NEW.datos_raw->>'agarre')::INTEGER, 1),
                    COALESCE((NEW.datos_raw->>'actividad')::INTEGER, 0)
                );
                NEW.puntuacion_total := (v_resultado->>'score_c')::INTEGER;
                NEW.nivel_riesgo := v_resultado->>'nivel_riesgo';
                NEW.color_riesgo := v_resultado->>'color';
                NEW.interpretacion_resultado := v_resultado->>'accion_recomendada';
            END IF;
            
        WHEN 'NIOSH' THEN
            IF NEW.datos_raw ? 'peso_carga' THEN
                v_resultado := calcular_niosh(
                    (NEW.datos_raw->>'distancia_horizontal')::DECIMAL,
                    (NEW.datos_raw->>'altura_origen')::DECIMAL,
                    (NEW.datos_raw->>'recorrido_vertical')::DECIMAL,
                    (NEW.datos_raw->>'frecuencia')::INTEGER,
                    (NEW.datos_raw->>'angulo_asimetria')::INTEGER,
                    COALESCE((NEW.datos_raw->>'agarre')::DECIMAL, 1.0),
                    (NEW.datos_raw->>'peso_carga')::DECIMAL
                );
                NEW.puntuacion_total := ((v_resultado->>'li')::DECIMAL * 10)::INTEGER;
                NEW.nivel_riesgo := v_resultado->>'nivel_riesgo';
                NEW.color_riesgo := v_resultado->>'color';
                NEW.interpretacion_resultado := v_resultado->>'accion_recomendada';
            END IF;
            
        WHEN 'OWAS' THEN
            IF NEW.datos_raw ? 'espalda' THEN
                v_resultado := calcular_owas(
                    (NEW.datos_raw->>'espalda')::INTEGER,
                    (NEW.datos_raw->>'brazos')::INTEGER,
                    (NEW.datos_raw->>'piernas')::INTEGER,
                    (NEW.datos_raw->>'carga')::INTEGER
                );
                NEW.puntuacion_total := (v_resultado->>'score')::INTEGER;
                NEW.nivel_riesgo := CASE (v_resultado->>'categoria_accion')
                    WHEN '1' THEN 'aceptable'
                    WHEN '2' THEN 'medio'
                    WHEN '3' THEN 'alto'
                    ELSE 'muy_alto'
                END;
                NEW.color_riesgo := v_resultado->>'color';
                NEW.interpretacion_resultado := v_resultado->>'accion';
            END IF;
    END CASE;
    
    -- Determinar si requiere intervención
    NEW.requiere_intervencion := NEW.nivel_riesgo IN ('alto', 'muy_alto');
    NEW.prioridad_intervencion := CASE NEW.nivel_riesgo
        WHEN 'muy_alto' THEN 'urgente'
        WHEN 'alto' THEN 'alta'
        WHEN 'medio' THEN 'media'
        ELSE 'baja'
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calcular_evaluacion_ergo ON evaluaciones_ergonomicas;
CREATE TRIGGER tr_calcular_evaluacion_ergo
    BEFORE INSERT OR UPDATE ON evaluaciones_ergonomicas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calcular_evaluacion_ergonomica();

-- =====================================================
-- 9. RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE programas_ergonomia ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_ergonomicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones_ergonomia ENABLE ROW LEVEL SECURITY;
ALTER TABLE factores_riesgo_ergonomico_catalogo ENABLE ROW LEVEL SECURITY;

-- Políticas para programas
CREATE POLICY programas_ergonomia_select ON programas_ergonomia
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY programas_ergonomia_all ON programas_ergonomia
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

-- Políticas para evaluaciones
CREATE POLICY evaluaciones_ergo_select ON evaluaciones_ergonomicas
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY evaluaciones_ergo_all ON evaluaciones_ergonomicas
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

-- Políticas para capacitaciones
CREATE POLICY capacitaciones_ergo_select ON capacitaciones_ergonomia
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY capacitaciones_ergo_all ON capacitaciones_ergonomia
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

-- Políticas para catálogo de factores
CREATE POLICY factores_riesgo_select ON factores_riesgo_ergonomico_catalogo
    FOR SELECT USING (activo = true);

CREATE POLICY factores_riesgo_admin ON factores_riesgo_ergonomico_catalogo
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

-- =====================================================
-- 10. DATOS INICIALES: CATÁLOGO DE FACTORES DE RIESGO
-- =====================================================

INSERT INTO factores_riesgo_ergonomico_catalogo (codigo, nombre, descripcion, categoria, subcategoria, sintomas_asociados, enfermedades_asociadas, medidas_preventivas, metodo_evaluacion_recomendado, umbral_riesgo_bajo, umbral_riesgo_medio, umbral_riesgo_alto, requiere_atencion_nom036, prioridad_nom036) VALUES
-- Posturas forzadas
('FR-POST-FLEX', 'Flexión forzada de tronco', 'Posturas con flexión de tronco mayor a 30°', 'fisico', 'postura', ARRAY['dolor lumbar', 'fatiga muscular'], ARRAY['lumbalgia', 'hernia discal'], ARRAY['rediseño puesto', 'bancos ajustables', 'señalizacion postural'], 'REBA', 2, 5, 8, true, 8),
('FR-POST-ROT', 'Rotación forzada de tronco', 'Posturas con rotación de tronco combinada con carga', 'fisico', 'postura', ARRAY['dolor lumbar', 'contractura'], ARRAY['lumbalgia', 'ciática'], ARRAY['rediseño proceso', 'formación postural'], 'REBA', 2, 5, 8, true, 7),
('FR-POST-CUELLO', 'Postura forzada de cuello', 'Flexión o extensión forzada del cuello', 'fisico', 'postura', ARRAY['dolor cervical', 'cefalea'], ARRAY['cervicalgia', 'síndrome de dolor miofascial'], ARRAY['ajuste altura monitor', 'soporte documentos'], 'REBA', 2, 4, 7, true, 7),

-- Movimientos repetitivos
('FR-MOV-REP-MS', 'Movimientos repetitivos miembro superior', 'Movimientos repetitivos de manos/muñecas >4h/día', 'fisico', 'movimiento', ARRAY['dolor muñeca', 'entumecimiento', 'debilidad'], ARRAY['tunel carpiano', 'tendinitis', 'tenosinovitis'], ARRAY['pausas activas', 'rotación tareas', 'herramientas ergonómicas'], 'OSHA', 3, 6, 9, true, 9),
('FR-MOV-REP-MI', 'Movimientos repetitivos miembro inferior', 'Movimientos repetitivos de piernas/pies', 'fisico', 'movimiento', ARRAY['dolor rodilla', 'fatiga piernas'], ARRAY['tendinitis rotuliana', 'síndrome tibial'], ARRAY['alfombras antifatiga', 'calzado apropiado'], 'OWAS', 2, 4, 6, false, 5),

-- Manejo manual de cargas
('FR-CARGA-PESO', 'Manejo de cargas pesadas', 'Levantamiento de cargas >25 kg', 'fisico', 'carga', ARRAY['dolor lumbar', 'agotamiento'], ARRAY['hernia discal', 'lumbalgia aguda'], ARRAY['ayudas mecánicas', 'división cargas'], 'NIOSH', 1, 2, 3, true, 9),
('FR-CARGA-FREC', 'Manejo frecuente de cargas', 'Levantamiento frecuente >1 vez/min', 'fisico', 'carga', ARRAY['fatiga muscular', 'dolor'], ARRAY['tendinitis', 'bursitis'], ARRAY['reducción frecuencia', 'automatización'], 'NIOSH', 2, 4, 6, true, 7),
('FR-CARGA-POST', 'Manejo de cargas en postura forzada', 'Levantamiento con flexión/torsión', 'fisico', 'carga', ARRAY['dolor agudo lumbar'], ARRAY['hernia discal', 'esguince'], ARRAY['técnicas de levantamiento', 'espacios adecuados'], 'NIOSH', 1, 2, 3, true, 10),

-- Factores ambientales
('FR-AMB-LUZ', 'Iluminación inadecuada', 'Niveles de iluminación fuera de norma', 'fisico', 'ambiental', ARRAY['cefalea', 'fatiga visual', 'ojos rojos'], ARRAY['astenopia', 'errores visuales'], ARRAY['ajuste iluminación', 'reducción reflejos'], 'MANUAL', 3, 5, 7, true, 6),
('FR-AMB-RUID', 'Exposición a ruido', 'Niveles de ruido >85 dB', 'fisico', 'ambiental', ARRAY['acúfenos', 'dolor cabeza'], ARRAY['hipoacusia', 'estres'], ARRAY['control ingeniería', 'EPP auditivo'], 'MANUAL', 2, 4, 6, true, 8),
('FR-AMB-TEMP', 'Temperatura extrema', 'Exposición a calor >35°C o frío <10°C', 'fisico', 'ambiental', ARRAY['malestar general', 'deshidratación', 'escalofríos'], ARRAY['golpe calor', 'hipotermia'], ARRAY['climatización', 'pausas recuperación'], 'MANUAL', 2, 4, 6, true, 7),
('FR-AMB-VIB', 'Exposición a vibración', 'Uso de herramientas vibratorias', 'fisico', 'ambiental', ARRAY['entumecimiento manos', 'blancura dedos'], ARRAY['síndrome vibración mano-brazo', 'enfermedad raynaud'], ARRAY['herramientas antivibratorias', 'limitación exposición'], 'MANUAL', 2, 4, 6, true, 8),

-- Factores organizacionales
('FR-ORG-RIT', 'Ritmo de trabajo excesivo', 'Imposibilidad de controlar ritmo', 'organizacional', 'carga_trabajo', ARRAY['ansiedad', 'fatiga crónica'], ARRAY['burnout', 'estres laboral'], ARRAY['rediseño tareas', 'participación trabajadores'], 'MANUAL', 3, 5, 7, true, 6),
('FR-ORG-PAUS', 'Pausas insuficientes', 'Pausas <10% de jornada o inadecuadas', 'organizacional', 'carga_trabajo', ARRAY['fatiga', 'dolor muscular'], ARRAY['lesiones acumulativas', 'agotamiento'], ARRAY['pausas activas programadas', 'gimnasia laboral'], 'MANUAL', 3, 5, 7, true, 6),
('FR-ORG-JORN', 'Jornadas excesivas', 'Jornadas >48h/semana o turnos largos', 'organizacional', 'carga_trabajo', ARRAY['fatiga crónica', 'insomnio'], ARRAY['trastorno sueno', 'burnout'], ARRAY['reducción jornada', 'descansos compensatorios'], 'MANUAL', 3, 5, 7, true, 7),
('FR-ORG-TURN', 'Trabajo por turnos', 'Rotación de turnos no favorable', 'organizacional', 'carga_trabajo', ARRAY['alteración sueño', 'fatiga'], ARRAY['trastorno ritmo sueño'], ARRAY['rotación favorable', 'iluminación adecuada'], 'MANUAL', 3, 5, 6, true, 5),

-- Factores cognitivos/psicosociales
('FR-PSI-MON', 'Monotonía del trabajo', 'Tareas repetitivas sin variación', 'psicosocial', 'carga_mental', ARRAY['aburrimiento', 'desmotivación'], ARRAY['estres', 'presentismo'], ARRAY['enriquecimiento puesto', 'rotación tareas'], 'MANUAL', 3, 5, 7, false, 4),
('FR-PSI-ATEN', 'Sobrecarga atencional', 'Requerimiento atención sostenida', 'psicosocial', 'carga_mental', ARRAY['cefalea', 'fatiga mental'], ARRAY['estres', 'ansiedad'], ARRAY['pausas recuperación', 'automatización'], 'MANUAL', 3, 5, 7, false, 5)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE programas_ergonomia IS 'Programas anuales de ergonomía según NOM-036';
COMMENT ON TABLE evaluaciones_ergonomicas IS 'Evaluaciones ergonómicas con métodos REBA, NIOSH, OWAS, etc.';
COMMENT ON TABLE capacitaciones_ergonomia IS 'Capacitaciones en ergonomía impartidas';
COMMENT ON TABLE factores_riesgo_ergonomico_catalogo IS 'Catálogo de factores de riesgo ergonómico según NOM-036';
COMMENT ON FUNCTION calcular_reba IS 'Calcula el índice REBA para evaluación de posturas';
COMMENT ON FUNCTION calcular_niosh IS 'Calcula el índice de levantamiento NIOSH';
COMMENT ON FUNCTION calcular_owas IS 'Calcula el score OWAS para posturas de trabajo';
