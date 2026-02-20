/**
 * 3 Pacientes Demo Completos — GPMedical ERP
 * 
 * Estos 3 pacientes están diseñados para demostrar TODAS las funcionalidades
 * del primer módulo de medicina del ERP:
 * 
 * PACIENTE 1: Carlos Eduardo Ríos Velázquez — Supervisor de Producción
 *   → HTA controlada, hipoacusia bilateral, sobrepeso
 *   → 3 historias ocupacionales, múltiples exámenes
 * 
 * PACIENTE 2: María Guadalupe Fernández Torres — Ingeniera Química
 *   → Asma ocupacional en vigilancia, dermatitis de contacto
 *   → Exposición a químicos, espirometría con patrón obstructivo leve
 * 
 * PACIENTE 3: Juan Pablo Mendoza Silva — Técnico en Sistemas
 *   → Lumbalgia post-accidente, síndrome de túnel carpiano
 *   → Joven con ergonomía como factor principal
 * 
 * Todas con empresa_id que coincide con el usuario admin demo:
 * empresa_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' (MediWork Ocupacional)
 */

import { Paciente } from '@/services/dataService'

const EMPRESA_DEMO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const SEDE_DEMO_ID = 's1a1b1c1-1111-1111-1111-111111111111'

// ==========================================================================
// PACIENTE 1 — Carlos Eduardo Ríos Velázquez (Supervisor de Producción)
// ==========================================================================

export const PACIENTE_1: Paciente = {
    id: 'demo-pac-001',
    empresa_id: EMPRESA_DEMO_ID,
    sede_id: SEDE_DEMO_ID,
    numero_empleado: 'EMP-2024-0001',
    nombre: 'Carlos Eduardo',
    apellido_paterno: 'Ríos',
    apellido_materno: 'Velázquez',
    curp: 'RIVC870615HDFLN09',
    nss: '87654321012',
    rfc: 'RIVC870615AB1',
    fecha_nacimiento: '1987-06-15',
    genero: 'masculino',
    estado_civil: 'Casado',
    puesto: 'Supervisor de Producción',
    area: 'Producción',
    departamento: 'Línea de Ensamble',
    turno: 'Matutino',
    fecha_ingreso: '2019-03-01',
    tipo_contrato: 'Indefinido',
    jornada_horas: 8,
    supervisor_nombre: 'Ing. Roberto Hernández',
    tipo_sangre: 'A+',
    alergias: 'Penicilina (Rash cutáneo), Ácaros (Rinitis alérgica)',
    telefono: '(55) 1234-5678',
    email: 'carlos.rios@industriasmx.com',
    foto_url: '',
    firma_url: '',
    estatus: 'activo',
    contacto_emergencia_nombre: 'María Elena Velázquez',
    contacto_emergencia_parentesco: 'Esposa',
    contacto_emergencia_telefono: '(55) 3456-7890',
    riesgos_ocupacionales: {
        fisicos: { ruidos: true, vibraciones: true, iluminacion: false, radiaciones: false, presiones: false, temperaturas: true },
        quimicos: { gases: false, vapores: false, humos: false, particulas: true, aerosoles: false, polvos: true },
        ergonomicos: { posturasInadecuadas: true, cargasManuales: false, sobreesfuerzoFisico: false, actividadesRepetitivas: false, visual: false },
    },
    analisis_puesto_ai: {
        descripcionFunciones: 'Supervisar línea de ensamble, coordinar equipo de 18 operadores, verificar calidad de producción.',
        maquinasEquiposHerramientas: 'Línea de ensamble automatizada, prensas hidráulicas, equipo de medición CMM',
        eppRecomendado: ['Orejeras NRR 25dB', 'Lentes de seguridad', 'Casco', 'Zapato dieléctrico', 'Chaleco de alta visibilidad'],
    },
    created_at: '2024-03-15T10:00:00Z',
    empresa_nombre: 'MediWork Ocupacional',
    sede_nombre: 'Matriz CDMX',
}

