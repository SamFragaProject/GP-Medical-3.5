-- =====================================================
-- GPMedical ERP Pro - Fase 1: Clinical Core
-- Migración: Esquema completo de expediente clínico
-- =====================================================

-- =====================================================
-- 1. EXPEDIENTES CLÍNICOS ELECTRÓNICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS expedientes_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id),
    sede_id UUID REFERENCES sedes(id),
    
    -- Apertura y cierre
    fecha_apertura DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_cierre DATE,
    
    -- Estado del expediente
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'archivado')),
    
    -- Campos clínicos resumen (para búsquedas rápidas)
    alergias TEXT,
    tipo_sangre VARCHAR(10),
    
    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    updated_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_expedientes_paciente ON expedientes_clinicos(paciente_id);
CREATE INDEX idx_expedientes_empresa ON expedientes_clinicos(empresa_id);
CREATE INDEX idx_expedientes_estado ON expedientes_clinicos(estado);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expedientes_updated_at
    BEFORE UPDATE ON expedientes_clinicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ANTECEDENTES PERSONALES NO PATOLÓGICOS (APNP)
-- =====================================================

CREATE TABLE IF NOT EXISTS apnp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    
    -- Hábitos
    tabaco BOOLEAN DEFAULT FALSE,
    tabaco_cantidad VARCHAR(50),
    tabaco_tiempo VARCHAR(50),
    tabaco_frecuencia VARCHAR(50),
    
    alcohol BOOLEAN DEFAULT FALSE,
    alcohol_frecuencia VARCHAR(50),
    alcohol_cantidad VARCHAR(50),
    
    drogas BOOLEAN DEFAULT FALSE,
    drogas_tipo TEXT,
    drogas_frecuencia VARCHAR(50),
    
    -- Medicamentos
    medicamentos_habitual TEXT,
    
    -- Estilo de vida
    ejercicio_frecuencia VARCHAR(50),
    ejercicio_tipo TEXT,
    
    sueno_horas INTEGER,
    sueno_calidad VARCHAR(50),
    
    alimentacion_tipo VARCHAR(50),
    
    -- Otros
    cafe BOOLEAN DEFAULT FALSE,
    cafe_tazas_diarias INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_apnp_expediente ON apnp(expediente_id);

-- =====================================================
-- 3. ANTECEDENTES HEREDOFAMILIARES (AHF)
-- =====================================================

CREATE TABLE IF NOT EXISTS ahf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    
    -- Diabetes
    diabetes BOOLEAN DEFAULT FALSE,
    diabetes_quien TEXT,
    
    -- Hipertensión
    hipertension BOOLEAN DEFAULT FALSE,
    hipertension_quien TEXT,
    
    -- Cáncer
    cancer BOOLEAN DEFAULT FALSE,
    cancer_tipo TEXT,
    cancer_quien TEXT,
    
    -- Cardiopatías
    cardiopatias BOOLEAN DEFAULT FALSE,
    cardiopatias_quien TEXT,
    
    -- Enfermedades mentales/neurológicas
    enfermedades_mentales BOOLEAN DEFAULT FALSE,
    enfermedades_mentales_quien TEXT,
    
    -- Enfermedades respiratorias
    enfermedades_respiratorias BOOLEAN DEFAULT FALSE,
    enfermedades_respiratorias_quien TEXT,
    
    -- Otros
    otros TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ahf_expediente ON ahf(expediente_id);

-- =====================================================
-- 4. HISTORIA OCUPACIONAL
-- =====================================================

CREATE TABLE IF NOT EXISTS historia_ocupacional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    
    -- Datos del empleo anterior
    empresa_anterior VARCHAR(200),
    puesto VARCHAR(200),
    antiguedad VARCHAR(100),
    fecha_inicio DATE,
    fecha_fin DATE,
    
    -- Riesgos en ese puesto
    riesgos_fisicos TEXT,
    riesgos_quimicos TEXT,
    riesgos_biologicos TEXT,
    riesgos_ergonomicos TEXT,
    riesgos_psicosociales TEXT,
    riesgos_electricos BOOLEAN DEFAULT FALSE,
    riesgos_mecanicos BOOLEAN DEFAULT FALSE,
    
    -- Exposiciones
    exposiciones TEXT,
    
    -- EPP
    epp_utilizado TEXT,
    epp_adecuado BOOLEAN,
    
    -- Incidentes
    accidentes_laborales TEXT,
    enfermedades_laborales TEXT,
    incapacidades TEXT,
    
    -- Motivo de separación
    motivo_separacion VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historia_ocupacional_expediente ON historia_ocupacional(expediente_id);

