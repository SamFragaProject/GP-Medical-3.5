-- =====================================================
-- MIGRACIÓN: Sistema de Dictámenes Médico-Laborales
-- GPMedical ERP Pro - Fundamentos Legales
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. CATÁLOGO DE RESTRICCIONES MÉDICAS
-- =====================================================

CREATE TABLE IF NOT EXISTS restricciones_medicas_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta VARCHAR(100) NOT NULL,
    tipo_restriccion VARCHAR(50) NOT NULL, -- 'fisica', 'quimica', 'biologica', 'psicosocial', 'ambiental'
    puestos_aplicables TEXT[] DEFAULT '{}',
    riesgos_relacionados TEXT[] DEFAULT '{}',
    duracion_default_dias INTEGER,
    requiere_revision BOOLEAN DEFAULT false,
    prioridad INTEGER DEFAULT 5,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_restricciones_codigo ON restricciones_medicas_catalogo(codigo);
CREATE INDEX IF NOT EXISTS idx_restricciones_tipo ON restricciones_medicas_catalogo(tipo_restriccion);
CREATE INDEX IF NOT EXISTS idx_restricciones_activo ON restricciones_medicas_catalogo(activo);

-- =====================================================
-- 2. TABLA PRINCIPAL: DICTÁMENES MÉDICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS dictamenes_medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación
    folio VARCHAR(50) UNIQUE NOT NULL,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    
    -- Paciente y Expediente
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE SET NULL,
    
    -- Tipo y Contexto de Evaluación
    tipo_evaluacion VARCHAR(20) NOT NULL CHECK (tipo_evaluacion IN ('ingreso', 'periodico', 'retorno', 'egreso', 'reubicacion')),
    motivo_evaluacion TEXT,
    
    -- Resultado del Dictamen
    resultado VARCHAR(30) NOT NULL CHECK (resultado IN ('apto', 'apto_restricciones', 'no_apto_temporal', 'no_apto')),
    resultado_detalle TEXT,
    
    -- Restricciones (Array de códigos del catálogo)
    restricciones JSONB DEFAULT '[]'::jsonb,
    restricciones_otras TEXT,
    
    -- Recomendaciones
    recomendaciones_medicas TEXT[] DEFAULT '{}',
    recomendaciones_epp TEXT[] DEFAULT '{}',
    recomendaciones_adicionales TEXT,
    
    -- Vigencia del Dictamen
    vigencia_inicio DATE NOT NULL,
    vigencia_fin DATE,
    duracion_dias INTEGER,
    
    -- Médico Responsable
    medico_responsable_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    medico_nombre VARCHAR(200),
    cedula_profesional VARCHAR(50),
    especialidad_medico VARCHAR(100),
    firma_digital_url TEXT,
    
    -- Validación de Estudios
    estudios_requeridos_completos BOOLEAN DEFAULT false,
    estudios_faltantes TEXT[] DEFAULT '{}',
    bloqueos_pendientes JSONB DEFAULT '{}'::jsonb,
    
    -- Estado y Control de Versiones
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente', 'completado', 'anulado', 'vencido')),
    version INTEGER DEFAULT 1,
    es_version_final BOOLEAN DEFAULT false,
    
    -- Motivo de No Aptitud (si aplica)
    motivo_no_apto TEXT,
    cie10_no_apto VARCHAR(10),
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cerrado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    fecha_cierre TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para dictámenes
CREATE INDEX IF NOT EXISTS idx_dictamenes_empresa ON dictamenes_medicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_dictamenes_paciente ON dictamenes_medicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_dictamenes_expediente ON dictamenes_medicos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_dictamenes_tipo ON dictamenes_medicos(tipo_evaluacion);
CREATE INDEX IF NOT EXISTS idx_dictamenes_resultado ON dictamenes_medicos(resultado);
CREATE INDEX IF NOT EXISTS idx_dictamenes_estado ON dictamenes_medicos(estado);
CREATE INDEX IF NOT EXISTS idx_dictamenes_vigencia ON dictamenes_medicos(vigencia_inicio, vigencia_fin);
CREATE INDEX IF NOT EXISTS idx_dictamenes_medico ON dictamenes_medicos(medico_responsable_id);
CREATE INDEX IF NOT EXISTS idx_dictamenes_folio ON dictamenes_medicos(folio);