export const PACIENTE_1_EXPEDIENTE = {
    apnp: {
        tabaco: true, tabaco_cantidad: '5 cigarrillos/día', tabaco_tiempo: '12 años (dejó hace 2 años)', tabaco_frecuencia: 'Ex-fumador',
        alcohol: true, alcohol_frecuencia: 'Social, 2-3 veces/mes', alcohol_cantidad: '3-4 cervezas por ocasión',
        drogas: false, drogas_tipo: 'Negado',
        ejercicio: true, ejercicio_frecuencia: '3 veces por semana', ejercicio_tipo: 'Caminata 30 min y pesas ligeras',
        sueno_horas: 6.5, sueno_calidad: 'Regular — Insomnio ocasional',
        alimentacion_tipo: 'Dieta mixta, baja en sal por hipertensión. 3 comidas al día con colaciones.',
        cafe: true, cafe_tazas_diarias: 3,
        otros_habitos: 'No consume refrescos. Toma 2 litros de agua diarios.',
    },
    ahf: {
        diabetes: true, diabetes_quien: 'Padre — DM2, diagnosticado a los 52 años',
        hipertension: true, hipertension_quien: 'Madre — HTA, tratamiento con Losartán',
        cancer: true, cancer_tipo: 'Cáncer de próstata', cancer_quien: 'Abuelo paterno, fallecido a los 78 años',
        cardiopatias: true, cardiopatias_quien: 'Tío paterno — IAM a los 60 años',
        enfermedades_mentales: false, enfermedades_respiratorias: false,
        otros: 'Abuela materna — Artritis reumatoide. Hermano mayor — Asma bronquial.',
    },
    exploracion_fisica: {
        fc: 74, fr: 16, ta_sistolica: 128, ta_diastolica: 82, temperatura: 36.4, spo2: 97, glucosa: 96,
        peso_kg: 82.5, talla_cm: 175, imc: 26.94, cintura_cm: 94, cadera_cm: 100,
        aspecto_general: 'Mesomorfo, cooperador, buena coloración.',
        estado_general: 'Bueno',
        piel: 'Morena clara, hidratada. Cicatriz lineal de 3 cm en dorso de mano derecha.',
        ojos: 'Pupilas isocóricas, normorreflécticas. AV: OD 20/25, OI 20/20.',
        oidos: 'Conductos auditivos permeables. Weber central. Rinne positivo bilateral.',
        columna: 'Alineada, sin dolor a palpación, movilidad conservada.',
        hallazgos_relevantes: 'Sobrepeso (IMC 26.94). HTA controlada. Hipoacusia leve bilateral preexistente.',
    },
    notas_medicas: [
        {
            id: 'nota-p1-001', version: 1, fecha: '2025-02-10T09:00:00Z',
            medico: 'Dra. Patricia Góngora Mendez', cedula: 'CED-12345678',
            tipo: 'consulta',
            motivo_consulta: 'Examen médico periódico anual 2025',
            diagnostico_cie10: 'Z02.1, I10, H90.6, E66.0',
            diagnostico_texto: 'Examen periódico 2025. HTA controlada. Hipoacusia bilateral estable. Sobrepeso en descenso. APTO con restricción auditiva.',
            plan_tratamiento: 'Continuar Losartán 100mg/24h. Audiometría de control en 6 meses. Espirometría de vigilancia.',
            pronostico: 'Favorable. APTO con restricción de vigilancia auditiva.',
            estado: 'vigente',
            firma_medico: true,
        },
    ],
    laboratorio: {
        fecha: '2025-02-10',
        grupos: [
            {
                grupo: 'Biometría Hemática', resultados: [
                    { parametro: 'Hemoglobina', resultado: '15.8', unidad: 'g/dL', valor_referencia: '13.5–17.5', bandera: 'normal' },
                    { parametro: 'Hematocrito', resultado: '46.2', unidad: '%', valor_referencia: '40–54', bandera: 'normal' },
                    { parametro: 'Leucocitos', resultado: '7,200', unidad: '/µL', valor_referencia: '4,500–11,000', bandera: 'normal' },
                    { parametro: 'Plaquetas', resultado: '245,000', unidad: '/µL', valor_referencia: '150,000–400,000', bandera: 'normal' },
                ]
            },
            {
                grupo: 'Química Sanguínea', resultados: [
                    { parametro: 'Glucosa', resultado: '96', unidad: 'mg/dL', valor_referencia: '70–100', bandera: 'normal' },
                    { parametro: 'Creatinina', resultado: '0.9', unidad: 'mg/dL', valor_referencia: '0.7–1.3', bandera: 'normal' },
                    { parametro: 'Ácido Úrico', resultado: '6.8', unidad: 'mg/dL', valor_referencia: '3.5–7.2', bandera: 'normal' },
                ]
            },
            {
                grupo: 'Perfil Lipídico', resultados: [
                    { parametro: 'Colesterol Total', resultado: '198', unidad: 'mg/dL', valor_referencia: '<200', bandera: 'normal' },
                    { parametro: 'Triglicéridos', resultado: '155', unidad: 'mg/dL', valor_referencia: '<150', bandera: 'alto' },
                    { parametro: 'HDL', resultado: '42', unidad: 'mg/dL', valor_referencia: '>40', bandera: 'normal' },
                    { parametro: 'LDL', resultado: '125', unidad: 'mg/dL', valor_referencia: '<130', bandera: 'normal' },
                ]
            },
        ],
    },
    audiometria: {
        fecha: '2025-02-10',
        oido_derecho: { '250': 15, '500': 20, '1000': 20, '2000': 25, '3000': 30, '4000': 35, '6000': 40, '8000': 35 },
        oido_izquierdo: { '250': 10, '500': 18, '1000': 18, '2000': 22, '3000': 28, '4000': 32, '6000': 38, '8000': 30 },
        promedio_tonal_od: 30, promedio_tonal_oi: 28,
        diagnostico: 'Hipoacusia neurosensorial bilateral leve',
        semaforo_general: 'amarillo',
    },
    espirometria: {
        fecha: '2025-02-10',
        fvc: 4.20, fev1: 3.50, fev1_fvc: 83,
        fvc_porcentaje: 92, fev1_porcentaje: 94,
        clasificacion: 'normal', calidad_prueba: 'A',
    },
    dictamen: {
        resultado: 'APTO CON RESTRICCIÓN',
        resultado_color: 'amber',
        restricciones: ['Vigilancia audiométrica semestral', 'Uso permanente de protección auditiva NRR ≥ 25 dB'],
    },
}

