/**
 * Paciente Demo Completo — GPMedical ERP
 *
 * Contiene toda la información que se requiere para demostrar
 * el Expediente Clínico Electrónico (ECE):
 * - Datos personales
 * - APNP (Antecedentes Personales No Patológicos)
 * - AHF (Antecedentes Heredofamiliares)
 * - Historia Ocupacional con riesgos y exposiciones
 * - Exploración Física estructurada (SV, IMC, neuro, musculoesquelético)
 * - Consentimientos Informados (firma digital)
 * - Antecedentes por empresa/puesto
 * - Notas Médicas con versionado (auditoría legal)
 */

// =====================================================
// DATOS PERSONALES DEL PACIENTE DEMO
// =====================================================
export const PACIENTE_DEMO = {
    id: 'demo-ecr-001',
    numero_empleado: 'EMP-2024-0001',
    nombre: 'Carlos Eduardo',
    apellido_paterno: 'Ríos',
    apellido_materno: 'Velázquez',
    genero: 'masculino',
    fecha_nacimiento: '1987-06-15',
    email: 'carlos.rios@industriasmx.com',
    telefono: '(55) 1234-5678',
    celular: '(55) 9012-3456',
    curp: 'RIVC870615HDFLN09',
    rfc: 'RIVC870615AB1',
    nss: '87654321012',
    tipo_sangre: 'A+',
    estado_civil: 'Casado',
    escolaridad: 'Licenciatura en Ingeniería Industrial',
    religion: 'Católica',
    lugar_nacimiento: 'Ciudad de México',
    direccion: 'Av. Revolución 1520, Col. San Ángel, Álvaro Obregón',
    ciudad: 'Ciudad de México',
    cp: '01000',
    estatus: 'activo',
    puesto: 'Supervisor de Producción',
    area: 'Producción',
    departamento: 'Línea de Ensamble',
    turno: 'Matutino (6:00 - 14:00)',
    fecha_ingreso: '2019-03-01',
    antiguedad: '5 años 11 meses',
    contacto_emergencia: 'María Elena Velázquez',
    telefono_emergencia: '(55) 3456-7890',
    parentesco_emergencia: 'Esposa',
    sede_nombre: 'Planta Norte',
    empresa_nombre: 'Industrias MX S.A. de C.V.',
    foto_url: '',
    alergias: 'Penicilina (Rash cutáneo), Ácaros (Rinitis alérgica)',
    enfermedades_cronicas: 'Hipertensión arterial sistémica controlada',
    discapacidad: 'Ninguna',
    signosVitales: {
        presion: '128/82',
        pulso: '74',
        temperatura: '36.4',
        oximetria: '97',
    },
};

// =====================================================
// APNP — Antecedentes Personales No Patológicos
// =====================================================
export const APNP_DEMO = {
    id: 'demo-apnp-001',
    expediente_id: 'demo-exp-001',
    // Tabaco
    tabaco: true,
    tabaco_cantidad: '5 cigarrillos/día',
    tabaco_tiempo: '12 años (dejó hace 2 años)',
    tabaco_frecuencia: 'Ex-fumador',
    // Alcohol
    alcohol: true,
    alcohol_frecuencia: 'Social, 2-3 veces/mes',
    alcohol_cantidad: '3-4 cervezas por ocasión',
    // Drogas
    drogas: false,
    drogas_tipo: 'Negado',
    // Ejercicio
    ejercicio: true,
    ejercicio_frecuencia: '3 veces por semana',
    ejercicio_tipo: 'Caminata 30 min y pesas ligeras',
    // Sueño
    sueno_horas: 6.5,
    sueno_calidad: 'Regular — Insomnio ocasional por turnos rotativos',
    // Alimentación
    alimentacion_tipo: 'Dieta mixta, baja en sal por hipertensión. Consume 3 comidas al día con colaciones.',
    // Café
    cafe: true,
    cafe_tazas_diarias: 3,
    // Otros hábitos
    otros_habitos: 'No consume refrescos. Toma 2 litros de agua diarios.',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2025-01-10T14:30:00Z',
};

// =====================================================
// AHF — Antecedentes Heredofamiliares
// =====================================================
export const AHF_DEMO = {
    id: 'demo-ahf-001',
    expediente_id: 'demo-exp-001',
    diabetes: true,
    diabetes_quien: 'Padre — DM2, diagnosticado a los 52 años',
    hipertension: true,
    hipertension_quien: 'Madre — HTA, tratamiento con Losartán',
    cancer: true,
    cancer_tipo: 'Cáncer de próstata',
    cancer_quien: 'Abuelo paterno — fallecido a los 78 años',
    cardiopatias: true,
    cardiopatias_quien: 'Tío paterno — IAM a los 60 años',
    enfermedades_mentales: false,
    enfermedades_mentales_quien: '',
    enfermedades_respiratorias: false,
    enfermedades_respiratorias_quien: '',
    otros: 'Abuela materna — Artritis reumatoide. Hermano mayor — Asma bronquial.',
    created_at: '2024-03-15T10:15:00Z',
    updated_at: '2025-01-10T14:35:00Z',
};

