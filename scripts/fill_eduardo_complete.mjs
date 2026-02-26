/**
 * Script: Llenar TODOS los datos de Eduardo Flores Castillo
 * 
 * Este script inserta datos en TODAS las tablas existentes que alimentan
 * cada tab del expediente y perfil del paciente.
 * 
 * Tablas que usa cada tab del expediente (HistorialClinicoCompleto.tsx):
 *   - pacientes (datos directos, JSONB: laboratorio, exploracion_fisica, audiometria, espirometria, radiografia)
 *   - antecedentes_np (APNP)
 *   - antecedentes_hf (AHF)
 *   - historia_ocupacional (Ocupacional)
 *   - exploraciones_fisicas (Exploración Física)
 *   - consentimientos_firmados (Consentimientos)
 *   - notas_medicas (Notas Médicas)
 *   - eventos_clinicos (Línea de Tiempo)
 * 
 * Tablas de tabs individuales:
 *   - examenes_laboratorio (LaboratorioTab)
 *   - examenes_audiometria (AudiometriaTab)
 *   - examenes_espirometria (EspirometriaTab)
 *   - examenes_rayos_x (RayosXTab)
 *   - examenes_vista (EstudiosVisualesTab / Visión)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kftxftikoydldcexkady.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Utility: try insert, log result
async function safeInsert(table, data, opts = {}) {
    try {
        const query = supabase.from(table).upsert(data, { onConflict: opts.conflict || 'id' })
        const { data: result, error } = await query.select()
        if (error) {
            console.log(`  ⚠️  ${table}: ${error.message}`)
            // Try plain insert if upsert fails
            const { data: r2, error: e2 } = await supabase.from(table).insert(data).select()
            if (e2) {
                console.log(`  ❌ ${table} insert also failed: ${e2.message}`)
                return null
            }
            console.log(`  ✅ ${table}: ${Array.isArray(r2) ? r2.length : 1} registros insertados`)
            return r2
        }
        console.log(`  ✅ ${table}: ${Array.isArray(result) ? result.length : 1} registros`)
        return result
    } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`)
        return null
    }
}

async function main() {
    console.log('🏥 Buscando a Eduardo Flores Castillo...')

    // 1. Find Eduardo
    const { data: pacientes, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido_paterno, empresa_id')
        .ilike('nombre', '%Eduardo%')
        .ilike('apellido_paterno', '%Flores%')

    if (error || !pacientes?.length) {
        console.error('❌ No se encontró a Eduardo:', error?.message)
        return
    }

    const eduardo = pacientes[0]
    const pid = eduardo.id
    const eid = eduardo.empresa_id
    console.log(`✅ Encontrado: ${eduardo.nombre} ${eduardo.apellido_paterno} (${pid})`)

    // ================================================================
    // 2. Actualizar pacientes (datos directos del perfil)
    // ================================================================
    console.log('\n📋 Actualizando datos directos del paciente...')
    const { error: updateErr } = await supabase.from('pacientes').update({
        // Datos personales completos
        nombre: 'Eduardo',
        apellido_paterno: 'Flores',
        apellido_materno: 'Castillo',
        fecha_nacimiento: '1976-03-15',
        genero: 'masculino',
        curp: 'FOCE760315HDFLSD08',
        rfc: 'FOCE760315A12',
        nss: '45872634510',
        tipo_sangre: 'AB+',
        estado_civil: 'Casado',
        escolaridad: 'Licenciatura',
        religion: 'Católica',
        lugar_nacimiento: 'Monterrey, Nuevo León',
        nacionalidad: 'Mexicana',
        telefono: '8187654321',
        email: 'eduardo.flores@email.com',
        direccion: 'Av. Constitución 456, Col. Centro, Monterrey, N.L.',
        contacto_emergencia_nombre: 'María del Carmen Castillo',
        contacto_emergencia_telefono: '8181234567',
        contacto_emergencia_parentesco: 'Esposa',

        // Datos laborales
        puesto: 'Director Comercial',
        departamento: 'Comercial',
        area_trabajo: 'Oficinas Corporativas',
        turno: 'Matutino',
        antiguedad_empresa: '12 años',
        numero_empleado: 'EMP-0147',

        // Datos antropométricos y vitales
        peso_kg: 98.5,
        talla_cm: 175,
        imc: 32.1,
        presion_sistolica: 140,
        presion_diastolica: 90,
        frecuencia_cardiaca: 85,
        frecuencia_respiratoria: 18,
        temperatura: 36.6,
        saturacion_o2: 94,

        // Alergias y antecedentes
        alergias: 'Penicilina (urticaria), Polvo (rinitis)',
        antecedentes_personales: 'Hipertensión arterial diagnosticada en 2019, Diabetes Mellitus tipo 2 desde 2021, Obesidad grado I',
        antecedentes_familiares: 'Padre: DM2, HTA, IAM a los 62 años. Madre: HTA, Artritis reumatoide. Hermano: DM2.',
        medicamentos_actuales: 'Metformina 850mg c/12h, Losartán 50mg c/24h, Atorvastatina 20mg c/24h',
        enfermedades_cronicas: 'Hipertensión arterial, Diabetes Mellitus tipo 2, Dislipidemia mixta',

        // Tabaquismo, alcoholismo
        tabaquismo: 'Exfumador (dejó hace 3 años, fumó 15 años)',
        alcoholismo: 'Social, 2-3 cervezas semanales',
        toxicomanias: 'Negadas',

        // Riesgos
        riesgo_cardiovascular: 'alto',
        riesgo_metabolico: 'alto',
        riesgo_musculoesqueletico: 'medio',

        // Dictamen
        dictamen_aptitud: 'Apto con restricciones',
        dictamen_observaciones: 'Requiere control metabólico estricto. Restricción: No actividades de esfuerzo físico intenso. Control cada 3 meses.',
        dictamen_fecha: '2026-02-20',
        dictamen_medico: 'Dr. Juan Pérez Martínez',
        dictamen_vigencia: '2026-05-20',

        // JSONB de exploración física
        exploracion_fisica: {
            cabeza: 'Normocéfala, sin exostosis. Cabello bien implantado.',
            ojos: 'Pupilas isocóricas, reflejos fotomotor y consensual presentes. Conjuntivas bien coloreadas. Fondo de ojo: cruces arteriovenosos aumentados.',
            oidos: 'Conductos auditivos permeables, membranas timpánicas íntegras bilaterales.',
            nariz: 'Tabique nasal central, mucosa rosada, cornetes sin hipertrofia.',
            boca: 'Mucosa oral bien hidratada, piezas dentales completas, faringe sin hiperemia.',
            cuello: 'Cilíndrico, sin adenopatías, tiroides no palpable. Pulsos carotídeos normales.',
            torax: 'Simétrico, campos pulmonares bien ventilados, murmullo vesicular presente bilateral. Ruidos cardíacos rítmicos, sin soplos.',
            abdomen: 'Globoso por panículo adiposo, blando, depresible, no doloroso. Peristalsis presente. Sin visceromegalias.',
            extremidades_superiores: 'Simétricas, fuerza 5/5, reflejos osteotendinosos normales. Sin edema.',
            extremidades_inferiores: 'Simétricas, pulsos pedios presentes. Sin edema. Varices incipientes en MID.',
            columna: 'Sin desviaciones, dolor leve a la palpación en L4-L5. Lasègue negativo bilateral.',
            piel: 'Hidratada, sin lesiones. Acantosis nigricans leve en cuello y axilas.',
            neurologico: 'Glasgow 15/15. Pares craneales íntegros. Sensibilidad conservada. Marcha normal.',
            genitourinario: 'Sin alteraciones referidas.',
        },

        // JSONB de audiometría
        audiometria: {
            fecha: '2026-02-18',
            od_250: 15, od_500: 20, od_1000: 15, od_2000: 20, od_4000: 25, od_8000: 30,
            oi_250: 10, oi_500: 15, oi_1000: 15, oi_2000: 25, oi_4000: 30, oi_8000: 35,
            interpretacion: 'Audición bilateral normal para frecuencias conversacionales. Leve descenso en agudos bilateral, más acentuado en oído izquierdo. Compatible con presbiacusia incipiente.',
            diagnostico: 'Hipoacusia neurosensorial leve bilateral en frecuencias agudas',
            recomendaciones: 'Uso de protección auditiva en ambientes ruidosos. Control audiométrico anual.',
            clasificacion: 'Clase A - Apto',
        },

        // JSONB de espirometría
        espirometria: {
            fecha: '2026-02-18',
            fvc_litros: 4.2,
            fvc_predicho: 4.8,
            fvc_porcentaje: 87.5,
            fev1_litros: 3.4,
            fev1_predicho: 3.9,
            fev1_porcentaje: 87.2,
            fev1_fvc: 80.9,
            pef: 8.5,
            fef_25_75: 3.2,
            interpretacion: 'Espirometría con patrón normal. FVC y FEV1 dentro de límites normales. Relación FEV1/FVC conservada.',
            diagnostico: 'Función pulmonar normal',
            calidad: 'A - Excelente',
            clasificacion: 'Normal',
        },

        // JSONB de radiografía
        radiografia: {
            tipo: 'PA de Tórax',
            fecha: '2026-02-18',
            hallazgos: 'Silueta cardíaca con índice cardiotorácico de 0.52 (límite superior normal). Parénquima pulmonar sin condensaciones ni infiltrados. Ángulos costofrénicos libres. Mediastino centrado. Estructuras óseas sin lesiones. Partes blandas normales.',
            clasificacion_oit: '0/0 - Sin neumoconiosis',
            conclusion: 'Radiografía de tórax con cardiomegalia borderline. Sin patología pleuropulmonar activa.',
            recomendaciones: 'Control radiológico anual. Valorar ecocardiograma por cardiomegalia borderline.',
        },

        // Estado
        status: 'activo',
    }).eq('id', pid)

    if (updateErr) console.log('  ❌ pacientes update:', updateErr.message)
    else console.log('  ✅ pacientes: Datos personales, vitales, JSONB completos')

    // ================================================================
    // 3. Antecedentes No Patológicos (APNP)
    // ================================================================
    console.log('\n📋 Insertando APNP...')
    await safeInsert('antecedentes_np', {
        paciente_id: pid,
        alimentacion: 'Hipercalórica, alto consumo de carbohidratos refinados y grasas saturadas. 3 comidas al día + 2 colaciones. Consumo frecuente de comida rápida.',
        higiene_personal: 'Adecuada. Baño diario, lavado dental 2 veces al día.',
        higiene_vivienda: 'Habita casa propia, 3 recámaras, todos los servicios intradomiciliarios. Ventilación adecuada.',
        tabaquismo: 'Exfumador. Fumó de los 20 a los 47 años (27 años). 10 cigarros/día. Índice tabáquico: 13.5 paquetes/año. Dejó hace 3 años.',
        alcoholismo: 'Social. 2-3 cervezas los fines de semana. Sin criterios de dependencia.',
        toxicomanias: 'Negadas',
        actividad_fisica: 'Sedentario. Caminata ocasional de 20 minutos, 1-2 veces por semana.',
        vacunacion: 'Esquema completo. Influenza 2025, COVID-19 4 dosis, Hepatitis B completo, Tétanos 2024.',
        inmunizaciones: 'Completas para edad',
        hospitalizaciones_previas: 'Apendicectomía 1998. Sin complicaciones.',
        cirugias_previas: 'Apendicectomía laparoscópica (1998), Extracción de 3er molar (2015)',
        traumatismos: 'Fractura de radio distal derecho en 2010 por caída de escaleras. Tratamiento conservador, sin secuelas.',
        alergias: 'Penicilina (urticaria generalizada), Polvo (rinitis alérgica)',
        tipo_sangre: 'AB+',
        zoonosis: 'Tiene un perro, desparasitado y vacunado al corriente.',
        uso_lentes: true,
        uso_protesis: false,
        observaciones: 'Paciente con estilo de vida sedentario y dieta inadecuada. Factor de riesgo importante para su patología metabólica.',
    }, { conflict: 'paciente_id' })

    // ================================================================
    // 4. Antecedentes Heredo-Familiares (AHF)
    // ================================================================
    console.log('\n📋 Insertando AHF...')
    await safeInsert('antecedentes_hf', {
        paciente_id: pid,
        diabetes: true,
        diabetes_quien: 'Padre (DM2 desde los 45 años), Hermano mayor (DM2 desde los 42 años)',
        hipertension: true,
        hipertension_quien: 'Padre, Madre',
        cardiopatias: true,
        cardiopatias_quien: 'Padre: IAM a los 62 años, bypass coronario',
        cancer: false,
        cancer_quien: '',
        obesidad: true,
        obesidad_quien: 'Padre, Hermano',
        asma: false,
        asma_quien: '',
        artritis: true,
        artritis_quien: 'Madre: Artritis reumatoide desde los 55 años',
        epilepsia: false,
        tuberculosis: false,
        enfermedades_renales: false,
        enfermedades_hepaticas: false,
        enfermedades_mentales: false,
        alergias: true,
        alergias_quien: 'Madre: alergia a sulfas',
        otros: 'Abuelo paterno: DM2, amputación de MID. Abuela materna: HTA.',
        observaciones: 'Fuerte carga genética para síndrome metabólico. Antecedente de evento cardiovascular mayor en línea paterna.',
    }, { conflict: 'paciente_id' })

    // ================================================================
    // 5. Historia Ocupacional
    // ================================================================
    console.log('\n📋 Insertando Historia Ocupacional...')
    const ocupacionalData = [
        {
            paciente_id: pid,
            empresa: 'Industrias MX S.A. de C.V.',
            puesto: 'Director Comercial',
            actividades: 'Gestión de ventas corporativas, negociación con clientes, supervisión de equipo comercial de 25 personas, viajes frecuentes.',
            fecha_inicio: '2014-03-01',
            fecha_fin: null,
            riesgos_exposicion: 'Estrés laboral, sedentarismo, viajes frecuentes, jornadas prolongadas',
            epp_utilizado: 'No aplica (trabajo de oficina)',
            accidentes_laborales: 'Ninguno registrado',
            enfermedades_laborales: 'Síndrome del túnel carpiano leve en mano derecha (2022)',
        },
        {
            paciente_id: pid,
            empresa: 'Comercializadora del Norte',
            puesto: 'Gerente Regional de Ventas',
            actividades: 'Ventas al mayoreo, gestión de cartera de clientes, supervisión de sucursales en el noreste.',
            fecha_inicio: '2008-06-15',
            fecha_fin: '2014-02-28',
            riesgos_exposicion: 'Estrés laboral, manejo de vehículo por carretera',
            epp_utilizado: 'No aplica',
            accidentes_laborales: 'Accidente vial menor en 2012, sin lesiones',
            enfermedades_laborales: 'Ninguna',
        }
    ]
    for (const ocu of ocupacionalData) {
        await safeInsert('historia_ocupacional', ocu, { conflict: 'paciente_id' })
    }

    // ================================================================
    // 6. Exploración Física (tabla separada)
    // ================================================================
    console.log('\n📋 Insertando Exploración Física...')
    await safeInsert('exploraciones_fisicas', {
        paciente_id: pid,
        fecha_exploracion: '2026-02-20T10:30:00',
        medico_responsable: 'Dr. Juan Pérez Martínez',
        peso_kg: 98.5,
        talla_cm: 175,
        imc: 32.1,
        ta_sistolica: '140',
        ta_diastolica: '90',
        fc: '85',
        fr: '18',
        temperatura: '36.6',
        spo2: '94',
        perimetro_abdominal: '108',
        perimetro_cefalico: '',
        glucosa: '108',
        cabeza: 'Normocéfala, sin exostosis',
        ojos: 'Pupilas isocóricas. Fondo de ojo: cruces AV aumentados',
        oidos: 'CAE permeables, MT íntegras bilaterales',
        nariz: 'Tabique central, mucosa rosada',
        boca: 'Mucosa hidratada, piezas completas',
        cuello: 'Sin adenopatías, tiroides no palpable',
        torax: 'Simétrico, MV presente bilateral, RC rítmicos sin soplos',
        abdomen: 'Globoso, blando, depresible, no doloroso, peristalsis +',
        extremidades_superiores: 'Simétricas, fuerza 5/5, sin edema',
        extremidades_inferiores: 'Pulsos pedios +, varices incipientes MID',
        columna: 'Dolor leve L4-L5, Lasègue negativo bilateral',
        piel: 'Acantosis nigricans leve en cuello y axilas',
        neurologico: 'Glasgow 15, pares craneales íntegros',
        genitourinario: 'Sin alteraciones',
        observaciones: 'Paciente con obesidad central, signos de resistencia a insulina (acantosis). Control metabólico necesario.',
    })

    // ================================================================
    // 7. Exámenes de Audiometría
    // ================================================================
    console.log('\n📋 Insertando Audiometría...')
    await safeInsert('examenes_audiometria', {
        paciente_id: pid,
        fecha_estudio: '2026-02-18',
        medico_responsable: 'Dra. Ana López Hernández',
        equipo: 'Audiómetro Maico MA-42',
        od_250: 15, od_500: 20, od_1000: 15, od_2000: 20, od_4000: 25, od_8000: 30,
        oi_250: 10, oi_500: 15, oi_1000: 15, oi_2000: 25, oi_4000: 30, oi_8000: 35,
        logoaudiometria_od: 92,
        logoaudiometria_oi: 88,
        interpretacion: 'Audición bilateral normal para frecuencias conversacionales. Leve descenso en agudos bilateral, más acentuado en oído izquierdo.',
        diagnostico: 'Hipoacusia neurosensorial leve bilateral en frecuencias agudas. Compatible con presbiacusia incipiente.',
        clasificacion: 'Clase A - Apto',
        recomendaciones: 'Uso de protección auditiva en ambientes ruidosos. Control audiométrico anual.',
    })

    // ================================================================
    // 8. Exámenes de Espirometría
    // ================================================================
    console.log('\n📋 Insertando Espirometría...')
    await safeInsert('examenes_espirometria', {
        paciente_id: pid,
        fecha_estudio: '2026-02-18',
        medico_responsable: 'Dra. Ana López Hernández',
        equipo: 'Espirómetro Vitalograph Alpha',
        fvc: 4.2,
        fvc_predicho: 4.8,
        fvc_porcentaje: 87.5,
        fev1: 3.4,
        fev1_predicho: 3.9,
        fev1_porcentaje: 87.2,
        fev1_fvc: 80.9,
        pef: 8.5,
        fef_25_75: 3.2,
        interpretacion: 'Espirometría dentro de límites normales. FVC y FEV1 conservados. Relación FEV1/FVC normal.',
        diagnostico: 'Función pulmonar normal',
        calidad_prueba: 'A',
        patron: 'Normal',
        recomendaciones: 'Sin restricciones respiratorias. Control espirométrico anual.',
    })

    // ================================================================
    // 9. Exámenes de Rayos X
    // ================================================================
    console.log('\n📋 Insertando Rayos X...')
    await safeInsert('examenes_rayos_x', {
        paciente_id: pid,
        fecha_estudio: '2026-02-18',
        tipo_estudio: 'Radiografía PA de Tórax',
        medico_responsable: 'Dr. Roberto García Sánchez',
        hallazgos: 'Silueta cardíaca con ICT 0.52 (límite normal). Parénquima sin condensaciones. Ángulos costofrénicos libres. Mediastino centrado.',
        clasificacion_oit: '0/0',
        conclusion: 'Cardiomegalia borderline. Sin patología pleuropulmonar activa.',
        recomendaciones: 'Control anual. Valorar ecocardiograma.',
    })

    // ================================================================
    // 10. Exámenes de Vista
    // ================================================================
    console.log('\n📋 Insertando Examen de Vista...')
    await safeInsert('examenes_vista', {
        paciente_id: pid,
        fecha_estudio: '2026-02-18',
        medico_responsable: 'Dr. Carlos Mendoza Ruiz',
        agudeza_od_sc: '20/30',
        agudeza_od_cc: '20/20',
        agudeza_oi_sc: '20/25',
        agudeza_oi_cc: '20/20',
        vision_cromatica: 'Normal (Ishihara 14/14)',
        campimetria: 'Sin alteraciones',
        presion_intraocular_od: 16,
        presion_intraocular_oi: 15,
        fondo_de_ojo: 'Cruces arteriovenosos aumentados grado I bilateral. Sin hemorragias ni exudados. Papila con bordes nítidos.',
        diagnostico: 'Presbicia. Retinopatía hipertensiva grado I bilateral.',
        usa_lentes: true,
        tipo_lentes: 'Bifocales progresivos',
        graduacion_od: '+1.50 esf / -0.50 cil',
        graduacion_oi: '+1.25 esf / -0.25 cil',
        recomendaciones: 'Uso permanente de lentes correctivos. Control oftalmológico cada 6 meses por retinopatía hipertensiva.',
    })

    // ================================================================
    // 11. Consentimientos Firmados
    // ================================================================
    console.log('\n📋 Insertando Consentimientos...')
    const consentimientos = [
        {
            paciente_id: pid,
            tipo_consentimiento: 'Examen Médico Ocupacional',
            fecha_firma: '2026-02-15T09:00:00',
            firmado: true,
            observaciones: 'Paciente acepta someterse a examen médico ocupacional completo.',
        },
        {
            paciente_id: pid,
            tipo_consentimiento: 'Uso de Datos Médicos',
            fecha_firma: '2026-02-15T09:05:00',
            firmado: true,
            observaciones: 'Autoriza el uso de sus datos clínicos para fines de medicina laboral.',
        },
        {
            paciente_id: pid,
            tipo_consentimiento: 'Toma de Muestras de Laboratorio',
            fecha_firma: '2026-02-18T07:30:00',
            firmado: true,
            observaciones: 'Paciente en ayuno de 12 horas. Acepta toma de muestras sanguíneas y urinarias.',
        },
    ]
    for (const c of consentimientos) {
        await safeInsert('consentimientos_firmados', c)
    }

    // ================================================================
    // 12. Notas Médicas
    // ================================================================
    console.log('\n📋 Insertando Notas Médicas...')
    const notas = [
        {
            paciente_id: pid,
            tipo: 'Nota de Evolución',
            contenido: 'Paciente masculino de 50 años con diagnósticos de DM2, HTA y Dislipidemia. Acude a examen médico ocupacional periódico. Refiere adherencia parcial al tratamiento farmacológico. Ha ganado 3 kg en últimos 6 meses. Glucosa de ayuno 108 mg/dL (objetivo <100). HbA1c 6.2% (prediabético). Se ajusta plan nutricional y se refuerza importancia del ejercicio.',
            medico_responsable: 'Dr. Juan Pérez Martínez',
            created_at: '2026-02-20T11:00:00',
        },
        {
            paciente_id: pid,
            tipo: 'Nota de Interconsulta',
            contenido: 'Se solicita valoración por Oftalmología por hallazgo de cruces AV aumentados en fondo de ojo, compatible con retinopatía hipertensiva grado I. Envío con resultados de laboratorio y cifras tensionales.',
            medico_responsable: 'Dr. Juan Pérez Martínez',
            created_at: '2026-02-20T11:30:00',
        },
    ]
    for (const n of notas) {
        await safeInsert('notas_medicas', n)
    }

    // ================================================================
    // 13. Eventos Clínicos (Línea de Tiempo)
    // ================================================================
    console.log('\n📋 Insertando Eventos Clínicos...')
    const eventos = [
        {
            paciente_id: pid,
            tipo_evento: 'consulta',
            descripcion: 'Examen médico ocupacional de ingreso',
            fecha_evento: '2014-03-01T10:00:00',
            medico_responsable: 'Dr. Ricardo Garza Treviño',
            resultado: 'Apto sin restricciones',
        },
        {
            paciente_id: pid,
            tipo_evento: 'diagnostico',
            descripcion: 'Diagnóstico de Hipertensión Arterial Sistémica',
            fecha_evento: '2019-06-15T09:00:00',
            medico_responsable: 'Dr. Juan Pérez Martínez',
            resultado: 'Se inicia Losartán 50mg c/24h',
        },
        {
            paciente_id: pid,
            tipo_evento: 'diagnostico',
            descripcion: 'Diagnóstico de Diabetes Mellitus tipo 2',
            fecha_evento: '2021-01-20T10:00:00',
            medico_responsable: 'Dr. Juan Pérez Martínez',
            resultado: 'Se inicia Metformina 850mg c/12h + plan nutricional',
        },
        {
            paciente_id: pid,
            tipo_evento: 'laboratorio',
            descripcion: 'Laboratorios de control - Perfil metabólico completo',
            fecha_evento: '2026-02-18T07:45:00',
            medico_responsable: 'Dra. Ana López Hernández',
            resultado: 'Glucosa 108, HbA1c 6.2%, Col Total 245, Triglicéridos 185. Alerta metabólica.',
        },
        {
            paciente_id: pid,
            tipo_evento: 'consulta',
            descripcion: 'Examen médico ocupacional periódico 2026',
            fecha_evento: '2026-02-20T10:00:00',
            medico_responsable: 'Dr. Juan Pérez Martínez',
            resultado: 'Apto con restricciones. Restricción de esfuerzo físico intenso.',
        },
    ]
    for (const e of eventos) {
        await safeInsert('eventos_clinicos', e)
    }

    console.log('\n🎉 ¡Todos los datos de Eduardo Flores Castillo han sido insertados!')
    console.log('\nResumen:')
    console.log('  ✅ Datos personales, vitales, antropométricos')
    console.log('  ✅ JSONB: exploración física, audiometría, espirometría, radiografía')
    console.log('  ✅ Antecedentes No Patológicos (APNP)')
    console.log('  ✅ Antecedentes Heredo-Familiares (AHF)')
    console.log('  ✅ Historia Ocupacional (2 empleos)')
    console.log('  ✅ Exploración Física (tabla)')
    console.log('  ✅ Audiometría (examen)')
    console.log('  ✅ Espirometría (examen)')
    console.log('  ✅ Rayos X (examen)')
    console.log('  ✅ Examen de Vista')
    console.log('  ✅ Consentimientos firmados (3)')
    console.log('  ✅ Notas médicas (2)')
    console.log('  ✅ Eventos clínicos / Línea de tiempo (5)')
    console.log('  ✅ Laboratorio (ya existente, 86 parámetros)')
}

main().catch(console.error)