// ==========================================================================
// PACIENTE 2 — María Guadalupe Fernández Torres (Ingeniera Química)
// ==========================================================================

export const PACIENTE_2: Paciente = {
    id: 'demo-pac-002',
    empresa_id: EMPRESA_DEMO_ID,
    sede_id: SEDE_DEMO_ID,
    numero_empleado: 'EMP-2023-0042',
    nombre: 'María Guadalupe',
    apellido_paterno: 'Fernández',
    apellido_materno: 'Torres',
    curp: 'FETM910308MDFRRS05',
    nss: '43215678902',
    rfc: 'FETM910308CD2',
    fecha_nacimiento: '1991-03-08',
    genero: 'femenino',
    estado_civil: 'Soltera',
    puesto: 'Ingeniera de Procesos Químicos',
    area: 'Laboratorio Industrial',
    departamento: 'Control de Calidad y Procesos',
    turno: 'Matutino',
    fecha_ingreso: '2023-01-15',
    tipo_contrato: 'Indefinido',
    jornada_horas: 8,
    supervisor_nombre: 'Ing. Francisco Reyes Castro',
    tipo_sangre: 'O-',
    alergias: 'Látex (dermatitis), Formaldehído (irritación respiratoria)',
    telefono: '(55) 8765-4321',
    email: 'maria.fernandez@mediwork.mx',
    foto_url: '',
    firma_url: '',
    estatus: 'activo',
    contacto_emergencia_nombre: 'Roberto Fernández Sánchez',
    contacto_emergencia_parentesco: 'Padre',
    contacto_emergencia_telefono: '(55) 2345-6789',
    riesgos_ocupacionales: {
        fisicos: { ruidos: false, vibraciones: false, iluminacion: true, radiaciones: false, presiones: false, temperaturas: false },
        quimicos: { gases: true, vapores: true, humos: false, particulas: true, aerosoles: true, polvos: false },
        ergonomicos: { posturasInadecuadas: false, cargasManuales: false, sobreesfuerzoFisico: false, actividadesRepetitivas: true, visual: true },
        biologicos: { bacterias: true, virus: false, hongos: false, parasitos: false },
    },
    analisis_puesto_ai: {
        descripcionFunciones: 'Control de calidad de procesos químicos industriales, análisis de laboratorio, preparación de muestras, supervisión de reactores.',
        maquinasEquiposHerramientas: 'Cromatógrafo de gases, espectrofotómetro UV-Vis, campanas de extracción, reactores batch',
        eppRecomendado: ['Respirador media cara con cartuchos organico/vapor', 'Guantes de nitrilo', 'Bata de laboratorio', 'Lentes de seguridad antiempañantes', 'Zapato cerrado antiderrapante'],
    },
    created_at: '2023-01-15T09:00:00Z',
    empresa_nombre: 'MediWork Ocupacional',
    sede_nombre: 'Matriz CDMX',
}