// =====================================================
// HISTORIA OCUPACIONAL (múltiples empresas/puestos)
// =====================================================
export const HISTORIA_OCUPACIONAL_DEMO = [
    {
        id: 'demo-ho-001',
        expediente_id: 'demo-exp-001',
        empresa_anterior: 'Metalúrgica del Norte S.A.',
        puesto: 'Operador de Torno CNC',
        antiguedad: '4 años',
        fecha_inicio: '2013-06-01',
        fecha_fin: '2017-05-31',
        riesgos_fisicos: 'Ruido >85 dB(A), Vibraciones mano-brazo, Temperaturas extremas',
        riesgos_quimicos: 'Aceite de corte (exposición dérmica), Humos metálicos',
        riesgos_biologicos: 'No aplica',
        riesgos_ergonomicos: 'Bipedestación prolongada, Movimientos repetitivos de muñeca y antebrazo',
        riesgos_psicosociales: 'Jornadas extendidas (hasta 12h), Rotación de turnos',
        exposiciones: 'Ruido industrial continuo, Partículas metálicas suspendidas, Aceites minerales',
        epp_utilizado: 'Tapones auditivos, Guantes de nitrilo, Lentes de seguridad, Zapato industrial',
        epp_adecuado: true,
        accidentes_laborales: 'Laceración superficial mano derecha (2015) — incapacidad 5 días',
        enfermedades_laborales: 'Hipoacusia leve bilateral (diagnosticada 2017)',
        incapacidades: '5 días por accidente (2015), 0 por enfermedad laboral',
        motivo_separacion: 'Renuncia voluntaria — mejor oportunidad laboral',
        created_at: '2024-03-15T10:30:00Z',
        updated_at: '2024-03-15T10:30:00Z',
    },
    {
        id: 'demo-ho-002',
        expediente_id: 'demo-exp-001',
        empresa_anterior: 'Automotriz Continental MX',
        puesto: 'Técnico de Calidad',
        antiguedad: '2 años',
        fecha_inicio: '2017-07-01',
        fecha_fin: '2019-02-28',
        riesgos_fisicos: 'Ruido moderado (75-80 dB), Iluminación artificial continua',
        riesgos_quimicos: 'Solventes de limpieza (exposición mínima)',
        riesgos_biologicos: 'No aplica',
        riesgos_ergonomicos: 'Uso prolongado de microscopio, Postura sedente-bipedeste alternante',
        riesgos_psicosociales: 'Metas de producción exigentes, Presión por indicadores de calidad',
        exposiciones: 'Solventes orgánicos (baja concentración)',
        epp_utilizado: 'Bata antiestática, Guantes de látex, Lentes de seguridad, Zapato dieléctrico',
        epp_adecuado: true,
        accidentes_laborales: 'Ninguno',
        enfermedades_laborales: 'Ninguna diagnosticada',
        incapacidades: '0 días',
        motivo_separacion: 'Renuncia voluntaria — promoción a supervisor en empresa actual',
        created_at: '2024-03-15T10:45:00Z',
        updated_at: '2024-03-15T10:45:00Z',
    },
    {
        id: 'demo-ho-003',
        expediente_id: 'demo-exp-001',
        empresa_anterior: 'Industrias MX S.A. de C.V. (Actual)',
        puesto: 'Supervisor de Producción',
        antiguedad: '5 años 11 meses',
        fecha_inicio: '2019-03-01',
        fecha_fin: undefined,
        riesgos_fisicos: 'Ruido 80-85 dB(A), Iluminación mixta, Temperaturas variables (22-35°C)',
        riesgos_quimicos: 'Adhesivos industriales, Barnices, Tintas UV (exposición indirecta)',
        riesgos_biologicos: 'No aplica',
        riesgos_ergonomicos: 'Bipedestación prolongada, Caminata continua en planta (>8,000 pasos/día), Uso de computadora en oficina 30% del turno',
        riesgos_psicosociales: 'Liderazgo de equipo (18 personas), Presión por cumplimiento de órdenes de producción, Disponibilidad para turnos extraordinarios',
        exposiciones: 'Ruido industrial intermitente, Partículas en suspensión (área de barnizado)',
        epp_utilizado: 'Orejeras 3M Peltor, Respirador N95, Lentes de seguridad, Casco, Zapato dieléctrico, Chaleco de alta visibilidad',
        epp_adecuado: true,
        accidentes_laborales: 'Ninguno desde ingreso',
        enfermedades_laborales: 'En seguimiento: Hipoacusia bilateral leve preexistente',
        incapacidades: '3 días por COVID (2022)',
        motivo_separacion: undefined,
        created_at: '2024-03-15T11:00:00Z',
        updated_at: '2025-02-01T09:00:00Z',
    },
];

// =====================================================
// EXPLORACIÓN FÍSICA ESTRUCTURADA (últimas 3)
// =====================================================
export const EXPLORACION_FISICA_DEMO = [
    {
        id: 'demo-ef-003',
        expediente_id: 'demo-exp-001',
        consulta_id: 'demo-consulta-005',
        fecha_exploracion: '2025-02-10',
        // Signos vitales
        fc: 74,
        fr: 16,
        ta_sistolica: 128,
        ta_diastolica: 82,
        temperatura: 36.4,
        spo2: 97,
        glucosa: 96,
        // Somatometría
        peso_kg: 82.5,
        talla_cm: 175,
        imc: 26.94, // Sobrepeso
        cintura_cm: 94,
        cadera_cm: 100,
        icc: 0.94,
        // Exploración por aparatos y sistemas
        aspecto_general: 'Paciente masculino de edad aparente acorde a la cronológica, orientado en las tres esferas, hábito constitucional mesomorfo.',
        estado_general: 'Bueno',
        piel: 'Morena clara, hidratada, sin lesiones activas. Cicatriz lineal de 3 cm en dorso de mano derecha (accidente laboral previo).',
        cabeza: 'Normocéfala, sin exostosis, cabello con implantación normal.',
        ojos: 'Pupilas isocóricas y normorreflécticas. Conjuntivas rosadas. Agudeza visual: OD 20/25, OI 20/20.',
        oidos: 'Conductos auditivos permeables. Membranas timpánicas íntegras. Weber central. Rinne positivo bilateral.',
        nariz: 'Tabique nasal central. Mucosa nasal hidratada, sin pólipos.',
        boca: 'Mucosas orales húmedas, úvula central, orofaringe sin hiperemia. Dentición completa con obturaciones previas.',
        cuello: 'Cilíndrico, sin adenomegalias, tiroides no palpable, pulsos carotídeos simétricos, sin soplos.',
        torax: 'Simétrico, movimientos respiratorios normales. Ruidos respiratorios sin estertores ni sibilancias.',
        abdomen: 'Globoso a expensas de panículo adiposo, blando, depresible, no doloroso, peristaltismo presente, sin visceromegalias.',
        columna: 'Alineada, sin dolor a la palpación, movilidad conservada en todos los segmentos. Pruebas de Schober y Adams negativos.',
        extremidades_superiores: 'Simétricas, fuerza 5/5 bilateral, reflejos bicipital y tricipital ++/++++. Maniobra de Phalen negativa bilateral. Tinel negativo bilateral.',
        extremidades_inferiores: 'Simétricas, pulsos pedios presentes, sin edema, Lásségue negativo bilateral, fuerza 5/5.',
        // Neurológico
        neurologico: 'Funciones mentales superiores conservadas. Pares craneales sin alteraciones. Sensibilidad superficial y profunda intactas.',
        reflejos: 'Osteotendinosos ++/++++ simétricos. Cutáneo-plantares flexores bilateral.',
        coordinacion: 'Prueba dedo-nariz y talón-rodilla normales. Romberg negativo.',
        marcha: 'Normal, tandem sin alteraciones.',
        // Psicológico
        estado_mental: 'Orientado en tiempo, espacio y persona. Sin datos de ansiedad o depresión aparentes.',
        orientacion: 'Conservada en las tres esferas',
        lenguaje: 'Fluido, coherente, sin parafasias',
        memoria: 'Inmediata, reciente y remota conservadas',
        // Musculoesquelético detallado
        osteomuscular_detalle: 'Hombros: ROM completo sin dolor. Codos: extensión/flexión completa. Muñecas: flexión/extensión 80°/70° bilateral. Rodillas: estables, sin crepitación, ROM 0-135°. Tobillos: sin inestabilidad.',
        hallazgos_relevantes: 'Sobrepeso (IMC 26.94). HTA controlada. Hipoacusia leve bilateral preexistente. Cicatriz en mano derecha sin limitación funcional.',
        created_at: '2025-02-10T08:30:00Z',
        updated_at: '2025-02-10T08:30:00Z',
    },
    {
        id: 'demo-ef-002',
        expediente_id: 'demo-exp-001',
        consulta_id: 'demo-consulta-003',
        fecha_exploracion: '2024-08-15',
        fc: 78,
        fr: 17,
        ta_sistolica: 132,
        ta_diastolica: 86,
        temperatura: 36.5,
        spo2: 96,
        glucosa: 102,
        peso_kg: 84.0,
        talla_cm: 175,
        imc: 27.43,
        cintura_cm: 96,
        cadera_cm: 101,
        icc: 0.95,
        aspecto_general: 'Mesomorfo, cooperador, buena coloración.',
        estado_general: 'Bueno',
        piel: 'Sin lesiones nuevas.',
        columna: 'Dolor leve a palpación en L4-L5, movilidad conservada.',
        extremidades_superiores: 'Sin limitaciones funcionales.',
        extremidades_inferiores: 'Sin alteraciones.',
        neurologico: 'Dentro de parámetros normales.',
        hallazgos_relevantes: 'Sobrepeso en aumento. TA ligeramente elevada — ajuste de tratamiento recomendado. Dolor lumbar mecánico leve.',
        created_at: '2024-08-15T09:00:00Z',
        updated_at: '2024-08-15T09:00:00Z',
    },
    {
        id: 'demo-ef-001',
        expediente_id: 'demo-exp-001',
        consulta_id: 'demo-consulta-001',
        fecha_exploracion: '2024-03-15',
        fc: 72,
        fr: 16,
        ta_sistolica: 126,
        ta_diastolica: 80,
        temperatura: 36.6,
        spo2: 98,
        glucosa: 92,
        peso_kg: 81.0,
        talla_cm: 175,
        imc: 26.45,
        cintura_cm: 92,
        cadera_cm: 99,
        icc: 0.93,
        aspecto_general: 'Examen de ingreso/periódico. Paciente en buen estado general.',
        estado_general: 'Bueno',
        piel: 'Sin alteraciones.',
        columna: 'Sin hallazgos.',
        neurologico: 'Normal.',
        hallazgos_relevantes: 'Sobrepeso limítrofe. TA controlada con medicamento. Sin otros hallazgos.',
        created_at: '2024-03-15T09:00:00Z',
        updated_at: '2024-03-15T09:00:00Z',
    },
];

