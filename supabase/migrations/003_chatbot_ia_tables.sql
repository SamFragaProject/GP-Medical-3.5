-- =============================================
-- ERP MÉDICO - MEDICINA DEL TRABAJO
-- Migración 003: Chatbot Superinteligente y Sistema IA
-- =============================================

-- =============================================
-- TABLAS DEL CHATBOT SUPERINTELIGENTE
-- =============================================

-- Tabla de base de conocimiento
CREATE TABLE base_conocimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- NULL para conocimiento global
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- soporte_tecnico, medicina_trabajo, normativas, preguntas_frecuentes
    subcategoria VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,
    palabras_clave JSONB DEFAULT '[]'::jsonb,
    idioma VARCHAR(10) DEFAULT 'es',
    relevancia INTEGER DEFAULT 5, -- 1-10 escala de relevancia
    rol_objetivo VARCHAR(100), -- rol específico al que aplica
    tipo_contenido VARCHAR(50) DEFAULT 'texto', -- texto, video, imagen, documento
    url_recurso TEXT,
    metadatos JSONB DEFAULT '{}'::jsonb,
    activo BOOLEAN DEFAULT true,
    vistas INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    fecha_revision DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones del chatbot
CREATE TABLE conversaciones_chatbot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    titulo VARCHAR(255),
    tipo_conversacion VARCHAR(100) NOT NULL, -- soporte_tecnico, asistente_usuario, atc_comercial, quejas_sugerencias
    contexto_pagina VARCHAR(255), -- página donde se inició la conversación
    rol_usuario VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'activa', -- activa, cerrada, escalada, resolvida
    prioridad VARCHAR(50) DEFAULT 'normal', -- baja, normal, alta, urgente
    sentiment_general VARCHAR(50), -- positivo, neutral, negativo, frustrado
    satisfaction_score INTEGER, -- 1-5
    escalado_a_humano BOOLEAN DEFAULT false,
    agente_humano_id UUID REFERENCES profiles(id),
    resolvida BOOLEAN DEFAULT false,
    tiempo_respuesta_promedio INTEGER, -- segundos
    total_mensajes INTEGER DEFAULT 0,
    metadatos JSONB DEFAULT '{}'::jsonb,
    fecha_ultimo_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes del chatbot
