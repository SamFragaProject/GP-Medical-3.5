-- =============================================
-- ERP MÉDICO - MEDICINA DEL TRABAJO
-- Migración 002: Tablas Especializadas Medicina del Trabajo
-- =============================================

-- =============================================
-- TABLAS DE MEDICINA DEL TRABAJO
-- =============================================

-- Tabla de puestos de trabajo
CREATE TABLE puestos_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    descripcion TEXT,
    departamento VARCHAR(100),
    nivel_riesgo VARCHAR(50) DEFAULT 'bajo', -- bajo, medio, alto, critico
    factores_riesgo JSONB DEFAULT '[]'::jsonb,
    equipos_proteccion JSONB DEFAULT '[]'::jsonb,
    examenes_requeridos JSONB DEFAULT '[]'::jsonb,
    periodicidad_examenes INTEGER DEFAULT 12, -- meses
    certificaciones_necesarias JSONB DEFAULT '[]'::jsonb,
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de trabajadores/pacientes
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    puesto_trabajo_id UUID REFERENCES puestos_trabajo(id) ON DELETE SET NULL,
    numero_empleado VARCHAR(50) UNIQUE,
    nss VARCHAR(20),
    curp VARCHAR(18),
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono_emergencia VARCHAR(20),
    contacto_emergencia VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    estado_civil VARCHAR(50),
    escolaridad VARCHAR(100),
    tipo_sangre VARCHAR(5),
    fecha_ingreso DATE,
    fecha_baja DATE,
    motivo_baja TEXT,
    estatus VARCHAR(50) DEFAULT 'activo', -- activo, baja, suspendido
    alergias TEXT,
    enfermedades_cronicas TEXT,
    medicamentos_actuales TEXT,
    antecedentes_familiares TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de protocolos médicos
CREATE TABLE protocolos_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- ingreso, periodico, egreso, especial
    descripcion TEXT,
    examenes_incluidos JSONB DEFAULT '[]'::jsonb,
    normativas JSONB DEFAULT '[]'::jsonb, -- OSHA, NOM-006-STPS, etc.
    vigencia_meses INTEGER DEFAULT 12,
    puestos_aplicables JSONB DEFAULT '[]'::jsonb,
    requisitos TEXT,
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de exámenes ocupacionales
CREATE TABLE examenes_ocupacionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    protocolo_id UUID REFERENCES protocolos_medicos(id),
    medico_id UUID REFERENCES profiles(id),
    tipo_examen VARCHAR(100) NOT NULL, -- ingreso, periodico, egreso, especial
    fecha_programada DATE,
    fecha_realizada DATE,
    estado VARCHAR(50) DEFAULT 'programado', -- programado, en_proceso, completado, cancelado
    resultados JSONB DEFAULT '{}'::jsonb,
    observaciones_medicas TEXT,
    recomendaciones TEXT,
    restricciones_laborales TEXT,
    aptitud_medica VARCHAR(50), -- apto, no_apto, apto_con_restricciones
    fecha_vigencia DATE,
    certificado_emitido BOOLEAN DEFAULT false,
    url_certificado TEXT,
    seguimiento_requerido BOOLEAN DEFAULT false,
    proxima_evaluacion DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de evaluaciones de riesgo
CREATE TABLE evaluaciones_riesgo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id),
    puesto_trabajo_id UUID REFERENCES puestos_trabajo(id),
    evaluador_id UUID REFERENCES profiles(id),
    fecha_evaluacion DATE NOT NULL,
    tipo_evaluacion VARCHAR(100), -- inicial, periodica, por_cambios, post_accidente
    factores_evaluados JSONB DEFAULT '[]'::jsonb,
    mediciones_ambientales JSONB DEFAULT '{}'::jsonb, -- ruido, iluminacion, temperatura, etc.
    riesgos_identificados JSONB DEFAULT '[]'::jsonb,
    nivel_riesgo_general VARCHAR(50), -- bajo, medio, alto, critico
    medidas_preventivas JSONB DEFAULT '[]'::jsonb,
    medidas_correctivas JSONB DEFAULT '[]'::jsonb,
    fecha_implementacion DATE,
    responsable_implementacion UUID REFERENCES profiles(id),
    estado_implementacion VARCHAR(50) DEFAULT 'pendiente',
    fecha_revision DATE,
    observaciones TEXT,
    adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de incapacidades laborales