// =====================================================
// CONSENTIMIENTOS INFORMADOS CON FIRMA DIGITAL
// =====================================================
export const CONSENTIMIENTOS_DEMO = [
    {
        id: 'demo-consent-001',
        expediente_id: 'demo-exp-001',
        paciente_id: 'demo-ecr-001',
        tipo: 'prestacion_servicios' as const,
        titulo: 'Consentimiento Informado para Examen Médico Ocupacional',
        contenido: 'Yo, Carlos Eduardo Ríos Velázquez, autorizo a MediFlow / GPMedical para que me realice los exámenes médicos ocupacionales incluyendo exploración física, audiometría, espirometría y exámenes de laboratorio.',
        version: '2.1',
        firmado: true,
        firma_digital_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XS...',
        firmante_nombre: 'Carlos Eduardo Ríos Velázquez',
        fecha_firma: '2024-03-15T10:20:00Z',
        testigo_nombre: 'Dra. Patricia Góngora Mendez',
        ip_firma: '192.168.1.45',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0',
        created_at: '2024-03-15T10:15:00Z',
        updated_at: '2024-03-15T10:20:00Z',
    },
    {
        id: 'demo-consent-002',
        expediente_id: 'demo-exp-001',
        paciente_id: 'demo-ecr-001',
        tipo: 'manejo_datos' as const,
        titulo: 'Aviso de Privacidad y Manejo de Datos Personales',
        contenido: 'De conformidad con la LFPDPPP, autorizo el tratamiento de mis datos personales sensibles (historial médico, resultados de laboratorio, estudios de gabinete) para fines de vigilancia de la salud ocupacional.',
        version: '3.0',
        firmado: true,
        firma_digital_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XS...',
        firmante_nombre: 'Carlos Eduardo Ríos Velázquez',
        fecha_firma: '2024-03-15T10:25:00Z',
        testigo_nombre: 'Lic. Administradora de Sede Norte',
        ip_firma: '192.168.1.45',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0',
        created_at: '2024-03-15T10:22:00Z',
        updated_at: '2024-03-15T10:25:00Z',
    },
    {
        id: 'demo-consent-003',
        expediente_id: 'demo-exp-001',
        paciente_id: 'demo-ecr-001',
        tipo: 'procedimientos' as const,
        titulo: 'Consentimiento para Audiometría y Espirometría',
        contenido: 'Autorizo la realización de estudios de audiometría tonal y espirometría forzada, comprendiendo la naturaleza y propósito de dichos procedimientos de diagnóstico.',
        version: '1.2',
        firmado: true,
        firma_digital_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XS...',
        firmante_nombre: 'Carlos Eduardo Ríos Velázquez',
        fecha_firma: '2025-02-10T08:10:00Z',
        testigo_nombre: 'Enf. Laura Mendoza Ruiz',
        ip_firma: '192.168.1.50',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
        created_at: '2025-02-10T08:05:00Z',
        updated_at: '2025-02-10T08:10:00Z',
    },
];

// =====================================================
// NOTAS MÉDICAS VERSIONADAS (Auditoría Legal)
// =====================================================
export interface NotaMedicaVersion {
    id: string;
    nota_id: string;
    version: number;
    fecha: string;
    medico: string;
    cedula: string;
    tipo: 'consulta' | 'nota_evolucion' | 'dictamen' | 'interconsulta' | 'alta' | 'ingreso';
    motivo_consulta: string;
    padecimiento_actual: string;
    diagnostico_cie10: string;
    diagnostico_texto: string;
    plan_tratamiento: string;
    pronostico: string;
    proxima_cita?: string;
    estado: 'vigente' | 'enmendada' | 'cancelada';
    cambio_descripcion?: string;
    created_at: string;
    firma_medico: boolean;
}

