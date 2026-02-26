import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Necesitas cargar las variables de entorno o colocarlas aqui directo
// Dado que estamos corriendo con tsx, usaremos dotenv
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tu-url.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'tu-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const randomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function seedData() {
    console.log("Iniciando sesión como Admin Empresa...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@mediflow.mx',
        password: 'admin123'
    });

    if (authError || !authData.user) {
        console.error("No se pudo iniciar sesión:", authError?.message);
        return;
    }

    console.log("Login exitoso, buscando empresa del Admin...");
    const { data: pData } = await supabase.from('pacientes').select('empresa_id').limit(1);
    const empresaId = pData?.[0]?.empresa_id;
    if (!empresaId) {
        console.error("No se pudo determinar el empresa_id");
        return;
    }
    console.log("Empresa ID:", empresaId);

    // Definir 5 perfiles reales
    const pacientesToCreate = [
        {
            id: randomUUID(), empresa_id: empresaId,
            nombre: 'Carlos', apellido_paterno: 'Mendoza', apellido_materno: 'Ruiz',
            curp: 'MERC850412HDFNRZ01', nss: '82048501234', fecha_nacimiento: '1985-04-12', genero: 'Masculino',
            estado_civil: 'Casado', puesto: 'Operador de Maquinaria Pesada', area: 'Operaciones', departamento: 'Construcción',
            turno: 'Matutino', fecha_ingreso: '2019-03-15', tipo_contrato: 'Indeterminado',
            tipo_sangre: 'O+', alergias: 'Penicilina', telefono: '5512345678', email: 'carlos.mendoza@email.com'
        },
        {
            id: randomUUID(), empresa_id: empresaId,
            nombre: 'Laura', apellido_paterno: 'Gómez', apellido_materno: 'Díaz',
            curp: 'GODL920825MDFMRZ04', nss: '45129208251', fecha_nacimiento: '1992-08-25', genero: 'Femenino',
            estado_civil: 'Soltero', puesto: 'Analista de Datos', area: 'Sistemas', departamento: 'TI',
            turno: 'Matutino', fecha_ingreso: '2021-06-01', tipo_contrato: 'Indeterminado',
            tipo_sangre: 'A+', alergias: 'Ninguna', telefono: '5598765432', email: 'laura.gomez@email.com'
        },
        {
            id: randomUUID(), empresa_id: empresaId,
            nombre: 'Roberto', apellido_paterno: 'Sánchez', apellido_materno: 'López',
            curp: 'SALR881105HDFNZP09', nss: '73088811056', fecha_nacimiento: '1988-11-05', genero: 'Masculino',
            estado_civil: 'Divorciado', puesto: 'Técnico de Laboratorio Químico', area: 'Calidad', departamento: 'Laboratorio',
            turno: 'Vespertino', fecha_ingreso: '2018-02-10', tipo_contrato: 'Indeterminado',
            tipo_sangre: 'B+', alergias: 'Polvo', telefono: '5544332211', email: 'roberto.sanchez@email.com'
        },
        {
            id: randomUUID(), empresa_id: empresaId,
            nombre: 'Ana Sofía', apellido_paterno: 'Martínez', apellido_materno: 'Vega',
            curp: 'MAVA980315MDFRZS02', nss: '12189803154', fecha_nacimiento: '1998-03-15', genero: 'Femenino',
            estado_civil: 'Soltero', puesto: 'Auxiliar Administrativo', area: 'Recursos Humanos', departamento: 'RH',
            turno: 'Matutino', fecha_ingreso: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
            tipo_contrato: 'Prueba',
            tipo_sangre: 'O-', alergias: 'Lactosa', telefono: '5577889900', email: 'ana.martinez@email.com'
        },
        {
            id: randomUUID(), empresa_id: empresaId,
            nombre: 'Eduardo', apellido_paterno: 'Flores', apellido_materno: 'Castillo',
            curp: 'FOCE750918HDFLRS07', nss: '34957509182', fecha_nacimiento: '1975-09-18', genero: 'Masculino',
            estado_civil: 'Casado', puesto: 'Director Comercial', area: 'Ventas', departamento: 'Comercial',
            turno: 'Mixto', fecha_ingreso: '2015-08-20', tipo_contrato: 'Indeterminado',
            tipo_sangre: 'AB+', alergias: 'Ninguna', telefono: '5566554433', email: 'eduardo.flores@email.com'
        }
    ];

    console.log("Insertando los 5 pacientes reales en DB por si no existen...");
    // Insert them using raw JS array map matching columns
    const insertData = pacientesToCreate.map(p => ({
        id: p.id,
        empresa_id: p.empresa_id,
        nombre: p.nombre,
        apellido_paterno: p.apellido_paterno,
        apellido_materno: p.apellido_materno,
        curp: p.curp,
        nss: p.nss,
        fecha_nacimiento: p.fecha_nacimiento,
        sexo: p.genero === 'Masculino' ? 'masculino' : 'femenino',
        puesto: p.puesto,
        area: p.area,
        departamento: p.departamento,
        turno: p.turno,
        fecha_ingreso: p.fecha_ingreso,
        tipo_contrato: p.tipo_contrato,
        tipo_sangre: p.tipo_sangre,
        alergias: p.alergias,
        telefono: p.telefono,
        email: p.email,
    }));

    // Upsert or insert ignore if they exist? Since ID is random, let's just insert them. Wait, if they run it twice it makes clones. We don't care, it's demo.
    // To prevent clones, let's delete existing demo ones or just don't worry.
    const { error: errorPacientes } = await supabase.from('pacientes').insert(insertData);
    if (errorPacientes) {
        console.error("Error inserting patients:", errorPacientes);
        // It might fail if CURP is unique. Let's keep going if so, they might already exist.
    }

    // Now let's fetch ALL patients from the company (including Carlos Eduardo, Mendoza, etc)
    const { data: allPacientes } = await supabase.from('pacientes').select('id, empresa_id, nombre, apellido_paterno, fecha_ingreso, alergias, tipo_sangre').eq('empresa_id', empresaId);

    if (!allPacientes || allPacientes.length === 0) return;

    for (const p of allPacientes) {
        const paciente_id = p.id;

        // 0. CREATE EXPEDIENTE CLINICO IF NOT EXISTS
        const expId = randomUUID();
        const { data: existExp } = await supabase.from('expedientes_clinicos').select('id').eq('paciente_id', paciente_id).limit(1);
        let expedienteIdForExams = existExp?.[0]?.id;
        if (!expedienteIdForExams) {
            await supabase.from('expedientes_clinicos').insert({
                id: expId,
                paciente_id: paciente_id,
                empresa_id: empresaId,
                fecha_apertura: p.fecha_ingreso || new Date().toISOString(),
                estado: 'activo',
                alergias: p.alergias,
                tipo_sangre: p.tipo_sangre
            });
            expedienteIdForExams = expId;
        }

        // 1. ECG
        const idECG = randomUUID();
        const { data: existingEcg } = await supabase.from('electrocardiogramas').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingEcg || existingEcg.length === 0) {
            console.log(`[${p.nombre}] Insertando ECG...`);
            await supabase.from('electrocardiogramas').insert({
                id: idECG,
                empresa_id: empresaId,
                paciente_id,
                ritmo: 'Sinusal',
                frecuencia_cardiaca: randomNumber(60, 95),
                eje_qrs: randomNumber(0, 90),
                onda_p: 'Normal',
                intervalo_pr: randomNumber(120, 200),
                complejo_qrs: randomNumber(80, 110),
                intervalo_qt: randomNumber(350, 440),
                intervalo_qtc: randomNumber(380, 430),
                segmento_st: 'Isoeléctrico',
                onda_t: 'Normal',
                clasificacion: Math.random() > 0.8 ? 'anormalidad_leve' : 'normal',
                hallazgos: 'Trazado normal, sin alteraciones agudas.',
                calidad_prueba: 'Excelente',
                realizado_por: 'Dr. Alejandro Demo',
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
            });
        }

        // 2. AUDIOMETRÍA
        const idAudio = randomUUID();
        const { data: existingAudio } = await supabase.from('audiometrias').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingAudio || existingAudio.length === 0) {
            console.log(`[${p.nombre}] Insertando Audiometría...`);
            await supabase.from('audiometrias').insert({
                id: idAudio,
                empresa_id: empresaId,
                paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Dra. Demo Audio',
                calidad_prueba: 'Buena',
                od_250: randomNumber(10, 20), od_500: randomNumber(10, 20), od_1000: randomNumber(10, 20), od_2000: randomNumber(10, 25), od_3000: randomNumber(10, 30), od_4000: randomNumber(10, 35), od_6000: randomNumber(15, 35), od_8000: randomNumber(15, 40),
                oi_250: randomNumber(10, 20), oi_500: randomNumber(10, 20), oi_1000: randomNumber(10, 20), oi_2000: randomNumber(10, 25), oi_3000: randomNumber(10, 30), oi_4000: randomNumber(10, 35), oi_6000: randomNumber(15, 35), oi_8000: randomNumber(15, 40),
                promedio_tonal_od: randomNumber(10, 25),
                promedio_tonal_oi: randomNumber(10, 25),
                diagnostico_od: 'Audición normal',
                diagnostico_oi: 'Audición normal',
                diagnostico_general: 'Audición dentro de límites normales para la edad',
                semaforo_general: 'verde',
                requiere_proteccion_especifica: false,
                hallazgos: 'Sin alteraciones en frecuencias graves, leves descensos en agudos esperados.'
            });
        }

        // 3. ESPIROMETRÍA
        const idEspiro = randomUUID();
        const { data: existingEspiro } = await supabase.from('espirometrias').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingEspiro || existingEspiro.length === 0) {
            console.log(`[${p.nombre}] Insertando Espirometría...`);
            await supabase.from('espirometrias').insert({
                id: idEspiro,
                empresa_id: empresaId,
                paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Téc. Demo Neumo',
                calidad_prueba: 'A',
                fvc_pred: (randomNumber(350, 500) / 100).toFixed(2),
                fvc_obs: (randomNumber(340, 490) / 100).toFixed(2),
                fvc_pct: randomNumber(90, 105),
                fev1_pred: (randomNumber(280, 400) / 100).toFixed(2),
                fev1_obs: (randomNumber(280, 390) / 100).toFixed(2),
                fev1_pct: randomNumber(90, 105),
                fev1_fvc_pred: randomNumber(78, 85),
                fev1_fvc_obs: randomNumber(80, 85),
                fev1_fvc_pct: randomNumber(95, 105),
                pef_pred: (randomNumber(600, 800) / 100).toFixed(2),
                pef_obs: (randomNumber(600, 750) / 100).toFixed(2),
                pef_pct: randomNumber(90, 105),
                diagnostico: 'Espirometría normal',
                patron: 'Normal',
                semaforo: 'verde',
                aptitud_respiratoria: 'Apto para uso de mascarilla / EPP',
                hallazgos: 'Curva flujo-volumen conservada, sin atrapamiento aéreo.'
            });
        }

        // 4. ESTUDIOS VISUALES
        const idVision = randomUUID();
        const { data: existingVision } = await supabase.from('estudios_visuales').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingVision || existingVision.length === 0) {
            console.log(`[${p.nombre}] Insertando Visión...`);
            await supabase.from('estudios_visuales').insert({
                id: idVision,
                empresa_id: empresaId,
                paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Opt. Demo Visión',
                usa_lentes: Math.random() > 0.5,

                agudeza_sc_od: '20/20',
                agudeza_sc_oi: '20/20',
                agudeza_sc_ao: '20/20',

                campimetria_od: 'Normal',
                campimetria_oi: 'Normal',
                vision_profundidad: 'Normal',
                percepcion_colores: 'Normal',

                diagnostico: 'Emetropía. Visión óptima.',
                requiere_lentes_trabajo: false,
                semaforo: 'verde',
                hallazgos: 'Capacidad visual conservada.'
            });
        }

        // 5. RAYOS X
        const idRayosX = randomUUID();
        const { data: existingRayosX } = await supabase.from('rayos_x').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingRayosX || existingRayosX.length === 0) {
            console.log(`[${p.nombre}] Insertando Rayos X...`);
            await supabase.from('rayos_x').insert({
                id: idRayosX,
                empresa_id: empresaId,
                paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                tipo_estudio: 'Radiografía de Tórax PA',
                proyeccion: 'PA (Posteroanterior)',
                tecnico_radiologo: 'Téc. RX Demo',
                medico_interprete: 'Dr. Rad. Demo',
                calidad_tecnica: 'Buena',
                descripcion_hallazgos: '- Silueta cardíaca de tamaño y morfología normal.\n- Campos pulmonares sin radiopacidades.\n- Senos costofrénicos libres.',
                impresion_diagnostica: 'Radiografía de tórax radiológicamente normal.',
                semaforo: 'verde',
                hallazgos: 'Tórax normal.'
            });
        }

        // 6. LABORATORIO
        const idLab = randomUUID();
        const { data: existingLab } = await supabase.from('laboratorios').select('id').eq('paciente_id', paciente_id).limit(1);
        if (!existingLab || existingLab.length === 0) {
            console.log(`[${p.nombre}] Insertando Laboratorio...`);
            await supabase.from('laboratorios').insert({
                id: idLab,
                empresa_id: empresaId,
                paciente_id,
                tipo_perfil: 'Perfil Laboral Básico',
                fecha_toma: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                fecha_resultados: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                laboratorio_referencia: 'GP Medical Lab',
                estado: 'completado',
                resultados: [
                    {
                        "grupo": "Química Sanguínea",
                        "resultados": [
                            { "parametro": "Glucosa", "resultado": randomNumber(80, 99), "unidad": "mg/dL", "bandera": "normal" },
                            { "parametro": "Triglicéridos", "resultado": randomNumber(100, 149), "unidad": "mg/dL", "bandera": "normal" },
                            { "parametro": "Colesterol Total", "resultado": randomNumber(150, 199), "unidad": "mg/dL", "bandera": "normal" }
                        ]
                    },
                    {
                        "grupo": "Biometría Hemática",
                        "resultados": [
                            { "parametro": "Hemoglobina", "resultado": 14.5, "unidad": "g/dL", "bandera": "normal" },
                            { "parametro": "Hematocrito", "resultado": 45.2, "unidad": "%", "bandera": "normal" },
                            { "parametro": "Plaquetas", "resultado": 250, "unidad": "10^3/µL", "bandera": "normal" },
                            { "parametro": "Leucocitos", "resultado": 7.5, "unidad": "10^3/µL", "bandera": "normal" }
                        ]
                    }
                ],
                interpretacion_medica: 'Estudios de laboratorio dentro de parámetros normales.',
                semaforo: 'verde',
                hallazgos: 'Sin alteraciones metabólicas ni hematológicas.'
            });
        }

        // 7. EXPLORACION FISICA
        const { data: existingVitals } = await supabase.from('exploracion_fisica').select('id').eq('expediente_id', expedienteIdForExams).limit(1);
        if (!existingVitals || existingVitals.length === 0) {
            console.log(`[${p.nombre}] Insertando Exploración Física inicial...`);
            await supabase.from('exploracion_fisica').insert({
                id: randomUUID(),
                expediente_id: expedienteIdForExams,
                fecha_exploracion: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                ta_sistolica: randomNumber(110, 125),
                ta_diastolica: randomNumber(70, 85),
                fc: randomNumber(60, 90),
                fr: randomNumber(12, 18),
                temperatura: 36.5,
                peso_kg: randomNumber(60, 90),
                talla_cm: randomNumber(160, 180),
                imc: randomNumber(22, 28),
                aspecto_general: 'Consciente, tranquilo, cooperador.',
                hallazgos_relevantes: 'Sin hallazgos patológicos al momento del examen.'
            });
        }
    }

    console.log("¡Todo procesado!");
    process.exit(0);
}

seedData().catch(console.error);