CREATE TABLE incapacidades_laborales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES profiles(id),
    folio_incapacidad VARCHAR(100),
    tipo_incapacidad VARCHAR(100), -- enfermedad_general, riesgo_trabajo, maternidad
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    dias_otorgados INTEGER NOT NULL,
    dias_pagados INTEGER DEFAULT 0,
    porcentaje_pago DECIMAL(5,2) DEFAULT 100.00,
    diagnostico_principal TEXT NOT NULL,
    diagnosticos_secundarios TEXT,
    institucion_emisora VARCHAR(100), -- IMSS, ISSSTE, PARTICULAR
    numero_instituto VARCHAR(50),
    causa_accidente TEXT,
    lugar_accidente VARCHAR(255),
    consecutivo INTEGER,
    estado VARCHAR(50) DEFAULT 'activa', -- activa, finalizada, prorrogada, cancelada
    observaciones TEXT,
    documentos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de certificaciones médicas
CREATE TABLE certificaciones_medicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES examenes_ocupacionales(id),
    medico_id UUID NOT NULL REFERENCES profiles(id),
    tipo_certificacion VARCHAR(100) NOT NULL, -- aptitud, restriccion, incapacidad, retorno
    numero_certificado VARCHAR(100) UNIQUE,
    fecha_emision DATE NOT NULL,
    fecha_vigencia DATE,
    resultado VARCHAR(100) NOT NULL, -- apto, no_apto, apto_con_restricciones
    observaciones_medicas TEXT,
    restricciones TEXT,
    recomendaciones TEXT,
    firma_digital TEXT,
    url_documento TEXT,
    estado VARCHAR(50) DEFAULT 'vigente', -- vigente, vencido, revocado
    revocado_por UUID REFERENCES profiles(id),
    fecha_revocacion DATE,
    motivo_revocacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de dictámenes médicos
CREATE TABLE dictamenes_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES profiles(id),
    tipo_dictamen VARCHAR(100) NOT NULL, -- causalidad, valuacion, revision
    fecha_dictamen DATE NOT NULL,
    motivo TEXT NOT NULL,
    antecedentes_laborales TEXT,
    antecedentes_medicos TEXT,
    exploracion_fisica TEXT,
    estudios_complementarios TEXT,
    diagnostico_principal TEXT NOT NULL,
    diagnosticos_diferenciales TEXT,
    conclusion TEXT NOT NULL,
    recomendaciones TEXT,
    incapacidad_recomendada INTEGER, -- días
    porcentaje_incapacidad DECIMAL(5,2),
    fecha_alta_estimada DATE,
    observaciones TEXT,
    firma_digital TEXT,
    url_documento TEXT,
    estado VARCHAR(50) DEFAULT 'borrador', -- borrador, finalizado, enviado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial médico laboral