export const NOTAS_MEDICAS_DEMO: NotaMedicaVersion[] = [
    // Nota original de ingreso
    {
        id: 'demo-nota-v1',
        nota_id: 'demo-nota-001',
        version: 1,
        fecha: '2024-03-15T11:00:00Z',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        tipo: 'ingreso',
        motivo_consulta: 'Examen médico de ingreso laboral',
        padecimiento_actual: 'Paciente masculino de 36 años que acude por examen médico de ingreso para puesto de Supervisor de Producción. Refiere hipertensión arterial sistémica diagnosticada hace 3 años, actualmente controlada con Losartán 50mg c/24h. Alergia a Penicilina (rash cutáneo). Ex-fumador (dejó hace 2 años). Antecedente de hipoacusia leve bilateral por exposición a ruido industrial.',
        diagnostico_cie10: 'Z02.1',
        diagnostico_texto: 'Examen médico de ingreso laboral. HTA controlada. Hipoacusia preexistente. Sobrepeso.',
        plan_tratamiento: 'Continúa manejo habitual de HTA. Control audiométrico semestral. Plan de alimentación para reducción de peso. Uso obligatorio de protección auditiva.',
        pronostico: 'Favorable para la actividad laboral. Restricción: vigilancia auditiva continua.',
        proxima_cita: '2024-09-15',
        estado: 'vigente',
        created_at: '2024-03-15T11:00:00Z',
        firma_medico: true,
    },
    // Nota de seguimiento periódico
    {
        id: 'demo-nota-v2',
        nota_id: 'demo-nota-002',
        version: 1,
        fecha: '2024-08-15T09:30:00Z',
        medico: 'Dr. Alejandro Fuentes Ríos',
        cedula: 'CED-87654321',
        tipo: 'consulta',
        motivo_consulta: 'Examen médico periódico + dolor lumbar',
        padecimiento_actual: 'Paciente acude para examen periódico programado. Refiere dolor lumbar de 3 semanas de evolución, intermitente, de intensidad 4/10 en EVA, que se exacerba con bipedestación prolongada y carga de objetos. Sin irradiación, sin parestesias. Mejora parcialmente con reposo y antiinflamatorios.',
        diagnostico_cie10: 'M54.5, I10, H90.6',
        diagnostico_texto: 'Lumbalgia mecánica. HTA controlada. Hipoacusia neurosensorial bilateral leve estable. Sobrepeso en aumento.',
        plan_tratamiento: '1. Celecoxib 200mg c/24h x 10 días. 2. Complejo B c/24h x 30 días. 3. Higiene postural y programa de fortalecimiento lumbar. 4. Referencia a nutrición para control de peso. 5. Ajuste de actividades laborales: evitar cargas >15 kg por 2 semanas.',
        pronostico: 'Bueno. Se espera mejoría con tratamiento y modificación de hábitos.',
        proxima_cita: '2024-09-01',
        estado: 'vigente',
        created_at: '2024-08-15T09:30:00Z',
        firma_medico: true,
    },
    // Nota enmendada (demostración de versionado)
    {
        id: 'demo-nota-v3a',
        nota_id: 'demo-nota-003',
        version: 1,
        fecha: '2024-09-01T10:00:00Z',
        medico: 'Dr. Alejandro Fuentes Ríos',
        cedula: 'CED-87654321',
        tipo: 'nota_evolucion',
        motivo_consulta: 'Seguimiento de lumbalgia y control de HTA',
        padecimiento_actual: 'Paciente con mejoría del 70% de lumbalgia. Refiere dolor residual 2/10 EVA solo al final de jornada. TA 130/84 mmHg.',
        diagnostico_cie10: 'M54.5, I10',
        diagnostico_texto: 'Lumbalgia mecánica en resolución. HTA en seguimiento.',
        plan_tratamiento: 'Suspender Celecoxib. Continuar programa de ejercicios. Reincorporación completa a actividades.',
        pronostico: 'Favorable.',
        estado: 'enmendada',
        cambio_descripcion: 'Se corrige dosis de Losartán: se incrementó de 50mg a 100mg por TA ligeramente elevada en consultorio.',
        created_at: '2024-09-01T10:00:00Z',
        firma_medico: true,
    },
    {
        id: 'demo-nota-v3b',
        nota_id: 'demo-nota-003',
        version: 2,
        fecha: '2024-09-01T10:30:00Z',
        medico: 'Dr. Alejandro Fuentes Ríos',
        cedula: 'CED-87654321',
        tipo: 'nota_evolucion',
        motivo_consulta: 'Seguimiento de lumbalgia y control de HTA',
        padecimiento_actual: 'Paciente con mejoría del 70% de lumbalgia. Refiere dolor residual 2/10 EVA solo al final de jornada. TA 130/84 mmHg. Se decide ajuste de antihipertensivo.',
        diagnostico_cie10: 'M54.5, I10',
        diagnostico_texto: 'Lumbalgia mecánica en resolución. HTA: se ajusta tratamiento a Losartán 100mg/día.',
        plan_tratamiento: 'Suspender Celecoxib. Continuar programa de ejercicios. Reincorporación completa. Losartán se incrementa a 100mg c/24h.',
        pronostico: 'Favorable con ajuste terapéutico.',
        estado: 'vigente',
        cambio_descripcion: 'Enmienda: Se actualiza plan terapéutico — Losartán se incrementa de 50mg a 100mg/día.',
        created_at: '2024-09-01T10:30:00Z',
        firma_medico: true,
    },
    // Nota reciente
    {
        id: 'demo-nota-v4',
        nota_id: 'demo-nota-004',
        version: 1,
        fecha: '2025-02-10T09:00:00Z',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        tipo: 'consulta',
        motivo_consulta: 'Examen médico periódico anual 2025',
        padecimiento_actual: 'Paciente asintomático. Sin dolor lumbar. HTA controlada con Losartán 100mg. Refiere mejoría general tras iniciar programa de ejercicio. Ha bajado 1.5 kg desde agosto 2024. Sin exposiciones inusuales reportadas.',
        diagnostico_cie10: 'Z02.1, I10, H90.6, E66.0',
        diagnostico_texto: 'Examen periódico 2025. HTA controlada con ajuste previo. Hipoacusia bilateral estable. Sobrepeso en descenso. APTO con restricción auditiva.',
        plan_tratamiento: '1. Continuar Losartán 100mg/24h. 2. Continuar programa de ejercicio y dieta. 3. Audiometría de control en 6 meses. 4. Espirometría de vigilancia (protocolo NOM-011). 5. Laboratorios de control: BH, QS, EGO, Perfil Lipídico.',
        pronostico: 'Favorable. Paciente APTO con restricción de vigilancia auditiva.',
        proxima_cita: '2025-08-10',
        estado: 'vigente',
        created_at: '2025-02-10T09:00:00Z',
        firma_medico: true,
    },
];