-- =====================================================
-- 5. EXPLORACIÓN FÍSICA ESTRUCTURADA
-- =====================================================

CREATE TABLE IF NOT EXISTS exploracion_fisica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    consulta_id UUID,
    
    -- Fecha
    fecha_exploracion TIMESTAMP DEFAULT NOW(),
    
    -- Signos Vitales
    fc INTEGER,
    fr INTEGER,
    ta_sistolica INTEGER,
    ta_diastolica INTEGER,
    temperatura DECIMAL(4,2),
    spo2 INTEGER,
    glucosa INTEGER,
    
    -- Antropometría
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    imc DECIMAL(5,2),
    cintura_cm DECIMAL(5,2),
    cadera_cm DECIMAL(5,2),
    icc DECIMAL(4,2),
    
    -- Exploración sistemática
    aspecto_general TEXT,
    estado_general VARCHAR(50),
    
    -- Cabeza
    piel TEXT,
    cabeza TEXT,
    ojos TEXT,
    oidos TEXT,
    nariz TEXT,
    boca TEXT,
    cuello TEXT,
    
    -- Tórax
    torax TEXT,
    pulmones TEXT,
    corazon TEXT,
    
    -- Abdomen
    abdomen TEXT,
    
    -- Extremidades
    extremidades_superiores TEXT,
    extremidades_inferiores TEXT,
    
    -- Neurológico
    neurologico TEXT,
    reflejos TEXT,
    coordinacion TEXT,
    marcha TEXT,
    
    -- Mental
    estado_mental TEXT,
    orientacion TEXT,
    lenguaje TEXT,
    memoria TEXT,
    
    -- Otros sistemas
    genitourinario TEXT,
    osteomuscular_detalle TEXT,
    
    -- Hallazgos relevantes
    hallazgos_relevantes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exploracion_expediente ON exploracion_fisica(expediente_id);

-- =====================================================
-- 6. CONSENTIMIENTOS INFORMADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS consentimientos_informados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id),
    
    tipo VARCHAR(100) NOT NULL, -- 'prestacion_servicios', 'manejo_datos', 'menores', 'imagenes'
    
    -- Contenido
    titulo VARCHAR(200),
    contenido TEXT,
    version VARCHAR(10) DEFAULT '1.0',
    
    -- Firma
    firmado BOOLEAN DEFAULT FALSE,
    fecha_firma TIMESTAMP,
    firma_digital_url TEXT,
    firma_digital_data TEXT, -- SVG o base64 de la firma
    
    -- Datos del firmante
    firmante_nombre VARCHAR(200),
    firmante_parentesco VARCHAR(100),
    firmante_telefono VARCHAR(20),
    
    -- Testigo (opcional)
    testigo_nombre VARCHAR(200),
    testigo_firma_url TEXT,
    
    -- Medico que obtiene consentimiento
    medico_id UUID REFERENCES usuarios(id),
    
    -- IP y metadata para validez legal
    ip_firma INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consentimientos_expediente ON consentimientos_informados(expediente_id);
CREATE INDEX idx_consentimientos_paciente ON consentimientos_informados(paciente_id);

-- =====================================================
-- 7. CATÁLOGO CIE-10
-- =====================================================

