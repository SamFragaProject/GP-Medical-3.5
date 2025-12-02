-- =============================================
-- ERP MÉDICO - MEDICINA DEL TRABAJO
-- Migración 005: Datos Semilla (Seeds)
-- =============================================

-- =============================================
-- ROLES DEL SISTEMA
-- =============================================

INSERT INTO roles (id, nombre, descripcion, permisos, es_sistema, activo) VALUES
    (uuid_generate_v4(), 'super_admin', 'Super Administrador del sistema SaaS', 
     '["all"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'admin_empresa', 'Administrador de la empresa', 
     '["manage_users", "manage_settings", "view_reports", "manage_billing"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'medico_trabajo', 'Médico del Trabajo', 
     '["view_patients", "manage_exams", "create_certificates", "manage_evaluations", "view_medical_history"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'medico_industrial', 'Médico Industrial', 
     '["view_patients", "manage_exams", "create_certificates", "manage_evaluations", "view_medical_history", "manage_risk_assessments"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'audiometrista', 'Audiometrista', 
     '["view_patients", "manage_audiometry", "create_audio_reports"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'psicologo_laboral', 'Psicólogo Laboral', 
     '["view_patients", "manage_psych_evaluations", "create_psych_reports"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'recepcion', 'Recepcionista', 
     '["manage_appointments", "view_patients", "patient_checkin"]'::jsonb, true, true),
    
    (uuid_generate_v4(), 'paciente', 'Paciente/Empleado', 
     '["view_own_history", "view_own_exams", "view_appointments"]'::jsonb, true, true);

-- =============================================
-- PLANES DE SUSCRIPCIÓN
-- =============================================

INSERT INTO planes_suscripcion (id, nombre, descripcion, precio_mensual, precio_anual, 
                                limite_usuarios, limite_pacientes, limite_consultas_mes, 
                                limite_almacenamiento_gb, incluye_chatbot, incluye_ia_predictiva, 
                                incluye_integraciones, incluye_whitelabel, incluye_api_publica, 
                                caracteristicas) VALUES
    
    (uuid_generate_v4(), 'Básico', 'Plan básico para pequeñas empresas', 
     499.00, 4990.00, 5, 100, 50, 5, true, false, false, false, false,
     '["Gestión de pacientes", "Exámenes básicos", "Agenda de citas", "Reportes básicos", "Chatbot básico"]'::jsonb),
    
    (uuid_generate_v4(), 'Profesional', 'Plan profesional para empresas medianas', 
     999.00, 9990.00, 25, 500, 200, 25, true, true, true, false, false,
     '["Todo del plan Básico", "IA Predictiva", "Evaluaciones de riesgo avanzadas", "Integraciones IMSS", "Certificaciones digitales", "Análisis avanzados"]'::jsonb),
    
    (uuid_generate_v4(), 'Enterprise', 'Plan empresarial para grandes corporaciones', 
     2499.00, 24990.00, null, null, null, 100, true, true, true, true, true,
     '["Todo del plan Profesional", "Usuarios ilimitados", "Pacientes ilimitados", "Whitelabel completo", "API pública", "Soporte 24/7", "Auditorías de cumplimiento", "Integraciones personalizadas"]'::jsonb),
    
    (uuid_generate_v4(), 'Trial', 'Prueba gratuita por 30 días', 
     0.00, 0.00, 3, 25, 25, 1, true, false, false, false, false,
     '["Acceso limitado", "Funcionalidades básicas", "Soporte por email"]'::jsonb);

-- =============================================
-- BASE DE CONOCIMIENTO PARA CHATBOT
-- =============================================

-- Conocimiento sobre Medicina del Trabajo
INSERT INTO base_conocimiento (titulo, contenido, categoria, subcategoria, tags, palabras_clave, rol_objetivo) VALUES

('¿Qué son los exámenes ocupacionales?', 
'Los exámenes ocupacionales son evaluaciones médicas especializadas que se realizan a los trabajadores para determinar su aptitud física y mental para desempeñar un puesto de trabajo específico. Se clasifican en: 1) Examen de ingreso (pre-empleo), 2) Exámenes periódicos, 3) Examen de egreso, 4) Exámenes especiales por cambio de puesto o exposición a riesgos.', 
'medicina_trabajo', 'examenes_ocupacionales', 
'["examenes", "ocupacionales", "medicina trabajo", "aptitud"]'::jsonb,
'["examen ocupacional", "aptitud médica", "medicina del trabajo", "evaluación médica"]'::jsonb,
'medico_trabajo'),

