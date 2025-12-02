-- =====================================================
-- MEDIFLOW ERP - ESQUEMA COMPLETO CON CIE-10
-- Ejecutar en Supabase SQL Editor en ORDEN
-- =====================================================

-- =====================================================
-- PARTE 1: EXTENSIONES Y CONFIGURACIÓN
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PARTE 2: CATÁLOGO CIE-10 (OMS)
-- =====================================================

-- Tabla principal de códigos CIE-10
CREATE TABLE IF NOT EXISTS cie10_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion_es TEXT NOT NULL,
    descripcion_en TEXT,
    capitulo VARCHAR(5),
    grupo VARCHAR(20),
    es_causa_externa BOOLEAN DEFAULT FALSE,
    es_enfermedad_laboral BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_cie10_codigo ON cie10_categorias(codigo);
CREATE INDEX idx_cie10_descripcion ON cie10_categorias USING gin(to_tsvector('spanish', descripcion_es));

-- Insertar capítulos principales CIE-10
INSERT INTO cie10_categorias (codigo, descripcion_es, capitulo, grupo) VALUES
-- CAPÍTULO I: Enfermedades infecciosas
('A00-B99', 'Ciertas enfermedades infecciosas y parasitarias', 'I', 'A00-B99'),
('A00', 'Cólera', 'I', 'A00-A09'),
('A01', 'Fiebres tifoidea y paratifoidea', 'I', 'A00-A09'),
('A09', 'Diarrea y gastroenteritis de presunto origen infeccioso', 'I', 'A00-A09'),

-- CAPÍTULO II: Neoplasias
('C00-D48', 'Neoplasias', 'II', 'C00-D48'),

-- CAPÍTULO III: Enfermedades de la sangre
('D50-D89', 'Enfermedades de la sangre y órganos hematopoyéticos', 'III', 'D50-D89'),

-- CAPÍTULO IV: Enfermedades endocrinas
('E00-E90', 'Enfermedades endocrinas, nutricionales y metabólicas', 'IV', 'E00-E90'),
('E10', 'Diabetes mellitus insulinodependiente', 'IV', 'E10-E14'),
('E11', 'Diabetes mellitus no insulinodependiente', 'IV', 'E10-E14'),
('E66', 'Obesidad', 'IV', 'E65-E68'),

-- CAPÍTULO V: Trastornos mentales
('F00-F99', 'Trastornos mentales y del comportamiento', 'V', 'F00-F99'),
('F32', 'Episodio depresivo', 'V', 'F30-F39'),
('F41', 'Otros trastornos de ansiedad', 'V', 'F40-F48'),
('F43', 'Reacciones al estrés grave y trastornos de adaptación', 'V', 'F40-F48'),

-- CAPÍTULO VI: Sistema nervioso
('G00-G99', 'Enfermedades del sistema nervioso', 'VI', 'G00-G99'),
('G43', 'Migraña', 'VI', 'G40-G47'),
('G47', 'Trastornos del sueño', 'VI', 'G40-G47'),

-- CAPÍTULO VII: Ojo y anexos
('H00-H59', 'Enfermedades del ojo y sus anexos', 'VII', 'H00-H59'),
('H10', 'Conjuntivitis', 'VII', 'H10-H13'),
('H52', 'Trastornos de la refracción y de la acomodación', 'VII', 'H49-H52'),

-- CAPÍTULO VIII: Oído
('H60-H95', 'Enfermedades del oído y de la apófisis mastoides', 'VIII', 'H60-H95'),
('H83', 'Otros trastornos del oído interno (hipoacusia laboral)', 'VIII', 'H80-H83'),

-- CAPÍTULO IX: Sistema circulatorio
('I00-I99', 'Enfermedades del sistema circulatorio', 'IX', 'I00-I99'),
('I10', 'Hipertensión esencial (primaria)', 'IX', 'I10-I15'),
('I20', 'Angina de pecho', 'IX', 'I20-I25'),
('I21', 'Infarto agudo del miocardio', 'IX', 'I20-I25'),

-- CAPÍTULO X: Sistema respiratorio
('J00-J99', 'Enfermedades del sistema respiratorio', 'X', 'J00-J99'),
('J00', 'Rinofaringitis aguda (resfriado común)', 'X', 'J00-J06'),
('J06', 'Infecciones agudas de las vías respiratorias superiores', 'X', 'J00-J06'),
('J45', 'Asma', 'X', 'J40-J47'),