CREATE TABLE IF NOT EXISTS catalogo_cie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    capitulo VARCHAR(100),
    grupo VARCHAR(100),
    categoria VARCHAR(100),
    
    -- Para ordenamiento
    es_favorito BOOLEAN DEFAULT FALSE,
    frecuencia_uso INTEGER DEFAULT 0,
    
    -- Indicadores de uso en medicina laboral
    es_preempleo BOOLEAN DEFAULT FALSE,
    es_periodico BOOLEAN DEFAULT FALSE,
    es_retorno BOOLEAN DEFAULT FALSE,
    es_egreso BOOLEAN DEFAULT FALSE,
    
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar CIE-10 relevantes para medicina del trabajo
INSERT INTO catalogo_cie (codigo, descripcion, capitulo, es_preempleo, es_periodico) VALUES
('Z02.0', 'Examen médico para admisión a instituciones educativas', 'Capítulo XXI', TRUE, FALSE),
('Z02.1', 'Examen médico para admisión a instituciones laborales', 'Capítulo XXI', TRUE, FALSE),
('Z02.2', 'Examen médico para admisión a instituciones penitenciarias', 'Capítulo XXI', TRUE, FALSE),
('Z02.3', 'Examen médico para adopción', 'Capítulo XXI', FALSE, FALSE),
('Z02.4', 'Examen médico para admisión a instituciones de tercera edad', 'Capítulo XXI', FALSE, FALSE),
('Z02.5', 'Examen médico para admisión a instituciones de salud mental', 'Capítulo XXI', FALSE, FALSE),
('Z02.6', 'Examen médico para fines de seguro', 'Capítulo XXI', FALSE, FALSE),
('Z02.7', 'Examen médico para fines de licencia de conducir', 'Capítulo XXI', TRUE, FALSE),
('Z02.8', 'Examen médico para otros fines administrativos', 'Capítulo XXI', FALSE, FALSE),
('Z02.9', 'Examen médico para fines no especificados', 'Capítulo XXI', FALSE, FALSE),
('Z10.0', 'Examen de salud ocupacional', 'Capítulo XXI', FALSE, TRUE),
('Z10.1', 'Examen de salud ocupacional por trabajos con riesgo de tuberculosis', 'Capítulo XXI', FALSE, TRUE),
('Z10.2', 'Examen de salud ocupacional por trabajos con riesgo de enfermedades virales', 'Capítulo XXI', FALSE, TRUE),
('Z10.3', 'Examen de salud ocupacional por trabajos con riesgo de enfermedades bacterianas', 'Capítulo XXI', FALSE, TRUE),
('Z10.8', 'Otros exámenes de salud ocupacional especificados', 'Capítulo XXI', FALSE, TRUE),
('Z10.9', 'Examen de salud ocupacional no especificado', 'Capítulo XXI', FALSE, TRUE),
('Z56.0', 'Problemas relacionados con el desempleo', 'Capítulo XXI', FALSE, FALSE),
('Z56.1', 'Problemas relacionados con el cambio de trabajo', 'Capítulo XXI', FALSE, FALSE),
('Z56.2', 'Problemas relacionados con amenaza de pérdida de empleo', 'Capítulo XXI', FALSE, FALSE),
('Z56.3', 'Problemas relacionados con tensión laboral', 'Capítulo XXI', FALSE, FALSE),
('Z56.4', 'Problemas relacionados con discordancia con jefe y compañeros', 'Capítulo XXI', FALSE, FALSE),
('Z56.5', 'Problemas relacionados con horario de trabajo inconveniente', 'Capítulo XXI', FALSE, FALSE),
('Z56.6', 'Problemas relacionados con otros problemas físicos y mentales relacionados con el trabajo', 'Capítulo XXI', FALSE, FALSE),
('Z56.8', 'Otros problemas relacionados con el empleo', 'Capítulo XXI', FALSE, FALSE),
('Z56.9', 'Problema relacionado con el empleo no especificado', 'Capítulo XXI', FALSE, FALSE),
('Z57.0', 'Exposición ocupacional al ruido', 'Capítulo XXI', FALSE, TRUE),
('Z57.1', 'Exposición ocupacional a la radiación', 'Capítulo XXI', FALSE, TRUE),
('Z57.2', 'Exposición ocupacional al polvo', 'Capítulo XXI', FALSE, TRUE),
('Z57.3', 'Exposición ocupacional a otros contaminantes del aire', 'Capítulo XXI', FALSE, TRUE),
('Z57.4', 'Exposición ocupacional a agentes tóxicos en la agricultura', 'Capítulo XXI', FALSE, TRUE),
('Z57.5', 'Exposición ocupacional a agentes tóxicos en otros trabajos', 'Capítulo XXI', FALSE, TRUE),
('Z57.6', 'Exposición ocupacional a temperaturas extremas', 'Capítulo XXI', FALSE, TRUE),
('Z57.7', 'Exposición ocupacional a la vibración', 'Capítulo XXI', FALSE, TRUE),
('Z57.8', 'Exposición ocupacional a otros riesgos', 'Capítulo XXI', FALSE, TRUE),
('Z57.9', 'Exposición ocupacional a riesgo no especificado', 'Capítulo XXI', FALSE, TRUE),
('Z58.0', 'Problemas relacionados con exposición al ruido', 'Capítulo XXI', FALSE, FALSE),
('Z58.1', 'Problemas relacionados con exposición a la contaminación del aire', 'Capítulo XXI', FALSE, FALSE),
('Z58.2', 'Problemas relacionados con exposición a la contaminación del agua', 'Capítulo XXI', FALSE, FALSE),
('Z58.3', 'Problemas relacionados con exposición a la contaminación del suelo', 'Capítulo XXI', FALSE, FALSE),
('Z58.4', 'Problemas relacionados con exposición a la radiación', 'Capítulo XXI', FALSE, FALSE),
('Z58.5', 'Problemas relacionados con exposición a otros contaminantes ambientales', 'Capítulo XXI', FALSE, FALSE),
('Z58.6', 'Inadecuación del suministro de agua potable', 'Capítulo XXI', FALSE, FALSE),
('Z58.7', 'Exposición a desastres naturales', 'Capítulo XXI', FALSE, FALSE),
('Z58.8', 'Otros problemas relacionados con el ambiente físico', 'Capítulo XXI', FALSE, FALSE),
('Z58.9', 'Problema relacionado con el ambiente físico no especificado', 'Capítulo XXI', FALSE, FALSE)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 8. CONSULTAS MÉDICAS
-- =====================================================

CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES usuarios(id),
    
    -- Tipo de consulta
    tipo VARCHAR(50) NOT NULL, -- 'general', 'ocupacional'
    subtipo VARCHAR(50), -- 'ingreso', 'periodico', 'retorno', 'egreso', 'reubicacion'
    
    -- Motivo y antecedentes de la consulta
    motivo_consulta TEXT,
    padecimiento_actual TEXT,
    
    -- SOAP
    subjetivo TEXT,
    objetivo TEXT,
    analisis TEXT,
    plan_tratamiento TEXT,
    
    -- Diagnósticos
    diagnostico_principal VARCHAR(10), -- CIE-10
    diagnostico_principal_desc TEXT,
    diagnosticos_secundarios JSONB, -- [{codigo, descripcion}]
    
    -- Pronóstico
    pronostico VARCHAR(50), -- 'bueno', 'reservado', 'grave'
    
    -- Observaciones
    observaciones TEXT,
    recomendaciones TEXT,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'completada', -- 'en_proceso', 'completada', 'cancelada'
    
    -- Fechas
    fecha_consulta TIMESTAMP DEFAULT NOW(),
    proxima_cita DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consultas_expediente ON consultas(expediente_id);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_medico ON consultas(medico_id);
CREATE INDEX idx_consultas_fecha ON consultas(fecha_consulta);

-- =====================================================
-- 9. RECETAS ELECTRÓNICAS
-- =====================================================

CREATE TABLE IF NOT EXISTS recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES usuarios(id),
    
    -- Folio único de receta
    folio VARCHAR(50) UNIQUE,
    
    -- Información clínica
    diagnostico VARCHAR(10),
    diagnostico_desc TEXT,
    indicaciones_generales TEXT,
    
    -- Estado de la receta
    estado VARCHAR(20) DEFAULT 'activa', -- 'activa', 'surtida_parcial', 'surtida_total', 'cancelada', 'vencida'
    
    -- Vigencia
    fecha_receta TIMESTAMP DEFAULT NOW(),
    fecha_vigencia DATE,
    
    -- Surtido
    surtida_en VARCHAR(200),
    surtida_por VARCHAR(200),
    fecha_surtido TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger para folio de receta
CREATE OR REPLACE FUNCTION generar_folio_receta()
RETURNS TRIGGER AS $$
BEGIN
    NEW.folio := 'REC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('folio_receta_seq')::TEXT, 6, '0');
    NEW.fecha_vigencia := CURRENT_DATE + INTERVAL '30 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_folio_receta
    BEFORE INSERT ON recetas
    FOR EACH ROW
    EXECUTE FUNCTION generar_folio_receta();

CREATE TABLE IF NOT EXISTS recetas_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
    
    -- Medicamento
    medicamento_nombre VARCHAR(200) NOT NULL,
    principio_activo VARCHAR(200),
    presentacion VARCHAR(100),
    
    -- Dosis
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    via_administracion VARCHAR(50),
    
    -- Cantidad
    cantidad_solicitada INTEGER,
    cantidad_surtida INTEGER DEFAULT 0,
    unidad VARCHAR(50),
    
    -- Indicaciones
    indicaciones TEXT,
    
    -- Estado de surtido
    surtido BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recetas_consulta ON recetas(consulta_id);