CREATE TABLE historial_medico_laboral (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES profiles(id),
    fecha_evento DATE NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL, -- consulta, examen, accidente, enfermedad, vacuna
    descripcion TEXT NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos TEXT,
    reposo_dias INTEGER DEFAULT 0,
    seguimiento_requerido BOOLEAN DEFAULT false,
    fecha_seguimiento DATE,
    observaciones TEXT,
    adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLAS DE LOGÍSTICA MÉDICA
-- =============================================

-- Tabla de citas y agenda
CREATE TABLE citas_examenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES profiles(id),
    protocolo_id UUID REFERENCES protocolos_medicos(id),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    tipo_cita VARCHAR(100) NOT NULL, -- examen_ingreso, examen_periodico, consulta, seguimiento
    estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, en_proceso, completada, cancelada, no_asistio
    motivo TEXT,
    observaciones TEXT,
    recordatorios_enviados INTEGER DEFAULT 0,
    check_in_timestamp TIMESTAMP WITH TIME ZONE,
    check_out_timestamp TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estudios de laboratorio
CREATE TABLE laboratorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES examenes_ocupacionales(id),
    medico_solicitante UUID REFERENCES profiles(id),
    laboratorio_externo VARCHAR(255),
    fecha_solicitud DATE NOT NULL,
    fecha_toma_muestra DATE,
    fecha_resultado DATE,
    tipo_estudio VARCHAR(100) NOT NULL, -- biometria, quimica, orina, toxicologico
    estudios_solicitados JSONB DEFAULT '[]'::jsonb,
    resultados JSONB DEFAULT '{}'::jsonb,
    valores_referencia JSONB DEFAULT '{}'::jsonb,
    observaciones_lab TEXT,
    interpretacion_medica TEXT,
    estado VARCHAR(50) DEFAULT 'solicitado', -- solicitado, tomado, procesando, completado
    urgente BOOLEAN DEFAULT false,
    adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estudios de imagenología
CREATE TABLE imagenologia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES examenes_ocupacionales(id),
    medico_solicitante UUID REFERENCES profiles(id),
    centro_imagen VARCHAR(255),
    fecha_solicitud DATE NOT NULL,
    fecha_estudio DATE,
    tipo_estudio VARCHAR(100) NOT NULL, -- radiografia_torax, columna, articulaciones
    region_anatomica VARCHAR(100),
    hallazgos TEXT,
    interpretacion TEXT,
    conclusion TEXT,
    recomendaciones TEXT,
    estado VARCHAR(50) DEFAULT 'solicitado', -- solicitado, realizado, interpretado, completado
    urgente BOOLEAN DEFAULT false,
    url_imagenes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX idx_puestos_empresa ON puestos_trabajo(empresa_id);
CREATE INDEX idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX idx_pacientes_puesto ON pacientes(puesto_trabajo_id);
CREATE INDEX idx_examenes_paciente ON examenes_ocupacionales(paciente_id);
CREATE INDEX idx_examenes_medico ON examenes_ocupacionales(medico_id);
CREATE INDEX idx_evaluaciones_empresa ON evaluaciones_riesgo(empresa_id);
CREATE INDEX idx_incapacidades_paciente ON incapacidades_laborales(paciente_id);
CREATE INDEX idx_certificaciones_paciente ON certificaciones_medicas(paciente_id);
CREATE INDEX idx_dictamenes_paciente ON dictamenes_medicos(paciente_id);
CREATE INDEX idx_historial_paciente ON historial_medico_laboral(paciente_id);
CREATE INDEX idx_citas_fecha ON citas_examenes(fecha_hora);
CREATE INDEX idx_citas_medico ON citas_examenes(medico_id);
CREATE INDEX idx_laboratorios_paciente ON laboratorios(paciente_id);
CREATE INDEX idx_imagenologia_paciente ON imagenologia(paciente_id);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_puestos_updated_at BEFORE UPDATE ON puestos_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocolos_updated_at BEFORE UPDATE ON protocolos_medicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examenes_updated_at BEFORE UPDATE ON examenes_ocupacionales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON evaluaciones_riesgo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incapacidades_updated_at BEFORE UPDATE ON incapacidades_laborales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificaciones_updated_at BEFORE UPDATE ON certificaciones_medicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dictamenes_updated_at BEFORE UPDATE ON dictamenes_medicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas_examenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laboratorios_updated_at BEFORE UPDATE ON laboratorios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imagenologia_updated_at BEFORE UPDATE ON imagenologia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();