-- =====================================================
-- 3. TABLA DE VERSIONES (AUDITORÍA LEGAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS versiones_dictamen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dictamen_id UUID NOT NULL REFERENCES dictamenes_medicos(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    
    -- Snapshot de datos
    datos_json JSONB NOT NULL,
    cambios_realizados JSONB NOT NULL,
    
    -- Motivo del cambio
    tipo_cambio VARCHAR(30) NOT NULL, -- 'correccion', 'actualizacion', 'revision', 'anulacion'
    motivo_cambio TEXT,
    
    -- Usuario que realizó el cambio
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(200),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versiones_dictamen ON versiones_dictamen(dictamen_id);
CREATE INDEX IF NOT EXISTS idx_versiones_numero ON versiones_dictamen(version);

-- =====================================================
-- 4. TABLA DE ESTUDIOS REQUERIDOS POR DICTAMEN
-- =====================================================

CREATE TABLE IF NOT EXISTS dictamen_estudios_requeridos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dictamen_id UUID NOT NULL REFERENCES dictamenes_medicos(id) ON DELETE CASCADE,
    
    tipo_estudio VARCHAR(50) NOT NULL, -- 'audiometria', 'espirometria', 'laboratorio', 'rx', 'vision', 'ecg', 'otros'
    subtipo VARCHAR(50),
    descripcion TEXT,
    
    -- Estado
    obligatorio BOOLEAN DEFAULT true,
    completado BOOLEAN DEFAULT false,
    estudio_id UUID, -- Referencia al estudio real cuando se completa
    
    -- Resultado
    resultado_semaforo VARCHAR(10) CHECK (resultado_semaforo IN ('verde', 'amarillo', 'rojo')),
    observaciones TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dictamen_estudios_dictamen ON dictamen_estudios_requeridos(dictamen_id);
CREATE INDEX IF NOT EXISTS idx_dictamen_estudios_tipo ON dictamen_estudios_requeridos(tipo_estudio);

-- =====================================================
-- 5. FUNCIÓN PARA GENERAR FOLIO DE DICTAMEN
-- =====================================================

CREATE OR REPLACE FUNCTION generar_folio_dictamen()
RETURNS TRIGGER AS $$
DECLARE
    v_empresa_codigo VARCHAR(10);
    v_anio INTEGER;
    v_consecutivo INTEGER;
    v_nuevo_folio VARCHAR(50);
BEGIN
    -- Obtener código corto de la empresa (primeras 3 letras del nombre)
    SELECT UPPER(LEFT(nombre, 3)) INTO v_empresa_codigo 
    FROM empresas WHERE id = NEW.empresa_id;
    
    v_anio := EXTRACT(YEAR FROM NEW.created_at);
    
    -- Obtener consecutivo del año
    SELECT COUNT(*) + 1 INTO v_consecutivo
    FROM dictamenes_medicos
    WHERE empresa_id = NEW.empresa_id 
    AND EXTRACT(YEAR FROM created_at) = v_anio;
    
    v_nuevo_folio := v_empresa_codigo || '-' || v_anio || '-' || LPAD(v_consecutivo::TEXT, 5, '0');
    
    NEW.folio := v_nuevo_folio;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generar_folio_dictamen ON dictamenes_medicos;
CREATE TRIGGER tr_generar_folio_dictamen
    BEFORE INSERT ON dictamenes_medicos
    FOR EACH ROW
    EXECUTE FUNCTION generar_folio_dictamen();

-- =====================================================
-- 6. FUNCIÓN PARA CREAR VERSIÓN EN AUDITORÍA
-- =====================================================

CREATE OR REPLACE FUNCTION crear_version_dictamen()
RETURNS TRIGGER AS $$
DECLARE
    v_cambios JSONB;
BEGIN
    -- Solo crear versión si hay cambios significativos
    IF OLD.estado = NEW.estado AND OLD.resultado = NEW.resultado THEN
        RETURN NEW;
    END IF;
    
    -- Detectar cambios
    v_cambios := jsonb_build_object(
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado,
        'resultado_anterior', OLD.resultado,
        'resultado_nuevo', NEW.resultado,
        'restricciones_anterior', OLD.restricciones,
        'restricciones_nuevo', NEW.restricciones
    );
    
    -- Incrementar versión
    NEW.version := OLD.version + 1;
    
    -- Guardar versión anterior
    INSERT INTO versiones_dictamen (
        dictamen_id,
        version,
        datos_json,
        cambios_realizados,
        tipo_cambio,
        usuario_id,
        created_at
    ) VALUES (
        OLD.id,
        OLD.version,
        to_jsonb(OLD),
        v_cambios,
        CASE 
            WHEN OLD.resultado != NEW.resultado THEN 'actualizacion'
            WHEN OLD.estado = 'completado' THEN 'correccion'
            ELSE 'revision'
        END,
        NEW.updated_by,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_crear_version_dictamen ON dictamenes_medicos;
CREATE TRIGGER tr_crear_version_dictamen
    BEFORE UPDATE ON dictamenes_medicos
    FOR EACH ROW
    WHEN (OLD.estado IS DISTINCT FROM NEW.estado OR OLD.resultado IS DISTINCT FROM NEW.resultado)
    EXECUTE FUNCTION crear_version_dictamen();

-- =====================================================
-- 7. FUNCIÓN PARA VALIDAR CIERRE DE DICTAMEN
-- =====================================================

CREATE OR REPLACE FUNCTION validar_cierre_dictamen(p_dictamen_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_dictamen RECORD;
    v_estudios_faltantes INTEGER;
    v_bloqueos JSONB;
    v_resultado JSONB;
BEGIN
    -- Obtener dictamen
    SELECT * INTO v_dictamen FROM dictamenes_medicos WHERE id = p_dictamen_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valido', false,
            'error', 'Dictamen no encontrado'
        );
    END IF;
    
    -- Verificar estudios obligatorios faltantes
    SELECT COUNT(*) INTO v_estudios_faltantes
    FROM dictamen_estudios_requeridos
    WHERE dictamen_id = p_dictamen_id AND obligatorio = true AND completado = false;
    
    -- Construir bloqueos
    v_bloqueos := '[]'::jsonb;
    
    IF v_estudios_faltantes > 0 THEN
        v_bloqueos := v_bloqueos || jsonb_build_object(
            'tipo', 'estudios_incompletos',
            'mensaje', v_estudios_faltantes || ' estudios obligatorios pendientes',
            'severidad', 'alta'
        );
    END IF;
    
    IF v_dictamen.medico_responsable_id IS NULL THEN
        v_bloqueos := v_bloqueos || jsonb_build_object(
            'tipo', 'medico_no_asignado',
            'mensaje', 'No hay médico responsable asignado',
            'severidad', 'critica'
        );
    END IF;
    
    IF v_dictamen.firma_digital_url IS NULL THEN
        v_bloqueos := v_bloqueos || jsonb_build_object(
            'tipo', 'firma_pendiente',
            'mensaje', 'Dictamen sin firma digital',
            'severidad', 'media'
        );
    END IF;
    
    -- Determinar si es válido
    v_resultado := jsonb_build_object(
        'valido', jsonb_array_length(v_bloqueos) = 0 OR (
            SELECT NOT EXISTS (
                SELECT 1 FROM jsonb_array_elements(v_bloqueos) AS b 
                WHERE b->>'severidad' = 'critica'
            )
        ),
        'estudios_faltantes', v_estudios_faltantes,
        'bloqueos', v_bloqueos,
        'puede_forzar', jsonb_array_length(v_bloqueos) > 0 AND NOT (
            SELECT EXISTS (
                SELECT 1 FROM jsonb_array_elements(v_bloqueos) AS b 
                WHERE b->>'severidad' = 'critica'
            )
        )
    );
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE dictamenes_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restricciones_medicas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE versiones_dictamen ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictamen_estudios_requeridos ENABLE ROW LEVEL SECURITY;

-- Política: Ver dictámenes de mi empresa
CREATE POLICY dictamenes_select ON dictamenes_medicos
    FOR SELECT USING (
        empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

-- Política: Crear dictámenes (médicos y admin)
CREATE POLICY dictamenes_insert ON dictamenes_medicos
    FOR INSERT WITH CHECK (
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

-- Política: Actualizar dictámenes (solo médicos y admin de la empresa)
CREATE POLICY dictamenes_update ON dictamenes_medicos
    FOR UPDATE USING (
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

-- Política: Eliminar dictámenes (solo super_admin)
CREATE POLICY dictamenes_delete ON dictamenes_medicos
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

-- Políticas para catálogo de restricciones (solo lectura para usuarios)
CREATE POLICY restricciones_select ON restricciones_medicas_catalogo
    FOR SELECT USING (activo = true);

CREATE POLICY restricciones_admin ON restricciones_medicas_catalogo
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

-- Políticas para versiones (mismas que dictámenes)
CREATE POLICY versiones_select ON versiones_dictamen
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dictamenes_medicos d
            WHERE d.id = versiones_dictamen.dictamen_id
            AND d.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

-- Políticas para estudios requeridos
CREATE POLICY dictamen_estudios_select ON dictamen_estudios_requeridos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dictamenes_medicos d
            WHERE d.id = dictamen_estudios_requeridos.dictamen_id
            AND d.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'super_admin')
    );

CREATE POLICY dictamen_estudios_all ON dictamen_estudios_requeridos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM dictamenes_medicos d
            WHERE d.id = dictamen_estudios_requeridos.dictamen_id
            AND d.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
        )
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('medico', 'admin_empresa', 'super_admin'))
        )
    );