-- CAPÍTULO XI: Sistema digestivo
('K00-K93', 'Enfermedades del sistema digestivo', 'XI', 'K00-K93'),
('K29', 'Gastritis y duodenitis', 'XI', 'K20-K31'),
('K40', 'Hernia inguinal', 'XI', 'K40-K46'),

-- CAPÍTULO XII: Piel
('L00-L99', 'Enfermedades de la piel y del tejido subcutáneo', 'XII', 'L00-L99'),
('L23', 'Dermatitis alérgica de contacto', 'XII', 'L20-L30'),
('L24', 'Dermatitis de contacto por irritantes', 'XII', 'L20-L30'),

-- CAPÍTULO XIII: Sistema osteomuscular (MUY IMPORTANTE EN MEDICINA OCUPACIONAL)
('M00-M99', 'Enfermedades del sistema osteomuscular y del tejido conectivo', 'XIII', 'M00-M99'),
('M54', 'Dorsalgia', 'XIII', 'M50-M54'),
('M54.5', 'Lumbago no especificado', 'XIII', 'M50-M54'),
('M75', 'Lesiones del hombro', 'XIII', 'M70-M79'),
('M77', 'Otras entesopatías (epicondilitis)', 'XIII', 'M70-M79'),
('M79', 'Otros trastornos de tejidos blandos', 'XIII', 'M70-M79'),

-- CAPÍTULO XIV: Sistema genitourinario
('N00-N99', 'Enfermedades del sistema genitourinario', 'XIV', 'N00-N99'),
('N39', 'Otros trastornos del sistema urinario', 'XIV', 'N30-N39'),

-- CAPÍTULO XV: Embarazo y parto
('O00-O99', 'Embarazo, parto y puerperio', 'XV', 'O00-O99'),

-- CAPÍTULO XVIII: Síntomas y signos
('R00-R99', 'Síntomas, signos y hallazgos anormales clínicos y de laboratorio', 'XVIII', 'R00-R99'),
('R10', 'Dolor abdominal y pélvico', 'XVIII', 'R10-R19'),
('R51', 'Cefalea', 'XVIII', 'R50-R69'),

-- CAPÍTULO XIX: Traumatismos (CRÍTICO PARA MEDICINA OCUPACIONAL)
('S00-T98', 'Traumatismos, envenenamientos y otras consecuencias de causas externas', 'XIX', 'S00-T98'),
('S60', 'Traumatismo superficial de la muñeca y de la mano', 'XIX', 'S60-S69'),
('S62', 'Fractura a nivel de la muñeca y de la mano', 'XIX', 'S60-S69'),
('S80', 'Traumatismo superficial de la pierna', 'XIX', 'S80-S89'),
('S82', 'Fractura de la pierna, incluido el tobillo', 'XIX', 'S80-S89'),
('T14', 'Traumatismo de región del cuerpo no especificada', 'XIX', 'T08-T14'),

-- CAPÍTULO XX: Causas externas
('V01-Y98', 'Causas externas de morbilidad y de mortalidad', 'XX', 'V01-Y98'),
('W00-W19', 'Caídas', 'XX', 'W00-W19'),
('W20-W49', 'Exposición a fuerzas mecánicas', 'XX', 'W20-W49'),

-- CAPÍTULO XXI: Factores de salud (EXÁMENES OCUPACIONALES)
('Z00-Z99', 'Factores que influyen en el estado de salud y contacto con servicios', 'XXI', 'Z00-Z99'),
('Z00', 'Examen general e investigación de personas sin quejas o sin diagnóstico', 'XXI', 'Z00-Z13'),
('Z00.0', 'Examen médico general', 'XXI', 'Z00-Z13'),
('Z02', 'Examen y contacto para fines administrativos', 'XXI', 'Z00-Z13'),
('Z02.1', 'Examen preempleo', 'XXI', 'Z00-Z13'),
('Z10', 'Examen de salud ocupacional de rutina', 'XXI', 'Z00-Z13'),
('Z57', 'Exposición ocupacional a factores de riesgo', 'XXI', 'Z55-Z65')
ON CONFLICT (codigo) DO NOTHING;

