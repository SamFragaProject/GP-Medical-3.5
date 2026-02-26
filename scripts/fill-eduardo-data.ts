/**
 * Script para llenar TODOS los datos médicos de Eduardo Flores Castillo
 * Ejecutar con: npx tsx scripts/fill-eduardo-data.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://kftxftikoydldcexkady.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU'
)

async function main() {
    // 1. Buscar a Eduardo Flores Castillo
    const { data: paciente, error: fetchErr } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido_paterno, apellido_materno')
        .ilike('nombre', '%Eduardo%')
        .ilike('apellido_paterno', '%Flores%')
        .single()

    if (fetchErr || !paciente) {
        console.error('❌ No se encontró a Eduardo Flores Castillo:', fetchErr?.message)
        return
    }

    console.log(`✅ Encontrado: ${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno} (${paciente.id})`)

    // 2. Actualizar con TODOS los datos médicos completos
    const { error: updateErr } = await supabase
        .from('pacientes')
        .update({
            // === DATOS PERSONALES ===
            curp: 'FOCE750918HDFLRS07',
            rfc: 'FOCE750918H4T',
            nss: '34957509182',
            estado_civil: 'Casado',
            tipo_sangre: 'AB+',
            email: 'eduardo.flores@mediflow.mx',
            telefono: '5566554433',
            fecha_nacimiento: '1975-09-18',
            genero: 'masculino',

            // === DATOS LABORALES ===
            numero_empleado: 'EMP-0147',
            empresa_nombre: 'Mediflow Industries S.A. de C.V.',
            puesto: 'Director Comercial',
            area: 'Ventas',
            departamento: 'Comercial',
            turno: 'Mixto',
            fecha_ingreso: '2015-08-20',

            // === ANTECEDENTES MÉDICOS ===
            alergias: 'Ninguna conocida',
            antecedentes_personales: 'Tabaquismo previo (fumó de 1998 a 2020, 1 cajetilla/día × 22 años = índice tabáquico 22). Sedentarismo. Hipertensión arterial diagnosticada en 2019, en tratamiento con Losartán 50mg/día. Prediabetes detectada en 2024. Colecistectomía laparoscópica en 2018.',
            antecedentes_familiares: 'Padre: DM tipo 2 + HTA. Madre: hipertiroidismo. Hermano mayor: infarto agudo al miocardio a los 52 años. Abuela paterna: DM tipo 2, amputación de pie izquierdo.',
            padecimiento_actual: 'Paciente refiere fatiga crónica, cefalea tensional frecuente (2-3 veces/semana), dolor lumbar intermitente de 6 meses de evolución, y ronquidos nocturnos con apneas referidas por esposa. Aumento de peso de 8kg en los últimos 2 años. Poliuria y polidipsia moderadas.',

            // === CONTACTO DE EMERGENCIA ===
            contacto_emergencia_nombre: 'Patricia Ramírez de Flores',
            contacto_emergencia_parentesco: 'Esposa',
            contacto_emergencia_telefono: '5533221144',

            // === DICTAMEN ===
            dictamen_aptitud: 'apto_con_restricciones',
            restricciones: 'No trabajar jornadas >10 horas continuas; No conducir vehículos pesados sin valoración oftalmológica; Evitar estrés térmico; Control metabólico trimestral obligatorio',
            recomendaciones: 'Iniciar programa de ejercicio aeróbico supervisado (30 min/día, 5 días/semana); Referir a nutriología para plan alimenticio hipocalórico e hipoglucémico; Control de HTA mensual; Valoración por oftalmología para actualizar lentes; Descartar SAOS mediante polisomnografía; Revaloración nefrológica por microalbuminuria',

            // === SIGNOS VITALES ===
            peso_kg: 95.0,
            talla_cm: 172.0,
            imc: 32.1,
            presion_sistolica: 140,
            presion_diastolica: 90,
            frecuencia_cardiaca: 85,
            saturacion_o2: 94,
            temperatura: 36.6,

            // === EXPLORACIÓN FÍSICA COMPLETA (JSONB) ===
            exploracion_fisica: {
                aspecto_general: 'Paciente masculino de 50 años, consciente, orientado en las 3 esferas, cooperador. Complexión obesa, facies pletórica. Marcha normal. Higiene adecuada.',
                cabeza: 'Normocéfalo sin exostosis. Cabello con alopecia androgénica grado III (Hamilton-Norwood). Sin cicatrices visibles.',
                ojos: 'Pupilas isocóricas, normorreactivas a la luz. Conjuntivas pálidas. Fondo de ojo: cruces arteriovenosos grado I (retinopatía hipertensiva leve). Presbicia. Agudeza visual: OD 20/40, OI 20/30.',
                oidos: 'Conductos auditivos permeables. Membranas timpánicas íntegras bilateralmente. Weber central. Rinne positivo bilateral. Audición conservada para la edad.',
                nariz: 'Tabique nasal sin desviación. Mucosa nasal húmeda, sin pólipos. Senos paranasales no dolorosos a la palpación.',
                boca_faringe: 'Mucosa oral húmeda, sin lesiones. Dentadura incompleta: ausencia de piezas 36 y 46. Caries en 27. Amígdalas grado I. Úvula centrada, paladar blando móvil.',
                cuello: 'Cilíndrico, simétrico. Tiroides grado I, no dolorosa. Pulsos carotídeos simétricos sin soplos. Ganglios no palpables. Movilidad completa.',
                torax: 'Tórax normolíneo. Movimientos de amplexión y amplexación simétricos. Fremitus vocal conservado. Campos pulmonares ventilados, sin estertores ni sibilancias. Ruidos cardíacos rítmicos, con soplo sistólico grado I/VI en foco aórtico.',
                abdomen: 'Globoso a expensas de panículo adiposo. Blando, depresible, no doloroso a la palpación superficial ni profunda. Peristalsis presente, normoactiva. Hepatomegalia a 2cm debajo del reborde costal derecho. Cicatriz de colecistectomía en hipocondrio derecho. No masas palpables.',
                extremidades_superiores: 'Pulsos radiales presentes y simétricos. Llenado capilar <2 segundos. Sin edema. Fuerza muscular 5/5. Reflejos osteotendinosos 2+ bilaterales. Sin signos de neuropatía.',
                extremidades_inferiores: 'Pulsos pedios presentes bilateralmente. Edema maleolar bilateral leve (+/+++). Várices en safena interna bilateral grado II. Llenado capilar <3 segundos. Sensibilidad conservada (monofilamento 10g positivo). Reflejos aquíleos 2+. Sin úlceras.',
                columna: 'Dolor a la palpación de L4-L5. Contractura paravertebral lumbar bilateral. Lasègue negativo bilateral. Flexión anterior limitada a 60°. Lordosis lumbar acentuada.',
                piel: 'Acantosis nigricans en cuello y axilas (marcador de resistencia a la insulina). Lesiones de acné residual en espalda. Onicomicosis en hallux derecho. Sin lesiones sospechosas. Turgor conservado.',
                genitourinario: 'Diferido. Exploración prostática recomendada por edad.',
                neurologico: 'Glasgow 15/15. Pares craneales sin alteraciones. Fuerza 5/5 en las 4 extremidades. Sensibilidad superficial y profunda conservada. Coordinación normal. Romberg negativo. Marcha normal.',
                psicologico: 'Paciente con signos de estrés laboral crónico. Refiere insomnio de conciliación 3-4 noches/semana. Ansiedad moderada. Niega ideación suicida. Beck: 14 pts (depresión leve). Se sugiere valoración psicológica.',
            },

            // === AUDIOMETRÍA (JSONB) ===
            audiometria: {
                oido_derecho: {
                    hz_250: 10, hz_500: 15, hz_1000: 15, hz_2000: 15,
                    hz_3000: 20, hz_4000: 20, hz_6000: 20, hz_8000: 15,
                    promedio_tonal: 17, diagnostico: 'Normal'
                },
                oido_izquierdo: {
                    hz_250: 10, hz_500: 10, hz_1000: 15, hz_2000: 15,
                    hz_3000: 15, hz_4000: 20, hz_6000: 20, hz_8000: 15,
                    promedio_tonal: 15, diagnostico: 'Normal'
                },
                diagnostico_general: 'Audición conservada para la edad (50 años). Leve descenso en frecuencias agudas bilateral esperado para la edad.',
                calidad: 'Buena',
                requiere_proteccion: false,
                semaforo: 'verde'
            },

            // === ESPIROMETRÍA (JSONB) ===
            espirometria: {
                fvc_predicho: 4.20,
                fvc_observado: 3.80,
                fvc_porcentaje: 90,
                fev1_predicho: 3.40,
                fev1_observado: 3.00,
                fev1_porcentaje: 88,
                fev1_fvc: 79,
                pef_predicho: 7.50,
                pef_observado: 6.50,
                pef_porcentaje: 87,
                diagnostico: 'Espirometría borderline. FEV1 ligeramente bajo. Puede relacionarse con tabaquismo previo (22 años). Sin patrón obstructivo ni restrictivo definido.',
                patron: 'Normal',
                calidad: 'B',
                semaforo: 'amarillo',
                aptitud_respiratoria: 'Apto con vigilancia'
            },

            // === LABORATORIO COMPLETO (JSONB) ===
            laboratorio: {
                // Biometría hemática
                hemoglobina: 17.2,
                hematocrito: 50.1,
                leucocitos: 7800,
                eritrocitos: 5.1,
                plaquetas: 235000,
                vgm: 88.5,
                hgm: 30.2,
                cmhg: 34.1,
                neutrofilos: 58.0,
                linfocitos: 30.0,
                monocitos: 6.0,
                eosinofilos: 4.0,
                basofilos: 1.0,
                bandas: 1.0,
                vpm: 9.8,
                rdw_cv: 13.2,

                // Química sanguínea
                glucosa: 108,
                urea: 42.0,
                bun: 19.6,
                creatinina: 1.1,
                acido_urico: 7.8,

                // Perfil lipídico
                colesterol_total: 245,
                colesterol_hdl: 38,
                colesterol_ldl: 155,
                trigliceridos: 210,

                // Perfil hepático
                bilirrubina_total: 0.9,
                bilirrubina_directa: 0.3,
                bilirrubina_indirecta: 0.6,
                tgo_ast: 35,
                tgp_alt: 42,
                fosfatasa_alcalina: 95,
                ggt: 68,
                proteinas_totales: 7.2,
                albumina: 4.1,
                globulina: 3.1,
                relacion_ag: 1.3,
                ldh: 185,
                cpk: 140,

                // Electrolitos
                sodio: 140,
                potasio: 4.2,
                cloro: 102,
                calcio: 9.5,
                fosforo: 3.8,
                magnesio: 2.0,
                hierro: 95,
                ferritina: 180,

                // Tiroides
                tsh: 3.2,
                t3: 120,
                t4: 8.5,
                t4_libre: 1.2,

                // Otros
                psa: 2.1,
                hemoglobina_glucosilada: 6.2,
                vsg: 12,
                pcr: 3.5,
                factor_reumatoide: 8.0,

                // Serología
                vdrl: 'No reactivo',
                vih: 'Negativo',
                hepatitis_b: 'Negativo',
                hepatitis_c: 'Negativo',
                grupo_sanguineo: 'AB',
                rh: 'Positivo',

                // Coagulación
                tp: 12.5,
                tpt: 28.0,
                inr: 1.0,

                // EGO
                examen_orina: 'Color amarillo, aspecto turbio. Densidad 1.020, pH 5.5. Proteínas: trazas. Glucosa: 50 mg/dL (anormal). Hemoglobina: negativo. Leucocitos: 3-5/campo. Nitritos: negativo. Bacterias: escasas. Cristales de ácido úrico. Cilindros: no se observan.',
                examen_orina_densidad: 1.020,
                examen_orina_ph: 5.5,
                examen_orina_proteinas: 'Trazas',
                examen_orina_glucosa: '50 mg/dL',
                examen_orina_hemoglobina: 'Negativo',
                examen_orina_leucocitos: '3-5/campo',
                examen_orina_nitritos: 'Negativo',
                examen_orina_bacterias: 'Escasas',
                examen_orina_cristales: 'Ácido úrico',
                examen_orina_cilindros: 'No se observan',
                examen_orina_eritrocitos: '0-2/campo',
                coprologico: 'Sin parásitos. Flora bacteriana normal. Sangre oculta negativa.',

                // Otros estudios
                otros: {
                    'Microalbuminuria': '45 mg/L (alto)',
                    'Relación Albúmina/Creatinina': '42 mg/g',
                    'Tasa Filtración Glomerular (eGFR)': '78 mL/min/1.73m² (leve reducción)',
                    'Vitamina D (25-OH)': '18 ng/mL (insuficiente)',
                    'Vitamina B12': '320 pg/mL (normal)',
                    'Ácido Fólico': '8.5 ng/mL (normal)',
                    'Insulina basal': '18.5 µU/mL (elevada)',
                    'HOMA-IR': '4.9 (resistencia a insulina)',
                    'Péptido C': '3.2 ng/mL (normal-alto)',
                    'Homocisteína': '14.5 µmol/L (límite alto)',
                    'Antígeno Carcinoembrionario (CEA)': '2.8 ng/mL (normal)',
                    'CA 19-9': '12.0 U/mL (normal)',
                }
            },

            // === RADIOGRAFÍA (JSONB) ===
            radiografia: {
                tipo: 'torax',
                hallazgos: 'Silueta cardíaca en límite superior de normalidad (índice cardiotorácico 0.52). Botón aórtico prominente. Campos pulmonares sin opacidades focales ni infiltrados. Hilio derecho ligeramente engrosado. Senos costofrénicos libres. No se observan derrames. Columna torácica con espondilosis leve. Costillas íntegras.',
                impresion_diagnostica: 'Cardiomegalia limítrofe. Ateromatosis aórtica. Correlacionar con ecocardiograma. Sin evidencia de patología pulmonar parenquimatosa.',
                clasificacion_oit: 'No aplica (no es radiografía ocupacional por exposición a polvos)',
                semaforo: 'amarillo'
            },

        })
        .eq('id', paciente.id)

    if (updateErr) {
        console.error('❌ Error actualizando:', updateErr.message)
        return
    }

    console.log('✅ Eduardo Flores Castillo actualizado con TODOS los datos médicos')

    // 3. Verificar
    const { data: verify } = await supabase
        .from('pacientes')
        .select('nombre, apellido_paterno, peso_kg, imc, presion_sistolica, laboratorio, audiometria, espirometria, radiografia, exploracion_fisica, dictamen_aptitud')
        .eq('id', paciente.id)
        .single()

    if (verify) {
        const lab = verify.laboratorio as any
        const exp = verify.exploracion_fisica as any
        console.log('\n📊 VERIFICACIÓN:')
        console.log(`  Peso: ${verify.peso_kg} kg | IMC: ${verify.imc} | TA: ${verify.presion_sistolica}`)
        console.log(`  Dictamen: ${verify.dictamen_aptitud}`)
        console.log(`  Lab campos: ${lab ? Object.keys(lab).length : 0}`)
        console.log(`  Lab glucosa: ${lab?.glucosa} | hemoglobina: ${lab?.hemoglobina} | colesterol: ${lab?.colesterol_total}`)
        console.log(`  Lab otros: ${lab?.otros ? Object.keys(lab.otros).length : 0} estudios extra`)
        console.log(`  Exploración campos: ${exp ? Object.keys(exp).length : 0}`)
        console.log(`  Audiometría: ${verify.audiometria ? 'SÍ' : 'NO'}`)
        console.log(`  Espirometría: ${verify.espirometria ? 'SÍ' : 'NO'}`)
        console.log(`  Radiografía: ${verify.radiografia ? 'SÍ' : 'NO'}`)
    }
}

main().catch(console.error)