-- =====================================================
-- 9. DATOS INICIALES: CATÁLOGO DE RESTRICCIONES
-- =====================================================

INSERT INTO restricciones_medicas_catalogo (codigo, descripcion, descripcion_corta, tipo_restriccion, puestos_aplicables, duracion_default_dias, prioridad, activo) VALUES
-- Restricciones físicas
('RES-ALTURA', 'No trabajar en alturas mayores a 1.5 metros', 'Restricción de altura', 'fisica', ARRAY['albañil', 'electricista', 'mantenimiento', 'construccion'], 180, 8, true),
('RES-PESO-10', 'No levantar cargas mayores a 10 kg', 'Límite carga 10 kg', 'fisica', ARRAY['operario', 'almacenista', 'mozo', 'cargador'], 90, 6, true),
('RES-PESO-5', 'No levantar cargas mayores a 5 kg', 'Límite carga 5 kg', 'fisica', ARRAY['operario', 'almacenista', 'secretaria', 'recepcionista'], 90, 7, true),
('RES-SENTADO', 'Trabajo sedentario exclusivamente', 'Trabajo sedentario', 'fisica', ARRAY['oficinista', 'secretaria', 'recepcionista', 'analista'], 180, 5, true),
('RES-DEPIE', 'No permanecer de pie más de 2 horas continuas', 'Límite tiempo de pie', 'fisica', ARRAY['cajero', 'vigilante', 'recepcionista', 'operario'], 90, 6, true),
('RES-FLEX', 'No realizar flexiones ni rotaciones de tronco', 'Restricción flexión tronco', 'fisica', ARRAY['almacenista', 'mozo', 'cargador', 'construccion'], 120, 7, true),