// =====================================================
// EVENTOS CLÍNICOS (para la línea de tiempo)
// =====================================================
export const EVENTOS_CLINICOS_DEMO = [
    {
        id: 'demo-ev-001',
        tipo_evento: 'consulta',
        descripcion: 'Examen médico de ingreso laboral — Dictamen: APTO con restricción (vigilancia auditiva)',
        fecha_evento: '2024-03-15T11:00:00Z',
        estado: 'completado',
        medico: 'Dra. Patricia Góngora Mendez',
    },
    {
        id: 'demo-ev-002',
        tipo_evento: 'examen',
        descripcion: 'Audiometría tonal — Resultado: Hipoacusia neurosensorial bilateral leve. OD: 30dB, OI: 28dB (500-4000Hz)',
        fecha_evento: '2024-03-15T12:00:00Z',
        estado: 'completado',
        medico: 'Tec. Audiología Laura Martínez',
    },
    {
        id: 'demo-ev-003',
        tipo_evento: 'examen',
        descripcion: 'Espirometría — FVC: 4.2L (92% pred), FEV1: 3.5L (94% pred), FEV1/FVC: 0.83. Patrón normal.',
        fecha_evento: '2024-03-15T12:30:00Z',
        estado: 'completado',
        medico: 'Tec. Resp. Miguel Ángel Torres',
    },
    {
        id: 'demo-ev-004',
        tipo_evento: 'examen',
        descripcion: 'Laboratorios: BH normal. Glucosa 92 mg/dL. Colesterol 215 mg/dL (elevado). Triglicéridos 180 mg/dL (elevados). EGO sin alteraciones.',
        fecha_evento: '2024-03-16T10:00:00Z',
        estado: 'completado',
        medico: 'Lab. Central MediFlow',
    },
    {
        id: 'demo-ev-005',
        tipo_evento: 'consulta',
        descripcion: 'Examen periódico — Lumbalgia mecánica + ajuste de antihipertensivo. Referencia a nutrición.',
        fecha_evento: '2024-08-15T09:30:00Z',
        estado: 'completado',
        medico: 'Dr. Alejandro Fuentes Ríos',
    },
    {
        id: 'demo-ev-006',
        tipo_evento: 'prescripcion',
        descripcion: 'Rx: Celecoxib 200mg c/24h x 10 días. Complejo B c/24h x 30 días.',
        fecha_evento: '2024-08-15T10:00:00Z',
        estado: 'completado',
        medico: 'Dr. Alejandro Fuentes Ríos',
    },
    {
        id: 'demo-ev-007',
        tipo_evento: 'alerta',
        descripcion: 'TA elevada en revisión: 132/86 — Se programa seguimiento a 15 días.',
        fecha_evento: '2024-08-15T10:15:00Z',
        estado: 'completado',
        medico: 'Dr. Alejandro Fuentes Ríos',
    },
    {
        id: 'demo-ev-008',
        tipo_evento: 'consulta',
        descripcion: 'Seguimiento: Lumbalgia en resolución. Ajuste de Losartán a 100mg/día.',
        fecha_evento: '2024-09-01T10:00:00Z',
        estado: 'completado',
        medico: 'Dr. Alejandro Fuentes Ríos',
    },
    {
        id: 'demo-ev-009',
        tipo_evento: 'examen',
        descripcion: 'Audiometría de control — Sin cambios significativos. Hipoacusia bilateral estable.',
        fecha_evento: '2024-12-01T11:00:00Z',
        estado: 'completado',
        medico: 'Tec. Audiología Laura Martínez',
    },
    {
        id: 'demo-ev-010',
        tipo_evento: 'consulta',
        descripcion: 'Examen médico periódico anual 2025 — APTO con restricción auditiva. Pérdida de 1.5 kg.',
        fecha_evento: '2025-02-10T09:00:00Z',
        estado: 'completado',
        medico: 'Dra. Patricia Góngora Mendez',
    },
    {
        id: 'demo-ev-011',
        tipo_evento: 'examen',
        descripcion: 'Laboratorios 2025: BH normal. Glucosa 96 mg/dL. Colesterol 198 mg/dL (mejorado). Triglicéridos 155 mg/dL (mejorado). Creatinina 0.9 mg/dL.',
        fecha_evento: '2025-02-10T12:00:00Z',
        estado: 'completado',
        medico: 'Lab. Central MediFlow',
    },
];

// =====================================================
// LABORATORIO — Resultados Demo (último estudio 2025)
// =====================================================
export const LABORATORIO_DEMO = {
    id: 'demo-lab-001',
    estudio_id: 'demo-est-lab-001',
    fecha: '2025-02-10',
    laboratorio_nombre: 'Lab. Central MediFlow',
    medico_solicita: 'Dra. Patricia Góngora Mendez',
    grupos: [
        {
            grupo: 'Biometría Hemática',
            resultados: [
                { parametro: 'Hemoglobina', resultado: '15.8', unidad: 'g/dL', valor_referencia: '13.5–17.5', bandera: 'normal' as const },
                { parametro: 'Hematocrito', resultado: '46.2', unidad: '%', valor_referencia: '40–54', bandera: 'normal' as const },
                { parametro: 'Leucocitos', resultado: '7,200', unidad: '/µL', valor_referencia: '4,500–11,000', bandera: 'normal' as const },
                { parametro: 'Plaquetas', resultado: '245,000', unidad: '/µL', valor_referencia: '150,000–400,000', bandera: 'normal' as const },
                { parametro: 'Eritrocitos', resultado: '5.1', unidad: 'mill/µL', valor_referencia: '4.5–5.5', bandera: 'normal' as const },
                { parametro: 'VCM', resultado: '90.6', unidad: 'fL', valor_referencia: '80–100', bandera: 'normal' as const },
                { parametro: 'HCM', resultado: '31.0', unidad: 'pg', valor_referencia: '27–33', bandera: 'normal' as const },
                { parametro: 'CMHC', resultado: '34.2', unidad: 'g/dL', valor_referencia: '32–36', bandera: 'normal' as const },
            ],
        },
        {
            grupo: 'Química Sanguínea',
            resultados: [
                { parametro: 'Glucosa', resultado: '96', unidad: 'mg/dL', valor_referencia: '70–100', bandera: 'normal' as const },
                { parametro: 'Urea', resultado: '32', unidad: 'mg/dL', valor_referencia: '15–45', bandera: 'normal' as const },
                { parametro: 'Creatinina', resultado: '0.9', unidad: 'mg/dL', valor_referencia: '0.7–1.3', bandera: 'normal' as const },
                { parametro: 'Ácido Úrico', resultado: '6.8', unidad: 'mg/dL', valor_referencia: '3.5–7.2', bandera: 'normal' as const },
                { parametro: 'TGO (AST)', resultado: '28', unidad: 'U/L', valor_referencia: '10–40', bandera: 'normal' as const },
                { parametro: 'TGP (ALT)', resultado: '35', unidad: 'U/L', valor_referencia: '7–56', bandera: 'normal' as const },
            ],
        },
        {
            grupo: 'Perfil Lipídico',
            resultados: [
                { parametro: 'Colesterol Total', resultado: '198', unidad: 'mg/dL', valor_referencia: '<200', bandera: 'normal' as const },
                { parametro: 'Triglicéridos', resultado: '155', unidad: 'mg/dL', valor_referencia: '<150', bandera: 'alto' as const },
                { parametro: 'HDL', resultado: '42', unidad: 'mg/dL', valor_referencia: '>40', bandera: 'normal' as const },
                { parametro: 'LDL', resultado: '125', unidad: 'mg/dL', valor_referencia: '<130', bandera: 'normal' as const },
                { parametro: 'VLDL', resultado: '31', unidad: 'mg/dL', valor_referencia: '<30', bandera: 'alto' as const },
            ],
        },
        {
            grupo: 'Examen General de Orina',
            resultados: [
                { parametro: 'Color', resultado: 'Amarillo claro', unidad: '', valor_referencia: 'Amarillo', bandera: 'normal' as const },
                { parametro: 'Aspecto', resultado: 'Transparente', unidad: '', valor_referencia: 'Transparente', bandera: 'normal' as const },
                { parametro: 'pH', resultado: '6.0', unidad: '', valor_referencia: '5.0–8.0', bandera: 'normal' as const },
                { parametro: 'Densidad', resultado: '1.020', unidad: '', valor_referencia: '1.005–1.030', bandera: 'normal' as const },
                { parametro: 'Proteínas', resultado: 'Negativo', unidad: '', valor_referencia: 'Negativo', bandera: 'normal' as const },
                { parametro: 'Glucosa', resultado: 'Negativo', unidad: '', valor_referencia: 'Negativo', bandera: 'normal' as const },
                { parametro: 'Leucocitos', resultado: '0–2', unidad: '/campo', valor_referencia: '0–5', bandera: 'normal' as const },
                { parametro: 'Eritrocitos', resultado: '0–1', unidad: '/campo', valor_referencia: '0–3', bandera: 'normal' as const },
            ],
        },
        {
            grupo: 'Hormonas y Especiales',
            resultados: [
                { parametro: 'TSH', resultado: '2.8', unidad: 'µUI/mL', valor_referencia: '0.4–4.0', bandera: 'normal' as const },
                { parametro: 'T4 Libre', resultado: '1.1', unidad: 'ng/dL', valor_referencia: '0.8–1.8', bandera: 'normal' as const },
                { parametro: 'HbA1c', resultado: '5.4', unidad: '%', valor_referencia: '<5.7', bandera: 'normal' as const },
            ],
        },
    ],
};