CREATE TABLE mensajes_chatbot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID NOT NULL REFERENCES conversaciones_chatbot(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    es_usuario BOOLEAN NOT NULL, -- true si es del usuario, false si es del bot
    tipo_mensaje VARCHAR(50) DEFAULT 'texto', -- texto, imagen, archivo, accion, sugerencia
    sentiment VARCHAR(50), -- positivo, neutral, negativo, frustrado (solo para mensajes del usuario)
    confidence_score DECIMAL(3,2), -- confianza en la respuesta del bot (0.00-1.00)
    intent_detectado VARCHAR(100), -- intención detectada por IA
    entidades_extraidas JSONB DEFAULT '{}'::jsonb,
    respuesta_sugerida TEXT, -- respuesta que el bot consideró
    tiempo_procesamiento INTEGER, -- milisegundos
    adjuntos JSONB DEFAULT '[]'::jsonb,
    metadatos JSONB DEFAULT '{}'::jsonb,
    feedback_util BOOLEAN, -- si el usuario marcó como útil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tickets de soporte
CREATE TABLE tickets_soporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    conversacion_id UUID REFERENCES conversaciones_chatbot(id),
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    numero_ticket VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- bug, feature_request, soporte_tecnico, queja, sugerencia
    prioridad VARCHAR(50) DEFAULT 'normal', -- baja, normal, alta, critica
    estado VARCHAR(50) DEFAULT 'abierto', -- abierto, en_progreso, resuelto, cerrado, cancelado
    asignado_a UUID REFERENCES profiles(id),
    tiempo_respuesta_sla INTEGER, -- minutos según SLA
    tiempo_resolucion_sla INTEGER, -- horas según SLA
    fecha_primera_respuesta TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    satisfaccion_usuario INTEGER, -- 1-5
    comentarios_cierre TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de respuestas del ticket
CREATE TABLE respuestas_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets_soporte(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    es_interno BOOLEAN DEFAULT false, -- nota interna del equipo de soporte
    adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLAS DE INTELIGENCIA ARTIFICIAL
-- =============================================

-- Tabla de alertas de riesgo automatizadas
CREATE TABLE alertas_riesgo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    puesto_trabajo_id UUID REFERENCES puestos_trabajo(id),
    tipo_alerta VARCHAR(100) NOT NULL, -- riesgo_salud, examenes_vencidos, seguimiento_requerido
    severidad VARCHAR(50) NOT NULL, -- baja, media, alta, critica
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    datos_analisis JSONB DEFAULT '{}'::jsonb, -- datos que triggeraron la alerta
    recomendaciones JSONB DEFAULT '[]'::jsonb,
    acciones_sugeridas JSONB DEFAULT '[]'::jsonb,
    algoritmo_usado VARCHAR(100), -- nombre del algoritmo de IA
    confidence_score DECIMAL(3,2), -- confianza en la predicción
    estado VARCHAR(50) DEFAULT 'activa', -- activa, revisada, descartada, resolvida
    revisada_por UUID REFERENCES profiles(id),
    fecha_revision TIMESTAMP WITH TIME ZONE,
    observaciones_revision TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recomendaciones de IA
CREATE TABLE recomendaciones_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id),
    puesto_trabajo_id UUID REFERENCES puestos_trabajo(id),
    evaluacion_riesgo_id UUID REFERENCES evaluaciones_riesgo(id),
    tipo_recomendacion VARCHAR(100) NOT NULL, -- medida_preventiva, examen_adicional, cambio_puesto
    categoria VARCHAR(100) NOT NULL, -- ergonomia, seguridad, higiene, psicosocial
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    justificacion TEXT,
    beneficios_esperados JSONB DEFAULT '[]'::jsonb,
    costo_estimado DECIMAL(10,2),
    tiempo_implementacion INTEGER, -- días estimados
    prioridad VARCHAR(50) DEFAULT 'media', -- baja, media, alta
    factibilidad VARCHAR(50) DEFAULT 'media', -- baja, media, alta
    impacto_esperado VARCHAR(50) DEFAULT 'medio', -- bajo, medio, alto
    algoritmo_usado VARCHAR(100),
    confidence_score DECIMAL(3,2),
    datos_entrada JSONB DEFAULT '{}'::jsonb,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada, implementada
    evaluada_por UUID REFERENCES profiles(id),
    fecha_evaluacion TIMESTAMP WITH TIME ZONE,
    observaciones_evaluacion TEXT,
    fecha_implementacion TIMESTAMP WITH TIME ZONE,
    resultados_implementacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de análisis predictivos
CREATE TABLE analisis_predictivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_analisis VARCHAR(100) NOT NULL, -- riesgo_lesion, absentismo, rotacion, salud_general
    alcance VARCHAR(100) NOT NULL, -- empresa, sede, puesto, individuo
    entidad_id UUID, -- ID de la entidad analizada (empresa, sede, puesto, paciente)
    periodo_analizado VARCHAR(100), -- último_año, últimos_6_meses, etc.
    fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_entrada JSONB NOT NULL, -- datos históricos utilizados
    predicciones JSONB NOT NULL, -- resultados de las predicciones
    metricas_rendimiento JSONB DEFAULT '{}'::jsonb, -- accuracy, precision, recall
    factores_clave JSONB DEFAULT '[]'::jsonb, -- factores más influyentes
    recomendaciones JSONB DEFAULT '[]'::jsonb,
    nivel_confianza DECIMAL(3,2) NOT NULL,
    algoritmo_usado VARCHAR(100) NOT NULL,
    version_modelo VARCHAR(50),
    ejecutado_por UUID REFERENCES profiles(id),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas del chatbot
CREATE TABLE metricas_chatbot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    conversaciones_iniciadas INTEGER DEFAULT 0,
    conversaciones_completadas INTEGER DEFAULT 0,
    mensajes_enviados INTEGER DEFAULT 0,
    mensajes_recibidos INTEGER DEFAULT 0,
    tiempo_respuesta_promedio INTEGER DEFAULT 0, -- milisegundos
    satisfaccion_promedio DECIMAL(3,2),
    consultas_soporte_tecnico INTEGER DEFAULT 0,
    consultas_asistente INTEGER DEFAULT 0,
    consultas_atc INTEGER DEFAULT 0,
    quejas_recibidas INTEGER DEFAULT 0,
    sugerencias_recibidas INTEGER DEFAULT 0,
    escalaciones_humano INTEGER DEFAULT 0,
    resoluciones_automaticas INTEGER DEFAULT 0,
    intents_no_reconocidos INTEGER DEFAULT 0,
    usuarios_unicos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLAS DE CONFIGURACIÓN IA
-- =============================================

-- Tabla de configuración del chatbot por empresa
CREATE TABLE configuracion_chatbot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    habilitado BOOLEAN DEFAULT true,
    idioma VARCHAR(10) DEFAULT 'es',
    tono_conversacion VARCHAR(50) DEFAULT 'profesional', -- formal, profesional, amigable
    horario_atencion JSONB DEFAULT '{}'::jsonb, -- horarios de disponibilidad
    escalacion_automatica BOOLEAN DEFAULT true,
    tiempo_escalacion_minutos INTEGER DEFAULT 30,
    mensaje_bienvenida TEXT,
    mensaje_despedida TEXT,
    preguntas_frecuentes JSONB DEFAULT '[]'::jsonb,
    respuestas_personalizadas JSONB DEFAULT '{}'::jsonb,
    integraciones_activas JSONB DEFAULT '[]'::jsonb,
    configuracion_ia JSONB DEFAULT '{}'::jsonb,
    branding JSONB DEFAULT '{}'::jsonb, -- colores, logo personalizado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX idx_base_conocimiento_categoria ON base_conocimiento(categoria);
CREATE INDEX idx_base_conocimiento_empresa ON base_conocimiento(empresa_id);
CREATE INDEX idx_conversaciones_usuario ON conversaciones_chatbot(user_id);
CREATE INDEX idx_conversaciones_empresa ON conversaciones_chatbot(empresa_id);
CREATE INDEX idx_conversaciones_session ON conversaciones_chatbot(session_id);
CREATE INDEX idx_mensajes_conversacion ON mensajes_chatbot(conversacion_id);
CREATE INDEX idx_tickets_empresa ON tickets_soporte(empresa_id);
CREATE INDEX idx_tickets_usuario ON tickets_soporte(usuario_id);
CREATE INDEX idx_tickets_estado ON tickets_soporte(estado);
CREATE INDEX idx_alertas_empresa ON alertas_riesgo(empresa_id);
CREATE INDEX idx_alertas_paciente ON alertas_riesgo(paciente_id);
CREATE INDEX idx_recomendaciones_empresa ON recomendaciones_ia(empresa_id);
CREATE INDEX idx_analisis_empresa ON analisis_predictivos(empresa_id);
CREATE INDEX idx_metricas_fecha ON metricas_chatbot(fecha);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_base_conocimiento_updated_at BEFORE UPDATE ON base_conocimiento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones_chatbot
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets_soporte
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas_riesgo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recomendaciones_updated_at BEFORE UPDATE ON recomendaciones_ia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_chatbot_updated_at BEFORE UPDATE ON configuracion_chatbot
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCIONES AUXILIARES PARA IA
-- =============================================

-- Función para calcular score de riesgo
CREATE OR REPLACE FUNCTION calcular_score_riesgo(paciente_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
AS $$
DECLARE
    score DECIMAL(3,2) := 0.0;
    examenes_vencidos INTEGER;
    incapacidades_recientes INTEGER;
    edad INTEGER;
    puesto_riesgo VARCHAR(50);
BEGIN
    -- Obtener edad del paciente
    SELECT EXTRACT(YEAR FROM AGE(fecha_nacimiento)) INTO edad
    FROM pacientes WHERE id = paciente_uuid;
    
    -- Contar exámenes vencidos
    SELECT COUNT(*) INTO examenes_vencidos
    FROM examenes_ocupacionales
    WHERE paciente_id = paciente_uuid 
    AND fecha_vigencia < CURRENT_DATE
    AND estado = 'completado';
    
    -- Contar incapacidades últimos 12 meses
    SELECT COUNT(*) INTO incapacidades_recientes
    FROM incapacidades_laborales
    WHERE paciente_id = paciente_uuid 
    AND fecha_inicio >= CURRENT_DATE - INTERVAL '12 months';
    
    -- Obtener nivel de riesgo del puesto
    SELECT pt.nivel_riesgo INTO puesto_riesgo
    FROM pacientes p
    JOIN puestos_trabajo pt ON p.puesto_trabajo_id = pt.id
    WHERE p.id = paciente_uuid;
    
    -- Calcular score base
    score := 0.3; -- score base
    
    -- Ajustar por edad
    IF edad > 50 THEN score := score + 0.2; END IF;
    IF edad > 60 THEN score := score + 0.3; END IF;
    
    -- Ajustar por exámenes vencidos
    score := score + (examenes_vencidos * 0.15);
    
    -- Ajustar por incapacidades
    score := score + (incapacidades_recientes * 0.2);
    
    -- Ajustar por riesgo del puesto
    CASE puesto_riesgo
        WHEN 'critico' THEN score := score + 0.4;
        WHEN 'alto' THEN score := score + 0.3;
        WHEN 'medio' THEN score := score + 0.2;
        WHEN 'bajo' THEN score := score + 0.1;
    END CASE;
    
    -- Limitar score entre 0 y 1
    IF score > 1.0 THEN score := 1.0; END IF;
    IF score < 0.0 THEN score := 0.0; END IF;
    
    RETURN score;
END;
$$;