export const PACIENTE_2_EXPEDIENTE = {
    apnp: {
        tabaco: false, tabaco_cantidad: '', tabaco_tiempo: '', tabaco_frecuencia: 'Nunca ha fumado',
        alcohol: true, alcohol_frecuencia: 'Ocasional, 1-2 veces/mes', alcohol_cantidad: '1-2 copas de vino',
        drogas: false, drogas_tipo: 'Negado',
        ejercicio: true, ejercicio_frecuencia: '5 veces por semana', ejercicio_tipo: 'Yoga 45 min, natación 2 veces/semana',
        sueno_horas: 7.5, sueno_calidad: 'Buena — Duerme completo, sin despertares',
        alimentacion_tipo: 'Vegetariana con pescado (pescetariana). 3 comidas al día, prefiere alimentos orgánicos.',
        cafe: true, cafe_tazas_diarias: 2,
        otros_habitos: 'Practica meditación. No consume alimentos procesados.',
    },
    ahf: {
        diabetes: false,
        hipertension: false,
        cancer: true, cancer_tipo: 'Cáncer de mama', cancer_quien: 'Abuela materna, diagnosticada a los 65 años',
        cardiopatias: false,
        enfermedades_mentales: false,
        enfermedades_respiratorias: true, enfermedades_respiratorias_quien: 'Padre — Asma bronquial desde la infancia',
        otros: 'Sin otros antecedentes familiares relevantes.',
    },
    exploracion_fisica: {
        fc: 68, fr: 14, ta_sistolica: 112, ta_diastolica: 72, temperatura: 36.3, spo2: 98, glucosa: 88,
        peso_kg: 58.0, talla_cm: 165, imc: 21.3, cintura_cm: 72, cadera_cm: 96,
        aspecto_general: 'Ectomorfa, cooperadora, orientada.',
        estado_general: 'Bueno',
        piel: 'Clara, hidratada. Dermatitis leve en dorso de manos (contacto con químicos). Lesiones eccematosas en resolución.',
        ojos: 'Pupilas isocóricas. AV: OD 20/20, OI 20/20. Usa lentes de armazón para astigmatismo leve.',
        oidos: 'Sin alteraciones. Audiometría dentro de rangos normales.',
        columna: 'Sin hallazgos. Movilidad completa.',
        torax: 'Ruidos respiratorios con leve sibilancia espiratoría bilateral (se acentúa con ejercicio). Sin estertores.',
        hallazgos_relevantes: 'Dermatitis de contacto en manos (ocupacional). Sibilancias leves — en vigilancia por posible asma ocupacional. IMC normal.',
    },
    notas_medicas: [
        {
            id: 'nota-p2-001', version: 1, fecha: '2025-01-20T10:30:00Z',
            medico: 'Dr. Alejandro Fuentes Ríos', cedula: 'CED-87654321',
            tipo: 'consulta',
            motivo_consulta: 'Examen periódico + seguimiento de dermatitis y sibilancias',
            diagnostico_cie10: 'J45.0, L25.0, Z57.5',
            diagnostico_texto: 'Asma ocupacional en vigilancia (sibilancias leves por exposición a vapores químicos). Dermatitis eritematosa de contacto en manos por látex/solventes. Exposición ocupacional a agentes químicos.',
            plan_tratamiento: '1. Salbutamol 100mcg inhalador de rescate. 2. Crema barrera emoliente c/8h en manos. 3. Evitar contacto directo con solventes. 4. Cambiar guantes de látex por nitrilo sin polvo. 5. Espirometría de control c/6 meses. 6. Referencia a Neumología si progresión.',
            pronostico: 'Reservado si no se controla la exposición. Bueno con medidas preventivas.',
            estado: 'vigente',
            firma_medico: true,
        },
        {
            id: 'nota-p2-002', version: 1, fecha: '2024-07-10T09:00:00Z',
            medico: 'Dra. Patricia Góngora Mendez', cedula: 'CED-12345678',
            tipo: 'consulta',
            motivo_consulta: 'Inicio de síntomas respiratorios en zona de trabajo',
            diagnostico_cie10: 'R06.2, L25.0',
            diagnostico_texto: 'Sibilancias de reciente aparición relacionadas con área de trabajo (laboratorio de análisis). Dermatitis de contacto incipiente.',
            plan_tratamiento: 'Monitoreo con espirometría basal. Uso obligatorio de respirador. Cambio de guantes.',
            pronostico: 'Favorable con medidas correctivas tempranas.',
            estado: 'vigente',
            firma_medico: true,
        },
    ],
    laboratorio: {
        fecha: '2025-01-20',
        grupos: [
            {
                grupo: 'Biometría Hemática', resultados: [
                    { parametro: 'Hemoglobina', resultado: '13.2', unidad: 'g/dL', valor_referencia: '12.0–16.0', bandera: 'normal' },
                    { parametro: 'Hematocrito', resultado: '39.5', unidad: '%', valor_referencia: '36–47', bandera: 'normal' },
                    { parametro: 'Leucocitos', resultado: '6,800', unidad: '/µL', valor_referencia: '4,500–11,000', bandera: 'normal' },
                    { parametro: 'Eosinófilos', resultado: '8.2', unidad: '%', valor_referencia: '1–5', bandera: 'alto' },
                    { parametro: 'Plaquetas', resultado: '280,000', unidad: '/µL', valor_referencia: '150,000–400,000', bandera: 'normal' },
                ]
            },
            {
                grupo: 'Química Sanguínea', resultados: [
                    { parametro: 'Glucosa', resultado: '82', unidad: 'mg/dL', valor_referencia: '70–100', bandera: 'normal' },
                    { parametro: 'Creatinina', resultado: '0.7', unidad: 'mg/dL', valor_referencia: '0.5–1.1', bandera: 'normal' },
                ]
            },
            {
                grupo: 'Inmunología', resultados: [
                    { parametro: 'IgE Total', resultado: '285', unidad: 'UI/mL', valor_referencia: '<100', bandera: 'alto' },
                    { parametro: 'IgE Específica (Formaldehído)', resultado: '12.5', unidad: 'kU/L', valor_referencia: '<0.35', bandera: 'alto' },
                ]
            },
            {
                grupo: 'Perfil Hepático', resultados: [
                    { parametro: 'TGO (AST)', resultado: '22', unidad: 'U/L', valor_referencia: '10–40', bandera: 'normal' },
                    { parametro: 'TGP (ALT)', resultado: '18', unidad: 'U/L', valor_referencia: '7–56', bandera: 'normal' },
                    { parametro: 'Bilirrubina Total', resultado: '0.8', unidad: 'mg/dL', valor_referencia: '0.1–1.2', bandera: 'normal' },
                ]
            },
        ],
    },
    audiometria: {
        fecha: '2025-01-20',
        oido_derecho: { '250': 10, '500': 10, '1000': 10, '2000': 10, '3000': 10, '4000': 15, '6000': 15, '8000': 10 },
        oido_izquierdo: { '250': 10, '500': 10, '1000': 10, '2000': 10, '3000': 10, '4000': 10, '6000': 15, '8000': 10 },
        promedio_tonal_od: 10, promedio_tonal_oi: 10,
        diagnostico: 'Audición dentro de límites normales bilateralmente',
        semaforo_general: 'verde',
    },
    espirometria: {
        fecha: '2025-01-20',
        fvc: 3.45, fev1: 2.62, fev1_fvc: 76,
        fvc_porcentaje: 95, fev1_porcentaje: 78,
        clasificacion: 'obstructivo_leve',
        calidad_prueba: 'A',
        interpretacion: 'Patrón obstructivo leve. FEV1 ligeramente reducido con FVC normal. Compatible con obstrucción reversible. Se recomienda prueba con broncodilatador.',
        broncodilatador: true,
        post_broncodilatador: { fev1: 2.95, fev1_porcentaje: 88, mejoria_porcentaje: 12.6 },
    },
    dictamen: {
        resultado: 'APTO CON RESTRICCIÓN',
        resultado_color: 'amber',
        restricciones: [
            'Uso obligatorio de respirador con cartuchos para vapores orgánicos',
            'Vigilancia espirométrica cada 6 meses',
            'Evitar exposición directa a formaldehído y solventes clorados',
            'Uso de guantes de nitrilo SIN polvo (no látex)',
        ],
    },
}