// =====================================================
// LABORATORIO — Resultados previos (2024)
// =====================================================
export const LABORATORIO_PREVIO_DEMO = {
    id: 'demo-lab-002',
    estudio_id: 'demo-est-lab-002',
    fecha: '2024-03-16',
    laboratorio_nombre: 'Lab. Central MediFlow',
    medico_solicita: 'Dra. Patricia Góngora Mendez',
    grupos: [
        {
            grupo: 'Química Sanguínea',
            resultados: [
                { parametro: 'Glucosa', resultado: '92', unidad: 'mg/dL', valor_referencia: '70–100', bandera: 'normal' as const },
                { parametro: 'Creatinina', resultado: '0.8', unidad: 'mg/dL', valor_referencia: '0.7–1.3', bandera: 'normal' as const },
            ],
        },
        {
            grupo: 'Perfil Lipídico',
            resultados: [
                { parametro: 'Colesterol Total', resultado: '215', unidad: 'mg/dL', valor_referencia: '<200', bandera: 'alto' as const },
                { parametro: 'Triglicéridos', resultado: '180', unidad: 'mg/dL', valor_referencia: '<150', bandera: 'alto' as const },
                { parametro: 'HDL', resultado: '38', unidad: 'mg/dL', valor_referencia: '>40', bandera: 'bajo' as const },
                { parametro: 'LDL', resultado: '142', unidad: 'mg/dL', valor_referencia: '<130', bandera: 'alto' as const },
            ],
        },
    ],
};

// =====================================================
// AUDIOMETRÍA — Resultados Demo
// =====================================================
export const AUDIOMETRIA_DEMO = {
    id: 'demo-audio-001',
    estudio_id: 'demo-est-audio-001',
    fecha: '2025-02-10',
    tecnico: 'Tec. Audiología Laura Martínez',
    equipo: 'Audiómetro Maico MA-42 — Calibración vigente',
    // Frecuencias en Hz → umbrales en dB HL
    oido_derecho: {
        '250': 15, '500': 20, '1000': 20, '2000': 25, '3000': 30, '4000': 35, '6000': 40, '8000': 35,
    },
    oido_izquierdo: {
        '250': 10, '500': 18, '1000': 18, '2000': 22, '3000': 28, '4000': 32, '6000': 38, '8000': 30,
    },
    promedio_tonal_od: 30, // PTA 500-1k-2k-3k dB
    promedio_tonal_oi: 28,
    diagnostico: 'Hipoacusia neurosensorial bilateral leve',
    semaforo_od: 'amarillo' as const, // 'verde' | 'amarillo' | 'rojo'
    semaforo_oi: 'amarillo' as const,
    semaforo_general: 'amarillo' as const,
    interpretacion_nom011: 'Se detecta pérdida auditiva leve bilateral compatible con exposición crónica a ruido industrial (NOM-011-STPS-2001). Se recomienda vigilancia audiométrica semestral y uso obligatorio de protección auditiva (NRR ≥ 25 dB).',
    requiere_reevaluacion: true,
    tiempo_reevaluacion_meses: 6,
    recomendaciones: [
        'Uso obligatorio de protección auditiva tipo orejera (NRR ≥ 25 dB)',
        'Vigilancia audiométrica cada 6 meses',
        'Evitar exposición a ruido >85 dB(A) por periodos prolongados sin protección',
        'Control audiológico con ORL si progresión >10 dB en un año',
    ],
};

// Audiometría previa para comparación
export const AUDIOMETRIA_PREVIA_DEMO = {
    id: 'demo-audio-002',
    estudio_id: 'demo-est-audio-002',
    fecha: '2024-03-15',
    tecnico: 'Tec. Audiología Laura Martínez',
    oido_derecho: {
        '250': 15, '500': 20, '1000': 18, '2000': 22, '3000': 28, '4000': 32, '6000': 38, '8000': 32,
    },
    oido_izquierdo: {
        '250': 10, '500': 15, '1000': 16, '2000': 20, '3000': 25, '4000': 30, '6000': 35, '8000': 28,
    },
    promedio_tonal_od: 28,
    promedio_tonal_oi: 25,
    diagnostico: 'Hipoacusia neurosensorial bilateral leve',
    semaforo_general: 'amarillo' as const,
};