-- Restricciones visuales
('RES-VIS-NOCT', 'No trabajo nocturno', 'Restricción trabajo nocturno', 'fisica', ARRAY['chofer', 'vigilante', 'operador', 'maquinista'], 365, 9, true),
('RES-VIS-MAQ', 'No operar maquinaria móvil', 'No operar maquinaria', 'fisica', ARRAY['chofer', 'operador', 'maquinista', 'montacarguista'], 180, 9, true),

-- Restricciones auditivas
('RES-AUD-85', 'No exponerse a ruido >85 dB', 'Límite exposición ruido', 'fisica', ARRAY['operario', 'maquinista', 'mantenimiento'], 365, 8, true),
('RES-AUD-EPP', 'Uso obligatorio de EPP auditivo', 'EPP auditivo obligatorio', 'fisica', ARRAY['operario', 'maquinista', 'mantenimiento'], 365, 7, true),

-- Restricciones químicas
('RES-QUIM-SOL', 'No manipular solventes orgánicos', 'No solventes orgánicos', 'quimica', ARRAY['pintor', 'limpieza', 'mantenimiento', 'laboratorista'], 180, 8, true),
('RES-QUIM-PLO', 'No manipular plomo ni derivados', 'No exposición plomo', 'quimica', ARRAY['soldador', 'pintor', 'baterista', 'fundidor'], 365, 10, true),
('RES-QUIM-MER', 'No manipular mercurio', 'No mercurio', 'quimica', ARRAY['odontologo', 'laboratorista', 'minero'], 365, 10, true),
('RES-QUIM-ASB', 'No exposición a asbestos', 'No asbestos', 'quimica', ARRAY['construccion', 'demolicion', 'mantenimiento'], 365, 10, true),