// ==========================================================================
// PACIENTE 3 — Juan Pablo Mendoza Silva (Técnico en Sistemas / TI)
// ==========================================================================

export const PACIENTE_3: Paciente = {
    id: 'demo-pac-003',
    empresa_id: EMPRESA_DEMO_ID,
    sede_id: SEDE_DEMO_ID,
    numero_empleado: 'EMP-2022-0118',
    nombre: 'Juan Pablo',
    apellido_paterno: 'Mendoza',
    apellido_materno: 'Silva',
    curp: 'MESJ980722HDFLVN04',
    nss: '56781234509',
    rfc: 'MESJ980722EF3',
    fecha_nacimiento: '1998-07-22',
    genero: 'masculino',
    estado_civil: 'Soltero',
    puesto: 'Técnico de Soporte TI / Cableado Estructurado',
    area: 'Tecnologías de la Información',
    departamento: 'Infraestructura y Redes',
    turno: 'Mixto',
    fecha_ingreso: '2022-06-01',
    tipo_contrato: 'Indefinido',
    jornada_horas: 9,
    supervisor_nombre: 'Ing. Laura Vega Morales',
    tipo_sangre: 'B+',
    alergias: 'Ninguna conocida',
    telefono: '(55) 9876-5432',
    email: 'juan.mendoza@mediwork.mx',
    foto_url: '',
    firma_url: '',
    estatus: 'activo',
    contacto_emergencia_nombre: 'Patricia Silva López',
    contacto_emergencia_parentesco: 'Madre',
    contacto_emergencia_telefono: '(55) 4567-8901',
    riesgos_ocupacionales: {
        fisicos: { ruidos: false, vibraciones: false, iluminacion: true, radiaciones: false, presiones: false, temperaturas: false },
        quimicos: { gases: false, vapores: false, humos: false, particulas: false, aerosoles: false, polvos: true },
        ergonomicos: { posturasInadecuadas: true, cargasManuales: true, sobreesfuerzoFisico: true, actividadesRepetitivas: true, visual: true },
        electricos: { bajaTension: true, altaTension: false, electricidadEstatica: true },
        locativos: { superficiales: false, almacenamiento: false, estructuras: false, instalaciones: false, espacioDeTrabajo: true, alturas: true },
    },
    analisis_puesto_ai: {
        descripcionFunciones: 'Instalación y mantenimiento de infraestructura de red, cableado estructurado, soporte técnico en sitio, configuración de equipos.',
        maquinasEquiposHerramientas: 'Herramientas de ponchado, escaleras, probadores de red, computadores portátiles, UPS',
        eppRecomendado: ['Guantes de protección mecánica', 'Lentes de seguridad', 'Arnés de seguridad (alturas)', 'Zapato dieléctrico', 'Casco ligero'],
    },
    created_at: '2022-06-01T08:00:00Z',
    empresa_nombre: 'MediWork Ocupacional',
    sede_nombre: 'Matriz CDMX',
}