// =====================================================
// ESPIROMETRÍA — Resultados Demo
// =====================================================
export const ESPIROMETRIA_DEMO = {
    id: 'demo-espiro-001',
    fecha: '2025-02-10',
    tecnico: 'Tec. Resp. Miguel Ángel Torres',
    equipo: 'Espirómetro MIR Spirolab — Calibración vigente',
    edad: 37,
    sexo: 'masculino' as const,
    talla_cm: 175,
    peso_kg: 82.5,
    fvc: 4.20,
    fev1: 3.50,
    pef: 8.5,
    fef_2575: 3.2,
    fvc_predicho: 4.56,
    fev1_predicho: 3.72,
    fvc_porcentaje: 92,
    fev1_porcentaje: 94,
    fev1_fvc: 83,
    clasificacion: 'normal' as const,
    calidad_prueba: 'A' as const,
    numero_intentos: 3,
    broncodilatador: false,
    interpretacion: 'Patrón espirométrico normal. FVC y FEV1 dentro de rangos predichos para edad, sexo y talla. Relación FEV1/FVC normal. No hay evidencia de patrón obstructivo ni restrictivo.',
    recomendaciones: [
        'Mantener uso de protección respiratoria en áreas con partículas',
        'Vigilancia espirométrica anual (NOM-011-STPS)',
        'Control periódico en caso de exposición a irritantes pulmonares',
    ],
};

export const ESPIROMETRIA_PREVIA_DEMO = {
    id: 'demo-espiro-002',
    fecha: '2024-03-15',
    tecnico: 'Tec. Resp. Miguel Ángel Torres',
    fvc: 4.10,
    fev1: 3.45,
    fvc_porcentaje: 90,
    fev1_porcentaje: 93,
    fev1_fvc: 84,
    clasificacion: 'normal' as const,
    calidad_prueba: 'B' as const,
};

// =====================================================
// ESTUDIOS VISUALES — Resultados Demo
// =====================================================
export const VISUAL_DEMO = {
    id: 'demo-vision-001',
    fecha: '2025-02-10',
    evaluador: 'Dra. Patricia Góngora Mendez',
    equipo: 'Tabla de Snellen retroiluminada + Escala Jaeger',
    od_sin_correccion: '20/25',
    od_con_correccion: '20/20',
    oi_sin_correccion: '20/20',
    oi_con_correccion: '20/20',
    od_jaeger: 'J1',
    oi_jaeger: 'J1',
    ishihara_placas_total: 14,
    ishihara_placas_correctas: 14,
    ishihara_resultado: 'Normal — Visión cromática conservada',
    usa_lentes: false,
    campimetria_realizada: false,
    clasificacion: 'normal' as const,
    apto: true,
    observaciones: 'OD con leve disminución de agudeza lejana sin corrección (20/25), corrige a 20/20. OI normal. Visión cercana normal bilateral. Visión cromática conservada.',
    recomendaciones: [
        'Control visual anual',
        'Evaluar necesidad de lentes para visión lejana si la agudeza disminuye',
        'Protección ocular obligatoria en áreas de riesgo',
    ],
};

export const VISUAL_PREVIA_DEMO = {
    id: 'demo-vision-002',
    fecha: '2024-03-15',
    od_sin_correccion: '20/20',
    od_con_correccion: undefined,
    oi_sin_correccion: '20/20',
    oi_con_correccion: undefined,
    ishihara_correctas: 14,
    ishihara_total: 14,
    clasificacion: 'normal' as const,
    apto: true,
};

// =====================================================
// RAYOS X — Estudios Demo
// =====================================================
export const RAYOS_X_DEMO = [
    {
        id: 'demo-rx-001',
        fecha: '2025-02-10',
        tipo: 'Tórax PA',
        region: 'Tórax',
        motivo: 'Examen periódico — Vigilancia por exposición a partículas',
        tecnico: 'Tec. Rad. Sandra López',
        equipo: 'Rayos X Digital SHIMADZU RADspeed Pro',
        hallazgos: 'Silueta cardíaca de tamaño e índice cardiotorácico normal. Campos pulmonares sin lesiones focales ni infiltrados. Ángulos costofrénicos libres. Mediastino sin ensanchamiento. Hilios pulmonares de aspecto normal. Estructura ósea sin alteraciones.',
        impresion: 'Estudio radiológico de tórax dentro de límites normales.',
        clasificacion_ilo: 'Categoría 0/0 — Sin neumoconiosis radiológica',
        resultado: 'normal' as const,
        medico_interpreta: 'Dr. Ricardo Sánchez Morales (Radiólogo)',
        cedula_rad: 'CED-RAD-55667788',
    },
    {
        id: 'demo-rx-002',
        fecha: '2024-03-16',
        tipo: 'Tórax PA',
        region: 'Tórax',
        motivo: 'Examen de ingreso — Estudio basal de referencia',
        tecnico: 'Tec. Rad. Sandra López',
        equipo: 'Rayos X Digital SHIMADZU RADspeed Pro',
        hallazgos: 'Radiografía de tórax sin alteraciones. Campos pulmonares claros. Silueta cardíaca normal.',
        impresion: 'Estudio normal. Sirve como referencia basal.',
        clasificacion_ilo: 'Categoría 0/0',
        resultado: 'normal' as const,
        medico_interpreta: 'Dr. Ricardo Sánchez Morales (Radiólogo)',
        cedula_rad: 'CED-RAD-55667788',
    },
];

// =====================================================
// RECETAS MÉDICAS — Demo
// =====================================================
export const RECETAS_DEMO = [
    {
        id: 'demo-receta-001',
        fecha: '2025-02-10',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        diagnostico: 'Hipertensión arterial sistémica controlada (I10)',
        medicamentos: [
            {
                nombre: 'Losartán',
                dosis: '100 mg',
                via: 'Oral',
                frecuencia: 'Cada 24 horas',
                duracion: '6 meses (tratamiento continuo)',
                indicaciones: 'Tomar por la mañana con alimentos. No suspender sin indicación médica.',
            },
        ],
        indicaciones_generales: 'Dieta hiposódica. Ejercicio aeróbico 30 min/día. Control de presión arterial semanal. Próximo laboratorio de control en agosto 2025.',
        vigencia: '2025-08-10',
        estado: 'vigente' as const,
    },
    {
        id: 'demo-receta-002',
        fecha: '2024-08-15',
        medico: 'Dr. Alejandro Fuentes Ríos',
        cedula: 'CED-87654321',
        diagnostico: 'Lumbalgia mecánica (M54.5) + Hipertensión arterial sistémica (I10)',
        medicamentos: [
            {
                nombre: 'Celecoxib',
                dosis: '200 mg',
                via: 'Oral',
                frecuencia: 'Cada 24 horas',
                duracion: '10 días',
                indicaciones: 'Tomar después de alimentos. Suspender si hay dolor gástrico.',
            },
            {
                nombre: 'Complejo B',
                dosis: '1 cápsula',
                via: 'Oral',
                frecuencia: 'Cada 24 horas',
                duracion: '30 días',
                indicaciones: 'Tomar por la mañana.',
            },
            {
                nombre: 'Losartán',
                dosis: '100 mg',
                via: 'Oral',
                frecuencia: 'Cada 24 horas',
                duracion: 'Continuo',
                indicaciones: 'Ajuste de dosis previo: 50 mg → 100 mg. Tomar por la mañana.',
            },
        ],
        indicaciones_generales: 'Programa de fortalecimiento lumbar. Evitar cargas >15 kg por 2 semanas. Referencia a nutrición.',
        vigencia: '2024-09-15',
        estado: 'completada' as const,
    },
    {
        id: 'demo-receta-003',
        fecha: '2024-03-15',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        diagnostico: 'Hipertensión arterial sistémica controlada (I10)',
        medicamentos: [
            {
                nombre: 'Losartán',
                dosis: '50 mg',
                via: 'Oral',
                frecuencia: 'Cada 24 horas',
                duracion: '6 meses',
                indicaciones: 'Continuar tratamiento previo. Tomar por la mañana.',
            },
        ],
        indicaciones_generales: 'Control de presión arterial semanal. Dieta hiposódica.',
        vigencia: '2024-09-15',
        estado: 'completada' as const,
    },
];