('Normativas mexicanas en medicina del trabajo',
'Las principales normativas que rigen la medicina del trabajo en México son: NOM-006-STPS-2014 (Manejo y almacenamiento de materiales), NOM-017-STPS-2008 (Equipo de protección personal), NOM-030-STPS-2009 (Servicios preventivos de seguridad), OSHA mexicana. Estas normas establecen los requisitos mínimos para la protección de la salud de los trabajadores.',
'normativas', 'mexico',
'["normativas", "mexico", "NOM", "STPS", "OSHA"]'::jsonb,
'["NOM-006-STPS", "NOM-017-STPS", "normativas mexicanas", "medicina ocupacional"]'::jsonb,
'medico_trabajo'),

('¿Cómo programar una cita en el sistema?',
'Para programar una cita: 1) Ve al módulo "Agenda & Citas", 2) Haz clic en "Nueva Cita", 3) Selecciona el paciente, 4) Elige el tipo de examen, 5) Selecciona fecha y hora disponible, 6) Confirma la cita. El sistema enviará recordatorios automáticos al paciente.',
'soporte_tecnico', 'agenda',
'["citas", "agenda", "programar", "tutorial"]'::jsonb,
'["programar cita", "agenda médica", "cita médica", "sistema citas"]'::jsonb,
'recepcion'),

('Evaluaciones de riesgo laboral',
'Las evaluaciones de riesgo son análisis sistemáticos de los factores de riesgo presentes en los puestos de trabajo. Incluyen: evaluación ergonómica, medición de factores ambientales (ruido, iluminación, temperatura), identificación de riesgos químicos, físicos y biológicos, y propuesta de medidas preventivas y correctivas.',
'medicina_trabajo', 'evaluacion_riesgo',
'["evaluacion", "riesgo", "laboral", "ergonomia"]'::jsonb,
'["evaluación de riesgo", "riesgo laboral", "ergonomía", "factores de riesgo"]'::jsonb,
'medico_industrial'),

('¿Qué incluye el plan Profesional?',
'El plan Profesional incluye: Hasta 25 usuarios, 500 pacientes, 200 consultas/mes, 25GB almacenamiento, IA Predictiva activada, Evaluaciones de riesgo avanzadas, Integraciones con IMSS, Certificaciones digitales, Análisis avanzados, y Chatbot inteligente. Precio: $999 MXN/mes.',
'atc_comercial', 'planes',
'["plan", "profesional", "precio", "caracteristicas"]'::jsonb,
'["plan profesional", "suscripción", "precio", "características"]'::jsonb,
'admin_empresa'),

('Tipos de incapacidades laborales',
'Las incapacidades laborales se clasifican en: 1) Enfermedad general (EG) - no relacionada con el trabajo, 2) Riesgo de trabajo (RT) - causada por accidente laboral o enfermedad profesional, 3) Maternidad (M) - por embarazo y parto. Cada tipo tiene diferentes porcentajes de pago y responsabilidades.',
'medicina_trabajo', 'incapacidades',
'["incapacidades", "laborales", "IMSS", "tipos"]'::jsonb,
'["incapacidad laboral", "riesgo trabajo", "enfermedad general", "IMSS"]'::jsonb,
'medico_trabajo'),

('¿Cómo funciona el chatbot superinteligente?',
'El chatbot superinteligente está siempre disponible en la esquina inferior derecha. Funciona como: 1) Soporte técnico - ayuda con el uso del sistema, 2) Asistente contextual - guía según tu rol y página actual, 3) ATC comercial - explica planes y funcionalidades, 4) Sistema de quejas - recopila feedback. Usa IA avanzada para respuestas personalizadas.',
'soporte_tecnico', 'chatbot',
'["chatbot", "ia", "asistente", "soporte"]'::jsonb,
'["chatbot inteligente", "asistente virtual", "soporte automático", "IA conversacional"]'::jsonb,
'todos'),

('Audiometrías ocupacionales',
'La audiometría ocupacional es un examen especializado para evaluar la capacidad auditiva de los trabajadores expuestos a ruido. Se realiza al ingreso, periódicamente según exposición, y al egreso. Detecta hipoacusia ocupacional temprana y permite implementar medidas preventivas como protección auditiva.',
'medicina_trabajo', 'audiometria',
'["audiometria", "ruido", "hipoacusia", "ocupacional"]'::jsonb,
'["audiometría ocupacional", "pérdida auditiva", "ruido laboral", "protección auditiva"]'::jsonb,
'audiometrista'),