-- Marcar enfermedades laborales comunes
UPDATE cie10_categorias SET es_enfermedad_laboral = TRUE WHERE codigo IN (
    'M54', 'M54.5', 'M75', 'M77', 'M79', -- Musculoesqueléticas
    'H83', -- Hipoacusia
    'L23', 'L24', -- Dermatitis ocupacional
    'F43', -- Estrés laboral
    'J45' -- Asma ocupacional
);

-- =====================================================
-- PARTE 3: TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- Tabla de empresas (multi-tenant)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(13),
    razon_social VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    telefono VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,

    -- Datos STPS
    registro_stps VARCHAR(50),
    giro_actividad VARCHAR(100),
    clase_riesgo INTEGER CHECK (clase_riesgo BETWEEN 1 AND 5),

    -- Suscripción
    plan VARCHAR(20) DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
    max_usuarios INTEGER DEFAULT 5,
    max_pacientes INTEGER DEFAULT 100,
    activa BOOLEAN DEFAULT TRUE,
    fecha_vencimiento DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

    -- Datos personales
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    avatar_url TEXT,

    -- Rol y permisos
    rol VARCHAR(30) NOT NULL CHECK (rol IN (
        'super_admin',
        'admin_empresa',
        'medico',
        'enfermero',
        'recepcionista',
        'recursos_humanos',
        'auditor'
    )),

    -- Datos profesionales (para médicos)
    cedula_profesional VARCHAR(20),
    especialidad VARCHAR(100),
    universidad VARCHAR(200),
    firma_digital_url TEXT,
    fcm_token TEXT,

    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pacientes (trabajadores)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

    -- Datos personales
    numero_empleado VARCHAR(50),
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    curp VARCHAR(18),
    rfc VARCHAR(13),
    nss VARCHAR(11), -- Número Seguro Social IMSS
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    estado_civil VARCHAR(20),

    -- Contacto
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono_emergencia VARCHAR(20),
    contacto_emergencia VARCHAR(200),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),

    -- Datos laborales
    puesto VARCHAR(200),
    departamento VARCHAR(200),
    area VARCHAR(200),
    turno VARCHAR(20) CHECK (turno IN ('matutino', 'vespertino', 'nocturno', 'mixto', 'rotativo')),
    fecha_ingreso DATE,
    fecha_baja DATE,
    tipo_contrato VARCHAR(50),
    jefe_inmediato VARCHAR(200),

    -- Datos médicos básicos
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    enfermedades_cronicas TEXT,
    medicamentos_actuales TEXT,
    antecedentes_familiares TEXT,

    -- Control
    foto_url TEXT,
    activo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(empresa_id, numero_empleado),
    UNIQUE(curp)
);

-- Tabla de exámenes médicos
CREATE TABLE IF NOT EXISTS examenes_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES usuarios(id),

    -- Tipo y estado
    tipo_examen VARCHAR(30) NOT NULL CHECK (tipo_examen IN (
        'ingreso',
        'periodico',
        'especifico',
        'reintegro',
        'egreso'
    )),
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN (
        'programado',
        'en_proceso',
        'completado',
        'cancelado'
    )),

    -- Fechas
    fecha_programada DATE,
    fecha_realizacion TIMESTAMPTZ,

    -- Signos vitales
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    imc DECIMAL(4,2),
    presion_sistolica INTEGER,
    presion_diastolica INTEGER,
    frecuencia_cardiaca INTEGER,
    frecuencia_respiratoria INTEGER,
    temperatura DECIMAL(4,2),
    saturacion_oxigeno INTEGER,

    -- Exploración física
    exploracion_cabeza TEXT,
    exploracion_cuello TEXT,
    exploracion_torax TEXT,
    exploracion_abdomen TEXT,
    exploracion_extremidades TEXT,
    exploracion_columna TEXT,
    exploracion_piel TEXT,
    exploracion_neurologico TEXT,

    -- Estudios auxiliares
    estudios_laboratorio JSONB DEFAULT '[]',
    estudios_gabinete JSONB DEFAULT '[]',

    -- Evaluaciones específicas
    agudeza_visual_od VARCHAR(20),
    agudeza_visual_oi VARCHAR(20),
    audiometria_od JSONB,
    audiometria_oi JSONB,
    espirometria JSONB,

    -- Resultado
    aptitud VARCHAR(30) CHECK (aptitud IN (
        'apto',
        'apto_con_restricciones',
        'no_apto_temporal',
        'no_apto_permanente',
        'pendiente'
    )),
    restricciones TEXT,
    recomendaciones TEXT,
    observaciones TEXT,
    proxima_evaluacion DATE,

    -- Firma
    firmado BOOLEAN DEFAULT FALSE,
    fecha_firma TIMESTAMPTZ,
    firma_medico_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de diagnósticos CIE-10 por examen