export const PACIENTE_3_EXPEDIENTE = {
    apnp: {
        tabaco: false, tabaco_tiempo: '', tabaco_frecuencia: 'Nunca',
        alcohol: true, alcohol_frecuencia: 'Fin de semana, social', alcohol_cantidad: '4-6 cervezas los viernes',
        drogas: false, drogas_tipo: 'Negado',
        ejercicio: true, ejercicio_frecuencia: 'Diario', ejercicio_tipo: 'Gimnasio (crossfit) 1 hora, ciclismo fines de semana',
        sueno_horas: 7, sueno_calidad: 'Buena — Duerme rápido, sin interrupciones',
        alimentacion_tipo: 'Dieta hiperproteica por actividad física. 5 comidas al día. Consume suplementos (creatina, proteína whey).',
        cafe: true, cafe_tazas_diarias: 4,
        otros_habitos: 'Usa pantalla >8 horas/día (laboral + personal). Usa lentes con filtro de luz azul.',
    },
    ahf: {
        diabetes: true, diabetes_quien: 'Abuelo paterno — DM2',
        hipertension: false,
        cancer: false,
        cardiopatias: false,
        enfermedades_mentales: true, enfermedades_mentales_quien: 'Tía materna — Trastorno de ansiedad generalizada',
        enfermedades_respiratorias: false,
        otros: 'Sin otros antecedentes relevantes.',
    },
    exploracion_fisica: {
        fc: 62, fr: 14, ta_sistolica: 118, ta_diastolica: 74, temperatura: 36.5, spo2: 99, glucosa: 84,
        peso_kg: 78.0, talla_cm: 180, imc: 24.07, cintura_cm: 82, cadera_cm: 96,
        aspecto_general: 'Mesomorfo atlético, cooperador, buen estado general.',
        estado_general: 'Bueno',
        piel: 'Clara, hidratada, sin lesiones. Cicatriz quirúrgica en región lumbar (laminectomía L4-L5, 2024).',
        ojos: 'Pupilas isocóricas. AV: OD 20/20, OI 20/20. Usa lentes con filtro de luz azul. Sin fondo de ojo alterado.',
        oidos: 'Sin alteraciones.',
        columna: 'Cicatriz en L4-L5 (laminectomía 2024). Movilidad ligeramente limitada en flexión (70° vs 80° normal). Schober: 3 cm (límite bajo). Dolor leve a palpación en L4-L5.',
        extremidades_superiores: 'Tinel positivo bilateral en muñecas (leve). Phalen: dolor leve bilateral a los 45 segundos.',
        hallazgos_relevantes: 'Post-operatorio de laminectomía L4-L5 (2024). Síndrome de túnel carpiano bilateral incipiente. IMC normal. Buen estado cardiopulmonar.',
    },
    notas_medicas: [
        {
            id: 'nota-p3-001', version: 1, fecha: '2025-02-05T11:00:00Z',
            medico: 'Dr. Alejandro Fuentes Ríos', cedula: 'CED-87654321',
            tipo: 'consulta',
            motivo_consulta: 'Control post-operatorio + examen periódico + valoración ergonómica',
            diagnostico_cie10: 'M51.1, G56.0, Z02.1',
            diagnostico_texto: 'Post-operatorio de hernia discal L4-L5 (laminectomía julio 2024). Evolución favorable. Síndrome de túnel carpiano bilateral incipiente por uso prolongado de herramientas y teclado. Apto con restricciones.',
            plan_tratamiento: '1. Programa de fortalecimiento de core y espalda baja (supervisado). 2. Muñequeras ergonómicas durante trabajo prolongado con teclado. 3. Pausas activas cada 45 min. 4. Electromiografía de control en 3 meses. 5. Restricción de carga: máximo 10 kg. 6. No trabajar en alturas >2m durante 6 meses más.',
            pronostico: 'Bueno con rehabilitación continua y restricciones temporales.',
            estado: 'vigente',
            firma_medico: true,
        },
        {
            id: 'nota-p3-002', version: 1, fecha: '2024-07-15T09:00:00Z',
            medico: 'Dr. Ricardo Sánchez M.', cedula: 'CED-55667788',
            tipo: 'ingreso',
            motivo_consulta: 'Caída de escalera durante instalación de cableado — Hernia discal L4-L5',
            diagnostico_cie10: 'M51.1, W11',
            diagnostico_texto: 'Accidente de trabajo: caída de escalera de 2.5m durante instalación de cableado estructurado en techo de oficina. Hernia discal L4-L5 con compromiso radicular. Requirió laminectomía de urgencia.',
            plan_tratamiento: 'Cirugía (laminectomía L4-L5 realizada 2024-07-16). Rehabilitación 3 meses. Incapacidad 45 días. Restricción de actividades en alturas y carga.',
            pronostico: 'Reservado a favorable. Depende de rehabilitación.',
            estado: 'vigente',
            firma_medico: true,
        },
    ],
    laboratorio: {
        fecha: '2025-02-05',
        grupos: [
            {
                grupo: 'Biometría Hemática', resultados: [
                    { parametro: 'Hemoglobina', resultado: '16.2', unidad: 'g/dL', valor_referencia: '13.5–17.5', bandera: 'normal' },
                    { parametro: 'Hematocrito', resultado: '47.8', unidad: '%', valor_referencia: '40–54', bandera: 'normal' },
                    { parametro: 'Leucocitos', resultado: '5,900', unidad: '/µL', valor_referencia: '4,500–11,000', bandera: 'normal' },
                    { parametro: 'Plaquetas', resultado: '230,000', unidad: '/µL', valor_referencia: '150,000–400,000', bandera: 'normal' },
                ]
            },
            {
                grupo: 'Química Sanguínea', resultados: [
                    { parametro: 'Glucosa', resultado: '84', unidad: 'mg/dL', valor_referencia: '70–100', bandera: 'normal' },
                    { parametro: 'Creatinina', resultado: '1.0', unidad: 'mg/dL', valor_referencia: '0.7–1.3', bandera: 'normal' },
                    { parametro: 'CPK', resultado: '420', unidad: 'U/L', valor_referencia: '38–174', bandera: 'alto' },
                ]
            },
            {
                grupo: 'Perfil Lipídico', resultados: [
                    { parametro: 'Colesterol Total', resultado: '175', unidad: 'mg/dL', valor_referencia: '<200', bandera: 'normal' },
                    { parametro: 'Triglicéridos', resultado: '110', unidad: 'mg/dL', valor_referencia: '<150', bandera: 'normal' },
                    { parametro: 'HDL', resultado: '55', unidad: 'mg/dL', valor_referencia: '>40', bandera: 'normal' },
                    { parametro: 'LDL', resultado: '98', unidad: 'mg/dL', valor_referencia: '<130', bandera: 'normal' },
                ]
            },
        ],
    },
    audiometria: {
        fecha: '2025-02-05',
        oido_derecho: { '250': 5, '500': 5, '1000': 10, '2000': 10, '3000': 10, '4000': 10, '6000': 10, '8000': 10 },
        oido_izquierdo: { '250': 5, '500': 5, '1000': 5, '2000': 10, '3000': 10, '4000': 10, '6000': 10, '8000': 5 },
        promedio_tonal_od: 8, promedio_tonal_oi: 7,
        diagnostico: 'Audición normal bilateralmente',
        semaforo_general: 'verde',
    },
    espirometria: {
        fecha: '2025-02-05',
        fvc: 5.20, fev1: 4.50, fev1_fvc: 87,
        fvc_porcentaje: 102, fev1_porcentaje: 105,
        clasificacion: 'normal',
        calidad_prueba: 'A',
    },
    incapacidades: [
        {
            id: 'incap-p3-001',
            folio: 'INC-2024-3847',
            fecha_inicio: '2024-07-15',
            fecha_fin: '2024-08-28',
            dias: 45,
            tipo: 'Riesgo de Trabajo',
            diagnostico: 'Hernia discal L4-L5 post-caída (M51.1)',
            descripcion: 'Caída de escalera de 2.5m durante instalación de cableado. Laminectomía realizada. Rehabilitación.',
            medico: 'Dr. Ricardo Sánchez M.',
            estatus_imss: 'Aceptada — Riesgo de Trabajo calificado',
        },
        {
            id: 'incap-p3-002',
            folio: 'INC-2024-4120',
            fecha_inicio: '2024-09-01',
            fecha_fin: '2024-09-30',
            dias: 30,
            tipo: 'Riesgo de Trabajo',
            diagnostico: 'Rehabilitación post-laminectomía (continuación)',
            descripcion: 'Extensión de incapacidad para rehabilitación. Terapia física 3 veces por semana.',
            medico: 'Dr. Alejandro Fuentes Ríos',
            estatus_imss: 'Aceptada',
        },
    ],
    dictamen: {
        resultado: 'APTO CON RESTRICCIÓN TEMPORAL',
        resultado_color: 'amber',
        restricciones: [
            'No cargar más de 10 kg',
            'No trabajar en alturas superiores a 2 metros (6 meses más)',
            'Pausas activas cada 45 minutos',
            'Uso de muñequeras ergonómicas en trabajo prolongado con teclado',
            'Electromiografía de control en 3 meses',
        ],
    },
}

// ==========================================================================
// ARRAY CONSOLIDADO — Los 3 pacientes como Paciente[] para el servicio
// ==========================================================================

export const PACIENTES_DEMO_COMPLETOS: Paciente[] = [PACIENTE_1, PACIENTE_2, PACIENTE_3]

// Expedientes indexados por ID para acceso rápido
export const EXPEDIENTES_DEMO: Record<string, any> = {
    'demo-pac-001': PACIENTE_1_EXPEDIENTE,
    'demo-pac-002': PACIENTE_2_EXPEDIENTE,
    'demo-pac-003': PACIENTE_3_EXPEDIENTE,
}

/**
 * Obtener expediente demo por ID de paciente
 */
export function getExpedienteDemo(pacienteId: string) {
    return EXPEDIENTES_DEMO[pacienteId] || null
}