CREATE INDEX idx_recetas_paciente ON recetas(paciente_id);
CREATE INDEX idx_recetas_estado ON recetas(estado);

-- =====================================================
-- 10. ESTUDIOS PARACLÍNICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS estudios_paraclinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id) ON DELETE CASCADE,
    consulta_id UUID REFERENCES consultas(id),
    paciente_id UUID REFERENCES pacientes(id),
    
    tipo VARCHAR(50) NOT NULL, -- 'audiometria', 'espirometria', 'ecg', 'rx', 'laboratorio', 'vision', 'otros'
    subtipo VARCHAR(100),
    
    -- Solicitud
    medico_solicita_id UUID REFERENCES usuarios(id),
    fecha_solicitud TIMESTAMP DEFAULT NOW(),
    urgente BOOLEAN DEFAULT FALSE,
    
    -- Resultados
    resultado TEXT,
    interpretacion TEXT,
    observaciones TEXT,
    valores_json JSONB, -- Para valores específicos según tipo
    
    -- Archivo
    archivo_url TEXT,
    archivo_tipo VARCHAR(20), -- 'pdf', 'dicom', 'imagen', 'audio'
    archivo_nombre VARCHAR(200),
    
    -- Interpretación médica
    medico_interpreta_id UUID REFERENCES usuarios(id),
    fecha_interpretacion TIMESTAMP,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'completo', 'anormal', 'critico', 'cancelado'
    
    -- Semáforo (para interpretación rápida)
    semaforo VARCHAR(20), -- 'verde', 'amarillo', 'rojo'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_estudios_expediente ON estudios_paraclinicos(expediente_id);
CREATE INDEX idx_estudios_tipo ON estudios_paraclinicos(tipo);
CREATE INDEX idx_estudios_estado ON estudios_paraclinicos(estado);

-- =====================================================
-- 11. AUDIOMETRÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS audiometrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id) ON DELETE CASCADE,
    
    -- Oído Derecho (dB)
    od_500hz INTEGER,
    od_1000hz INTEGER,
    od_2000hz INTEGER,
    od_3000hz INTEGER,
    od_4000hz INTEGER,
    od_6000hz INTEGER,
    od_8000hz INTEGER,
    
    -- Oído Izquierdo (dB)
    oi_500hz INTEGER,
    oi_1000hz INTEGER,
    oi_2000hz INTEGER,
    oi_3000hz INTEGER,
    oi_4000hz INTEGER,
    oi_6000hz INTEGER,
    oi_8000hz INTEGER,
    
    -- Interpretación NOM-011
    od_promedio_500_1000_2000 DECIMAL(5,2),
    oi_promedio_500_1000_2000 DECIMAL(5,2),
    
    od_promedio_3000_4000_6000 DECIMAL(5,2),
    oi_promedio_3000_4000_6000 DECIMAL(5,2),
    
    -- Semáforo NOM-011
    semaforo_od VARCHAR(20), -- 'verde', 'amarillo', 'rojo'
    semaforo_oi VARCHAR(20),
    semaforo_general VARCHAR(20),
    
    -- Interpretación
    interpretacion_nom011 TEXT,
    retardo_auditivo_od BOOLEAN DEFAULT FALSE,
    retardo_auditivo_oi BOOLEAN DEFAULT FALSE,
    
    -- Criteria para reevaluación
    requiere_reevaluacion BOOLEAN DEFAULT FALSE,
    tiempo_reevaluacion_meses INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 12. ESPIROMETRÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS espirometrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id) ON DELETE CASCADE,
    
    -- Datos del paciente para cálculo (edad, sexo, altura, etnia)
    edad_anios INTEGER,
    sexo VARCHAR(10),
    altura_cm DECIMAL(5,2),
    peso_kg DECIMAL(5,2),
    
    -- Valores medidos
    fvc_litros DECIMAL(5,2),
    fvc_predicho DECIMAL(5,2),
    fvc_porcentaje DECIMAL(5,2),
    
    fev1_litros DECIMAL(5,2),
    fev1_predicho DECIMAL(5,2),
    fev1_porcentaje DECIMAL(5,2),
    
    fev1_fvc DECIMAL(5,2),
    fev1_fvc_predicho DECIMAL(5,2),
    fev1_fvc_porcentaje DECIMAL(5,2),
    
    pef DECIMAL(6,2),
    pef_predicho DECIMAL(6,2),
    pef_porcentaje DECIMAL(5,2),
    
    fef2575 DECIMAL(6,2),
    fef2575_predicho DECIMAL(6,2),
    fef2575_porcentaje DECIMAL(5,2),
    
    -- Interpretación
    interpretacion VARCHAR(50), -- 'normal', 'restrictivo', 'obstructivo', 'mixto', 'no_concluyente'
    severidad VARCHAR(50), -- 'leve', 'moderado', 'severo', 'muy_severo'
    
    -- Calidad de la maniobra
    calidad_maniobra VARCHAR(20), -- 'A', 'B', 'C', 'D', 'E', 'F', 'U'
    reproduibilidad BOOLEAN,
    
    -- Medicamentos broncodilatadores (si aplica)
    prebroncodilatador BOOLEAN,
    postbroncodilatador BOOLEAN,
    variabilidad_post_bd DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 13. LABORATORIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS laboratorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id) ON DELETE CASCADE,
    
    grupo VARCHAR(100), -- 'hematologia', 'quimica', 'urianalisis', 'inmunologia', 'microbiologia'
    
    -- Información general
    metodo VARCHAR(100),
    muestra VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS laboratorios_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id UUID REFERENCES laboratorios(id) ON DELETE CASCADE,
    
    parametro VARCHAR(100),
    resultado VARCHAR(100),
    unidad VARCHAR(50),
    valor_referencia VARCHAR(100),
    valor_referencia_min DECIMAL(10,3),
    valor_referencia_max DECIMAL(10,3),
    
    -- Bandera automática
    bandera VARCHAR(20), -- 'normal', 'alto', 'bajo', 'critico', 'no_determinado'
    
    -- Observaciones específicas
    observaciones TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 14. SECUENCIAS PARA FOLIOS
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS folio_receta_seq START 1;