('¿Cómo generar certificados médicos?',
'Para generar certificados: 1) Ve al expediente del paciente, 2) Selecciona el examen completado, 3) Haz clic en "Generar Certificado", 4) Revisa los datos y conclusiones, 5) Agrega observaciones si es necesario, 6) Firma digitalmente, 7) El certificado se genera en PDF con validación digital.',
'soporte_tecnico', 'certificados',
'["certificados", "generar", "firma", "digital"]'::jsonb,
'["certificado médico", "firma digital", "generar certificado", "documento médico"]'::jsonb,
'medico_trabajo');

-- Conocimiento sobre funcionalidades del sistema
INSERT INTO base_conocimiento (titulo, contenido, categoria, subcategoria, tags, palabras_clave) VALUES

('Error: No puedo acceder al módulo',
'Si no puedes acceder a un módulo específico, verifica: 1) Tu rol tiene los permisos necesarios, 2) Tu suscripción incluye esa funcionalidad, 3) No has excedido los límites de tu plan. Contacta al administrador de tu empresa para revisar permisos.',
'soporte_tecnico', 'permisos',
'["error", "acceso", "permisos", "modulo"]'::jsonb,
'["no puedo acceder", "error permisos", "acceso denegado", "módulo bloqueado"]'::jsonb),

('¿Cómo actualizar mi perfil?',
'Para actualizar tu perfil: 1) Haz clic en tu avatar (esquina superior derecha), 2) Selecciona "Mi Perfil", 3) Edita los campos necesarios, 4) Guarda los cambios. Puedes actualizar: datos personales, foto de perfil, contraseña, y preferencias del sistema.',
'soporte_tecnico', 'perfil',
'["perfil", "actualizar", "datos", "personales"]'::jsonb,
'["actualizar perfil", "cambiar datos", "mi perfil", "configuración personal"]'::jsonb),

('Límites del plan y facturación',
'Cada plan tiene límites específicos: usuarios, pacientes, consultas/mes, almacenamiento. Puedes ver tu uso actual en "Configuración > Facturación". Si excedes los límites, el sistema te notificará y podrás upgradear tu plan. La facturación es automática según tu ciclo de pago.',
'atc_comercial', 'facturacion',
'["limites", "plan", "facturacion", "upgrade"]'::jsonb,
'["límites del plan", "facturación automática", "upgrade plan", "exceder límites"]'::jsonb);

-- =============================================
-- PROTOCOLOS MÉDICOS ESTÁNDAR
-- =============================================

INSERT INTO protocolos_medicos (id, empresa_id, nombre, tipo, descripcion, examenes_incluidos, 
                                normativas, vigencia_meses, requisitos) VALUES

(uuid_generate_v4(), NULL, 'Protocolo Ingreso Administrativo', 'ingreso',
'Protocolo estándar para personal administrativo sin exposición a riesgos especiales',
'["historia_clinica", "examen_fisico", "agudeza_visual", "biometria_hematica", "quimica_sanguinea", "examen_orina"]'::jsonb,
'["NOM-030-STPS-2009"]'::jsonb, 12,
'Puesto de trabajo de bajo riesgo, sin exposición a agentes químicos o físicos'),

(uuid_generate_v4(), NULL, 'Protocolo Ingreso Industrial', 'ingreso',
'Protocolo para trabajadores con exposición a riesgos industriales',
'["historia_clinica", "examen_fisico", "agudeza_visual", "audiometria", "espirometria", "radiografia_torax", "biometria_hematica", "quimica_sanguinea", "examen_orina", "pruebas_hepaticas"]'::jsonb,
'["NOM-030-STPS-2009", "NOM-006-STPS-2014"]'::jsonb, 12,
'Puesto con exposición a ruido, químicos o material particulado'),

(uuid_generate_v4(), NULL, 'Protocolo Periódico Estándar', 'periodico',
'Protocolo de vigilancia médica periódica general',
'["historia_clinica", "examen_fisico", "agudeza_visual", "biometria_hematica", "quimica_sanguinea"]'::jsonb,
'["NOM-030-STPS-2009"]'::jsonb, 12,
'Trabajadores sin exposición a riesgos específicos'),

(uuid_generate_v4(), NULL, 'Protocolo Egreso Completo', 'egreso',
'Protocolo completo para trabajadores al terminar relación laboral',
'["historia_clinica", "examen_fisico", "agudeza_visual", "audiometria", "espirometria", "radiografia_torax", "biometria_hematica", "quimica_sanguinea", "examen_orina"]'::jsonb,
'["NOM-030-STPS-2009"]'::jsonb, 0,
'Evaluación integral del estado de salud al egreso');

-- =============================================
-- CONFIGURACIONES INICIALES
-- =============================================

-- Configuración inicial del chatbot (global)
INSERT INTO configuracion_chatbot (id, empresa_id, habilitado, idioma, tono_conversacion, 
                                  mensaje_bienvenida, mensaje_despedida, preguntas_frecuentes) VALUES