// =====================================================
// INCAPACIDADES — Demo
// =====================================================
export const INCAPACIDADES_DEMO = [
    {
        id: 'demo-incap-001',
        folio: 'INC-2022-0847',
        fecha_inicio: '2022-01-15',
        fecha_fin: '2022-01-17',
        dias: 3,
        tipo: 'Enfermedad General' as const,
        diagnostico: 'COVID-19 (U07.1)',
        descripcion: 'Infección por SARS-CoV-2. Cuadro leve con farinigitis y cefalea. Aislamiento domiciliario.',
        medico: 'Dr. Alejandro Fuentes Ríos',
        cedula: 'CED-87654321',
        estatus_imss: 'Aceptada',
        observaciones: 'Paciente con esquema completo de vacunación. Cuadro leve, sin complicaciones. Alta por mejoría.',
    },
    {
        id: 'demo-incap-002',
        folio: 'INC-2015-1203',
        fecha_inicio: '2015-09-10',
        fecha_fin: '2015-09-14',
        dias: 5,
        tipo: 'Riesgo de Trabajo' as const,
        diagnostico: 'Herida cortante en mano derecha (S61.0)',
        descripcion: 'Laceración superficial en dorso de mano derecha por contacto con pieza metálica durante operación de torno CNC.',
        medico: 'Dr. Manuel Rivera (Urgencias)',
        cedula: 'CED-33445566',
        estatus_imss: 'Aceptada',
        observaciones: 'Sutura con 4 puntos. Cicatrización adecuada. Sin secuelas funcionales.',
    },
];

// =====================================================
// DICTÁMENES MÉDICO-LABORALES — Demo
// =====================================================
export const DICTAMENES_DEMO = [
    {
        id: 'demo-dict-001',
        fecha: '2025-02-10',
        tipo: 'Aptitud Laboral — Examen Periódico',
        folio: 'DICT-2025-0412',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        resultado: 'APTO CON RESTRICCIÓN',
        resultado_color: 'amber' as const,
        empresa: 'Industrias MX S.A. de C.V.',
        puesto: 'Supervisor de Producción',
        estudios_base: [
            'Examen clínico completo',
            'Audiometría tonal',
            'Espirometría',
            'Laboratorio (BH, QS, PL, EGO)',
            'Rx Tórax PA',
            'Estudios Visuales',
        ],
        diagnosticos: [
            'Hipertensión arterial sistémica controlada (I10)',
            'Hipoacusia neurosensorial bilateral leve (H90.6)',
            'Sobrepeso (E66.0)',
        ],
        restricciones: [
            'Vigilancia audiométrica semestral obligatoria',
            'Uso permanente de protección auditiva NRR ≥ 25 dB',
            'Control médico de HTA cada 6 meses',
        ],
        conclusion: 'El trabajador Carlos Eduardo Ríos Velázquez se encuentra APTO CON RESTRICCIÓN para desempeñar las funciones del puesto de Supervisor de Producción. Se requiere vigilancia audiométrica semestral por hipoacusia preexistente y control de hipertensión arterial. Se recomienda mantener programa de reducción de peso.',
        vigencia: '2025-08-10',
        firma_digital: true,
    },
    {
        id: 'demo-dict-002',
        fecha: '2024-03-15',
        tipo: 'Aptitud Laboral — Examen de Ingreso',
        folio: 'DICT-2024-0087',
        medico: 'Dra. Patricia Góngora Mendez',
        cedula: 'CED-12345678',
        resultado: 'APTO CON RESTRICCIÓN',
        resultado_color: 'amber' as const,
        empresa: 'Industrias MX S.A. de C.V.',
        puesto: 'Supervisor de Producción',
        estudios_base: [
            'Examen clínico de ingreso',
            'Audiometría tonal',
            'Espirometría',
            'Laboratorio completo',
            'Rx Tórax PA',
        ],
        diagnosticos: [
            'HTA controlada',
            'Hipoacusia bilateral leve preexistente',
            'Sobrepeso limítrofe',
        ],
        restricciones: [
            'Vigilancia auditiva continua — control semestral',
            'Uso obligatorio de protección auditiva',
        ],
        conclusion: 'Trabajador APTO CON RESTRICCIÓN de vigilancia auditiva. Hipoacusia preexistente por exposición laboral anterior. HTA controlada con medicamento.',
        vigencia: '2024-09-15',
        firma_digital: true,
    },
];

// =====================================================
// HELPER: Obtener todo el expediente demo completo
// =====================================================
export function getExpedienteDemoCompleto() {
    return {
        paciente: PACIENTE_DEMO,
        apnp: APNP_DEMO,
        ahf: AHF_DEMO,
        historiaOcupacional: HISTORIA_OCUPACIONAL_DEMO,
        exploracionesFisicas: EXPLORACION_FISICA_DEMO,
        consentimientos: CONSENTIMIENTOS_DEMO,
        notasMedicas: NOTAS_MEDICAS_DEMO,
        eventosClinicos: EVENTOS_CLINICOS_DEMO,
        laboratorio: LABORATORIO_DEMO,
        laboratorioPrevio: LABORATORIO_PREVIO_DEMO,
        audiometria: AUDIOMETRIA_DEMO,
        audiometriaPrevio: AUDIOMETRIA_PREVIA_DEMO,
        espirometria: ESPIROMETRIA_DEMO,
        espirometriaPrevia: ESPIROMETRIA_PREVIA_DEMO,
        visual: VISUAL_DEMO,
        visualPrevia: VISUAL_PREVIA_DEMO,
        rayosX: RAYOS_X_DEMO,
        recetas: RECETAS_DEMO,
        incapacidades: INCAPACIDADES_DEMO,
        dictamenes: DICTAMENES_DEMO,
    };
}