-- =====================================================
-- 15. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE expedientes_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE apnp ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahf ENABLE ROW LEVEL SECURITY;
ALTER TABLE historia_ocupacional ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploracion_fisica ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimientos_informados ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_paraclinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiometrias ENABLE ROW LEVEL SECURITY;
ALTER TABLE espirometrias ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorios_detalle ENABLE ROW LEVEL SECURITY;

-- Política básica: usuarios ven datos de su empresa
CREATE POLICY expedientes_empresa ON expedientes_clinicos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.empresa_id = expedientes_clinicos.empresa_id
        )
    );

CREATE POLICY apnp_empresa ON apnp
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM expedientes_clinicos e
            JOIN usuarios u ON u.empresa_id = e.empresa_id
            WHERE e.id = apnp.expediente_id AND u.id = auth.uid()
        )
    );

-- (Políticas similares para las demás tablas...)

-- =====================================================
-- 16. FUNCIONES AUXILIARES
-- =====================================================

-- Función para calcular IMC
CREATE OR REPLACE FUNCTION calcular_imc(peso_kg DECIMAL, talla_cm DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF talla_cm IS NULL OR talla_cm = 0 THEN
        RETURN NULL;
    END IF;
    RETURN peso_kg / ((talla_cm / 100) * (talla_cm / 100));
END;
$$ LANGUAGE plpgsql;

-- Función para calcular ICC
CREATE OR REPLACE FUNCTION calcular_icc(cintura_cm DECIMAL, cadera_cm DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF cadera_cm IS NULL OR cadera_cm = 0 THEN
        RETURN NULL;
    END IF;
    RETURN cintura_cm / cadera_cm;
END;
$$ LANGUAGE plpgsql;

-- Función para semáforo de audiometría (NOM-011)
CREATE OR REPLACE FUNCTION calcular_semaforo_audiometria(
    promedio_500_1000_2000 DECIMAL,
    promedio_3000_4000_6000 DECIMAL
)
RETURNS VARCHAR(20) AS $$
BEGIN
    -- Verde: Normal
    IF promedio_500_1000_2000 <= 25 AND promedio_3000_4000_6000 <= 25 THEN
        RETURN 'verde';
    END IF;
    
    -- Amarillo: Retardo auditivo
    IF promedio_500_1000_2000 <= 25 AND promedio_3000_4000_6000 > 25 THEN
        RETURN 'amarillo';
    END IF;
    
    -- Amarillo también si hay diferencia interaural
    -- (Esta es una simplificación, la NOM-011 es más compleja)
    
    -- Rojo: Daño auditivo
    RETURN 'rojo';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