-- Restricciones biológicas
('RES-BIO-PAT', 'No exposición a patógenos', 'No patógenos', 'biologica', ARRAY['enfermera', 'medico', 'laboratorista', 'limpieza'], 90, 8, true),
('RES-BIO-ANI', 'No manipular animales', 'No animales', 'biologica', ARRAY['veterinario', 'agricultor', 'investigador'], 90, 6, true),

-- Restricciones psicosociales
('RES-PSI-TUR', 'No rotación de turnos', 'Sin rotación turnos', 'psicosocial', ARRAY['operario', 'vigilante', 'enfermera'], 180, 5, true),
('RES-PSI-NOC', 'No trabajo nocturno', 'Sin trabajo nocturno', 'psicosocial', ARRAY['vigilante', 'operario', 'enfermera'], 180, 6, true),
('RES-PSI-EST', 'No exposición a situaciones de alto estrés', 'Sin alto estrés', 'psicosocial', ARRAY['seguridad', 'supervisor', 'ejecutivo'], 90, 4, true),

-- Restricciones ambientales
('RES-AMB-CAL', 'No exposición a calor extremo', 'Sin calor extremo', 'ambiental', ARRAY['soldador', 'hornero', 'fundidor', 'cocinero'], 90, 6, true),
('RES-AMB-FRI', 'No exposición a frío extremo', 'Sin frío extremo', 'ambiental', ARRAY['refrigeracion', 'almacen_frio', 'camara_frio'], 90, 6, true),
('RES-AMB-VIB', 'No exposición a vibración', 'Sin vibración', 'ambiental', ARRAY['operador', 'chofer', 'martillero'], 180, 7, true)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE dictamenes_medicos IS 'Dictámenes médico-laborales con validez legal';
COMMENT ON TABLE restricciones_medicas_catalogo IS 'Catálogo de restricciones médicas codificadas';
COMMENT ON TABLE versiones_dictamen IS 'Historial de cambios de dictámenes para auditoría legal';
COMMENT ON TABLE dictamen_estudios_requeridos IS 'Estudios requeridos para completar un dictamen';