(uuid_generate_v4(), NULL, true, 'es', 'profesional',
'¡Hola! Soy tu asistente inteligente de MediFlow. ¿En qué puedo ayudarte hoy?',
'Gracias por usar MediFlow. ¡Que tengas un excelente día!',
'[
    {"pregunta": "¿Cómo programo una cita?", "categoria": "agenda"},
    {"pregunta": "¿Cómo genero un certificado?", "categoria": "certificados"},
    {"pregunta": "¿Qué incluye mi plan?", "categoria": "comercial"},
    {"pregunta": "¿Cómo actualizo mi perfil?", "categoria": "perfil"},
    {"pregunta": "¿Qué es un examen ocupacional?", "categoria": "medicina"}
]'::jsonb);

-- =============================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =============================================

-- Índices para búsqueda en base de conocimiento
CREATE INDEX idx_base_conocimiento_texto ON base_conocimiento USING gin(to_tsvector('spanish', titulo || ' ' || contenido));
CREATE INDEX idx_base_conocimiento_tags ON base_conocimiento USING gin(tags);
CREATE INDEX idx_base_conocimiento_palabras_clave ON base_conocimiento USING gin(palabras_clave);

-- Índices para métricas y reportes
CREATE INDEX idx_examenes_fecha_realizada ON examenes_ocupacionales(fecha_realizada);
CREATE INDEX idx_examenes_tipo ON examenes_ocupacionales(tipo_examen);
CREATE INDEX idx_incapacidades_fecha_inicio ON incapacidades_laborales(fecha_inicio);
CREATE INDEX idx_evaluaciones_fecha ON evaluaciones_riesgo(fecha_evaluacion);

-- =============================================
-- VIEWS PARA REPORTES COMUNES
-- =============================================

-- Vista para dashboard principal
CREATE VIEW vista_dashboard_empresa AS
SELECT 
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    COUNT(DISTINCT p.id) as total_pacientes,
    COUNT(DISTINCT ex.id) FILTER (WHERE ex.fecha_realizada >= CURRENT_DATE - INTERVAL '30 days') as examenes_ultimo_mes,
    COUNT(DISTINCT il.id) FILTER (WHERE il.fecha_inicio >= CURRENT_DATE - INTERVAL '30 days') as incapacidades_ultimo_mes,
    COUNT(DISTINCT c.id) FILTER (WHERE c.fecha_hora >= CURRENT_DATE) as citas_programadas,
    COUNT(DISTINCT er.id) FILTER (WHERE er.fecha_evaluacion >= CURRENT_DATE - INTERVAL '90 days') as evaluaciones_ultimo_trimestre
FROM empresas e
LEFT JOIN pacientes p ON e.id = p.empresa_id
LEFT JOIN examenes_ocupacionales ex ON p.id = ex.paciente_id
LEFT JOIN incapacidades_laborales il ON p.id = il.paciente_id
LEFT JOIN citas_examenes c ON p.id = c.paciente_id
LEFT JOIN evaluaciones_riesgo er ON e.id = er.empresa_id
GROUP BY e.id, e.nombre;

-- Vista para pacientes con exámenes vencidos
CREATE VIEW vista_examenes_vencidos AS
SELECT 
    p.empresa_id,
    p.id as paciente_id,
    p.nombre || ' ' || p.apellido_paterno as paciente_nombre,
    p.numero_empleado,
    pt.nombre as puesto_trabajo,
    ex.fecha_vigencia,
    ex.tipo_examen,
    CURRENT_DATE - ex.fecha_vigencia as dias_vencido
FROM pacientes p
JOIN examenes_ocupacionales ex ON p.id = ex.paciente_id
LEFT JOIN puestos_trabajo pt ON p.puesto_trabajo_id = pt.id
WHERE ex.fecha_vigencia < CURRENT_DATE
AND ex.estado = 'completado'
AND p.estatus = 'activo';

-- Comentarios en tablas para documentación
COMMENT ON TABLE empresas IS 'Tabla principal de empresas (tenants) del sistema SaaS';
COMMENT ON TABLE pacientes IS 'Trabajadores/empleados que reciben atención médica ocupacional';
COMMENT ON TABLE examenes_ocupacionales IS 'Registro de exámenes médicos ocupacionales realizados';
COMMENT ON TABLE conversaciones_chatbot IS 'Conversaciones del chatbot superinteligente con usuarios';
COMMENT ON TABLE base_conocimiento IS 'Base de conocimiento para respuestas automáticas del chatbot';
COMMENT ON FUNCTION calcular_score_riesgo IS 'Función para calcular score de riesgo de un paciente usando IA';