CREATE TABLE IF NOT EXISTS diagnosticos_examen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examen_id UUID NOT NULL REFERENCES examenes_medicos(id) ON DELETE CASCADE,
    cie10_codigo VARCHAR(10) NOT NULL,

    tipo VARCHAR(20) NOT NULL CHECK (tipo IN (
        'principal',
        'secundario',
        'antecedente'
    )),
    descripcion_adicional TEXT,
    fecha_diagnostico DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de incapacidades
CREATE TABLE IF NOT EXISTS incapacidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES usuarios(id),

    -- Clasificación
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'enfermedad_general',
        'riesgo_trabajo',
        'maternidad',
        'licencia_medica'
    )),

    -- Diagnóstico CIE-10
    cie10_codigo VARCHAR(10) NOT NULL,
    diagnostico_descripcion TEXT,

    -- Fechas
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_totales INTEGER GENERATED ALWAYS AS (fecha_fin - fecha_inicio + 1) STORED,

    -- IMSS
    folio_imss VARCHAR(50),
    numero_incapacidad VARCHAR(50),

    -- Control
    documento_url TEXT,
    observaciones TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES usuarios(id),

    -- Tipo
    tipo_cita VARCHAR(30) NOT NULL CHECK (tipo_cita IN (
        'examen_medico',
        'consulta',
        'seguimiento',
        'urgencia',
        'vacunacion'
    )),

    -- Programación
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    duracion_minutos INTEGER DEFAULT 30,

    -- Estado
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN (
        'programada',
        'confirmada',
        'en_espera',
        'en_atencion',
        'completada',
        'cancelada',
        'no_asistio'
    )),

    -- Detalles
    motivo TEXT,
    notas TEXT,

    -- Recordatorios
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    fecha_recordatorio TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de certificados médicos
CREATE TABLE IF NOT EXISTS certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES examenes_medicos(id),
    medico_id UUID NOT NULL REFERENCES usuarios(id),

    -- Tipo
    tipo_certificado VARCHAR(30) NOT NULL CHECK (tipo_certificado IN (
        'aptitud_laboral',
        'incapacidad',
        'reintegro',
        'constancia_salud',
        'dictamen_stps'
    )),

    -- Contenido
    folio VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vigencia DATE,
    contenido JSONB NOT NULL,

    -- Firma digital
    firmado BOOLEAN DEFAULT FALSE,
    firma_digital_hash TEXT,
    firma_url TEXT,
    fecha_firma TIMESTAMPTZ,

    -- Archivo
    pdf_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de auditoría médica
CREATE TABLE IF NOT EXISTS auditoria_medica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL,
    usuario_id UUID,
    usuario_email TEXT,

    -- Acción
    tabla TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'PRINT')),

    -- Datos
    datos_anteriores JSONB,
    datos_nuevos JSONB,

    -- Contexto
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),

    -- Contenido
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'cita_recordatorio',
        'examen_vencido',
        'incapacidad_proxima',
        'alerta_riesgo',
        'sistema'
    )),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    datos JSONB,

    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMPTZ,

    -- Push notification
    enviada_push BOOLEAN DEFAULT FALSE,
    fcm_token TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración por empresa
CREATE TABLE IF NOT EXISTS configuracion_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID UNIQUE NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

    -- General
    zona_horaria VARCHAR(50) DEFAULT 'America/Mexico_City',
    formato_fecha VARCHAR(20) DEFAULT 'DD/MM/YYYY',

    -- Citas
    duracion_cita_default INTEGER DEFAULT 30,
    horario_inicio TIME DEFAULT '08:00',
    horario_fin TIME DEFAULT '18:00',
    dias_laborales INTEGER[] DEFAULT '{1,2,3,4,5}', -- Lun-Vie

    -- Notificaciones
    recordatorio_cita_horas INTEGER DEFAULT 24,
    alerta_examen_dias INTEGER DEFAULT 30,

    -- Certificados
    prefijo_folio VARCHAR(10) DEFAULT 'CERT',
    contador_folio INTEGER DEFAULT 0,

    -- Integraciones
    openai_api_key_encrypted TEXT,
    stripe_customer_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 4: ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido_paterno);
CREATE INDEX idx_pacientes_curp ON pacientes(curp);
CREATE INDEX idx_pacientes_nss ON pacientes(nss);

CREATE INDEX idx_examenes_empresa ON examenes_medicos(empresa_id);
CREATE INDEX idx_examenes_paciente ON examenes_medicos(paciente_id);
CREATE INDEX idx_examenes_fecha ON examenes_medicos(fecha_realizacion);
CREATE INDEX idx_examenes_estado ON examenes_medicos(estado);

CREATE INDEX idx_incapacidades_empresa ON incapacidades(empresa_id);
CREATE INDEX idx_incapacidades_paciente ON incapacidades(paciente_id);
CREATE INDEX idx_incapacidades_fechas ON incapacidades(fecha_inicio, fecha_fin);

CREATE INDEX idx_citas_empresa ON citas(empresa_id);
CREATE INDEX idx_citas_fecha ON citas(fecha, hora_inicio);
CREATE INDEX idx_citas_medico ON citas(medico_id);

CREATE INDEX idx_diagnosticos_examen ON diagnosticos_examen(examen_id);
CREATE INDEX idx_diagnosticos_cie10 ON diagnosticos_examen(cie10_codigo);

CREATE INDEX idx_auditoria_empresa ON auditoria_medica(empresa_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_medica(created_at);

-- =====================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE incapacidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_medica ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_empresa ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener empresa_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT empresa_id
        FROM usuarios
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para empresas
CREATE POLICY "Usuarios ven solo su empresa" ON empresas
    FOR SELECT USING (id = get_user_empresa_id());

-- Políticas para usuarios
CREATE POLICY "Usuarios ven miembros de su empresa" ON usuarios
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Admins pueden crear usuarios" ON usuarios
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id()
        AND EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol IN ('super_admin', 'admin_empresa')
        )
    );

-- Políticas para pacientes
CREATE POLICY "Usuarios ven pacientes de su empresa" ON pacientes
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Usuarios crean pacientes en su empresa" ON pacientes
    FOR INSERT WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY "Usuarios actualizan pacientes de su empresa" ON pacientes
    FOR UPDATE USING (empresa_id = get_user_empresa_id());

-- Políticas para exámenes médicos
CREATE POLICY "Ver exámenes de mi empresa" ON examenes_medicos
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Crear exámenes en mi empresa" ON examenes_medicos
    FOR INSERT WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY "Actualizar exámenes de mi empresa" ON examenes_medicos
    FOR UPDATE USING (empresa_id = get_user_empresa_id());

-- Políticas similares para otras tablas...
CREATE POLICY "Ver diagnósticos de mi empresa" ON diagnosticos_examen
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM examenes_medicos e
            WHERE e.id = examen_id
            AND e.empresa_id = get_user_empresa_id()
        )
    );

CREATE POLICY "Ver incapacidades de mi empresa" ON incapacidades
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Ver citas de mi empresa" ON citas
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Ver certificados de mi empresa" ON certificados
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Ver auditoría de mi empresa" ON auditoria_medica
    FOR SELECT USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Ver notificaciones propias" ON notificaciones
    FOR SELECT USING (
        empresa_id = get_user_empresa_id()
        AND (usuario_id = auth.uid() OR usuario_id IS NULL)
    );

CREATE POLICY "Ver configuración de mi empresa" ON configuracion_empresa
    FOR SELECT USING (empresa_id = get_user_empresa_id());

-- CIE-10 es público (catálogo)
ALTER TABLE cie10_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CIE10 es público" ON cie10_categorias
    FOR SELECT USING (true);

-- =====================================================
-- PARTE 6: FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para calcular IMC automáticamente
CREATE OR REPLACE FUNCTION calcular_imc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.peso_kg IS NOT NULL AND NEW.talla_cm IS NOT NULL AND NEW.talla_cm > 0 THEN
        NEW.imc := ROUND((NEW.peso_kg / POWER(NEW.talla_cm / 100, 2))::numeric, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_imc
    BEFORE INSERT OR UPDATE ON examenes_medicos
    FOR EACH ROW EXECUTE FUNCTION calcular_imc();

-- Función para auditoría automática
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_medica (
        empresa_id,
        usuario_id,
        usuario_email,
        tabla,
        registro_id,
        accion,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        COALESCE(NEW.empresa_id, OLD.empresa_id),
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_pacientes
    AFTER INSERT OR UPDATE OR DELETE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER audit_examenes
    AFTER INSERT OR UPDATE OR DELETE ON examenes_medicos
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER audit_incapacidades
    AFTER INSERT OR UPDATE OR DELETE ON incapacidades
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER audit_certificados
    AFTER INSERT OR UPDATE OR DELETE ON certificados
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Función para generar folio de certificado
CREATE OR REPLACE FUNCTION generar_folio_certificado(p_empresa_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_prefijo TEXT;
    v_contador INTEGER;
    v_folio TEXT;
BEGIN
    -- Obtener configuración
    SELECT prefijo_folio, contador_folio + 1
    INTO v_prefijo, v_contador
    FROM configuracion_empresa
    WHERE empresa_id = p_empresa_id
    FOR UPDATE;

    -- Actualizar contador
    UPDATE configuracion_empresa
    SET contador_folio = v_contador
    WHERE empresa_id = p_empresa_id;

    -- Generar folio
    v_folio := v_prefijo || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(v_contador::TEXT, 5, '0');

    RETURN v_folio;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pacientes_updated_at
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_examenes_updated_at
    BEFORE UPDATE ON examenes_medicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- PARTE 7: VISTAS ÚTILES
-- =====================================================

-- Vista de pacientes con último examen
CREATE OR REPLACE VIEW v_pacientes_con_examen AS
SELECT
    p.*,
    e.id as ultimo_examen_id,
    e.tipo_examen as ultimo_tipo_examen,
    e.fecha_realizacion as ultima_fecha_examen,
    e.aptitud as ultima_aptitud,
    e.proxima_evaluacion
FROM pacientes p
LEFT JOIN LATERAL (
    SELECT *
    FROM examenes_medicos em
    WHERE em.paciente_id = p.id
    AND em.estado = 'completado'
    ORDER BY em.fecha_realizacion DESC
    LIMIT 1
) e ON true;

-- Vista de exámenes próximos a vencer
CREATE OR REPLACE VIEW v_examenes_por_vencer AS
SELECT
    p.id as paciente_id,
    p.nombre || ' ' || p.apellido_paterno as paciente_nombre,
    p.numero_empleado,
    p.puesto,
    e.id as examen_id,
    e.tipo_examen,
    e.fecha_realizacion,
    e.proxima_evaluacion,
    e.proxima_evaluacion - CURRENT_DATE as dias_para_vencer,
    p.empresa_id
FROM pacientes p
JOIN examenes_medicos e ON e.paciente_id = p.id
WHERE e.estado = 'completado'
AND e.proxima_evaluacion IS NOT NULL
AND e.proxima_evaluacion <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY e.proxima_evaluacion;

-- Vista de estadísticas por empresa
CREATE OR REPLACE VIEW v_estadisticas_empresa AS
SELECT
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    (SELECT COUNT(*) FROM pacientes WHERE empresa_id = e.id AND activo = true) as total_pacientes,
    (SELECT COUNT(*) FROM examenes_medicos WHERE empresa_id = e.id AND estado = 'completado') as total_examenes,
    (SELECT COUNT(*) FROM incapacidades WHERE empresa_id = e.id) as total_incapacidades,
    (SELECT SUM(dias_totales) FROM incapacidades WHERE empresa_id = e.id) as dias_incapacidad_totales,
    (SELECT COUNT(*) FROM citas WHERE empresa_id = e.id AND fecha = CURRENT_DATE) as citas_hoy
FROM empresas e;
