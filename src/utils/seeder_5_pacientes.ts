import { supabase } from '@/lib/supabase';
// Using native crypto.randomUUID for id generation
import toast from 'react-hot-toast';

// Helper functions for random data
const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const randomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Seeder Function
export const seedDemoPatients = async (empresaId: string, sedeId?: string) => {
    if (!empresaId) {
        toast.error("Error: Se requiere un ID de empresa válido para inyectar datos.");
        return;
    }

    const toastId = toast.loading("Iniciando inyección de datos (5 pacientes reales)...");

    try {
        // 1. Define Patient Data Templates (5 detailed profiles)
        const pacientes = [
            {
                // Profile 1: High Risk (Construction/Heavy Machinery) - Requires lots of exams
                id: window.crypto.randomUUID(),
                empresa_id: empresaId,
                sede_id: sedeId,
                nombre: 'Carlos',
                apellido_paterno: 'Mendoza',
                apellido_materno: 'Ruiz',
                curp: 'MERC850412HDFNRZ01',
                nss: '82048501234',
                fecha_nacimiento: '1985-04-12',
                genero: 'Masculino',
                estado_civil: 'Casado',
                puesto: 'Operador de Maquinaria Pesada',
                area: 'Operaciones',
                departamento: 'Construcción',
                turno: 'Matutino',
                fecha_ingreso: '2019-03-15',
                tipo_contrato: 'Indeterminado',
                jornada_horas: 10,
                tipo_sangre: 'O+',
                alergias: 'Penicilina',
                telefono: '5512345678',
                email: 'carlos.mendoza@email.com',
                estatus: 'activo'
            },
            {
                // Profile 2: Medium Risk (Office/Admin with Ergonomic issues)
                id: window.crypto.randomUUID(),
                empresa_id: empresaId,
                sede_id: sedeId,
                nombre: 'Laura',
                apellido_paterno: 'Gómez',
                apellido_materno: 'Díaz',
                curp: 'GODL920825MDFMRZ04',
                nss: '45129208251',
                fecha_nacimiento: '1992-08-25',
                genero: 'Femenino',
                estado_civil: 'Soltero',
                puesto: 'Analista de Datos',
                area: 'Sistemas',
                departamento: 'TI',
                turno: 'Matutino',
                fecha_ingreso: '2021-06-01',
                tipo_contrato: 'Indeterminado',
                jornada_horas: 8,
                tipo_sangre: 'A+',
                alergias: 'Ninguna',
                telefono: '5598765432',
                email: 'laura.gomez@email.com',
                estatus: 'activo'
            },
            {
                // Profile 3: Chemical Exposure (Lab Technician)
                id: window.crypto.randomUUID(),
                empresa_id: empresaId,
                sede_id: sedeId,
                nombre: 'Roberto',
                apellido_paterno: 'Sánchez',
                apellido_materno: 'López',
                curp: 'SALR881105HDFNZP09',
                nss: '73088811056',
                fecha_nacimiento: '1988-11-05',
                genero: 'Masculino',
                estado_civil: 'Divorciado',
                puesto: 'Técnico de Laboratorio Químico',
                area: 'Calidad',
                departamento: 'Laboratorio',
                turno: 'Vespertino',
                fecha_ingreso: '2018-02-10',
                tipo_contrato: 'Indeterminado',
                jornada_horas: 8,
                tipo_sangre: 'B+',
                alergias: 'Polvo',
                telefono: '5544332211',
                email: 'roberto.sanchez@email.com',
                estatus: 'activo'
            },
            {
                // Profile 4: New Hire (Requires admission exams)
                id: window.crypto.randomUUID(),
                empresa_id: empresaId,
                sede_id: sedeId,
                nombre: 'Ana Sofía',
                apellido_paterno: 'Martínez',
                apellido_materno: 'Vega',
                curp: 'MAVA980315MDFRZS02',
                nss: '12189803154',
                fecha_nacimiento: '1998-03-15',
                genero: 'Femenino',
                estado_civil: 'Soltero',
                puesto: 'Auxiliar Administrativo',
                area: 'Recursos Humanos',
                departamento: 'RH',
                turno: 'Matutino',
                fecha_ingreso: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()), // Hired in last 30 days
                tipo_contrato: 'Prueba',
                jornada_horas: 8,
                tipo_sangre: 'O-',
                alergias: 'Lactosa',
                telefono: '5577889900',
                email: 'ana.martinez@email.com',
                estatus: 'activo'
            },
            {
                // Profile 5: Executive (High Stress)
                id: window.crypto.randomUUID(),
                empresa_id: empresaId,
                sede_id: sedeId,
                nombre: 'Eduardo',
                apellido_paterno: 'Flores',
                apellido_materno: 'Castillo',
                curp: 'FOCE750918HDFLRS07',
                nss: '34957509182',
                fecha_nacimiento: '1975-09-18',
                genero: 'Masculino',
                estado_civil: 'Casado',
                puesto: 'Director Comercial',
                area: 'Ventas',
                departamento: 'Comercial',
                turno: 'Mixto',
                fecha_ingreso: '2015-08-20',
                tipo_contrato: 'Indeterminado',
                jornada_horas: 12,
                tipo_sangre: 'AB+',
                alergias: 'Ninguna',
                telefono: '5566554433',
                email: 'eduardo.flores@email.com',
                estatus: 'activo'
            }
        ];

        // 2. Insert Patients
        toast.loading("Insertando pacientes en base de datos...", { id: toastId });
        const { error: errorPacientes } = await supabase
            .from('pacientes')
            .upsert(pacientes.map(p => ({
                id: p.id,
                empresa_id: p.empresa_id,
                sede_id: p.sede_id,
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
                created_at: new Date().toISOString()
            })));

        if (errorPacientes) throw errorPacientes;

        // 3. Create Expedientes Clinicos for each
        toast.loading("Creando expedientes clínicos...", { id: toastId });
        const expedientes = pacientes.map(p => ({
            id: window.crypto.randomUUID(),
            paciente_id: p.id,
            empresa_id: p.empresa_id,
            sede_id: p.sede_id,
            fecha_apertura: p.fecha_ingreso,
            estado: 'activo',
            alergias: p.alergias,
            tipo_sangre: p.tipo_sangre,
            created_at: new Date().toISOString()
        }));

        const { error: errorExpedientes } = await supabase
            .from('expedientes_clinicos')
            .upsert(expedientes);

        if (errorExpedientes) throw errorExpedientes;

        // 4. Generate exams for each patient (Exploracion Fisica & Paraclinicos)
        toast.loading("Generando historial médico y exámenes...", { id: toastId });

        for (const exp of expedientes) {
            const paciente_id = exp.paciente_id;
            const empresa_id = exp.empresa_id;

            // 4.1 Exploración Física
            const exploracionId = window.crypto.randomUUID();
            await supabase.from('exploracion_fisica').insert({
                id: exploracionId,
                expediente_id: exp.id,
                fecha_exploracion: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()),
                ta_sistolica: randomNumber(110, 140),
                ta_diastolica: randomNumber(70, 95),
                fc: randomNumber(65, 90),
                fr: randomNumber(14, 20),
                temperatura: 36.5 + (Math.random() * 0.8),
                peso_kg: randomNumber(60, 100),
                talla_cm: randomNumber(155, 185),
                imc: randomNumber(22, 32),
                aspecto_general: 'Paciente consciente, orientado, buena coloración.',
                created_at: new Date().toISOString()
            });

            // 4.2 ECG
            await supabase.from('electrocardiogramas').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                ritmo: 'Sinusal', frecuencia_cardiaca: randomNumber(60, 95), eje_qrs: randomNumber(0, 90),
                onda_p: 'Normal', intervalo_pr: randomNumber(120, 200), complejo_qrs: randomNumber(80, 110),
                intervalo_qt: randomNumber(350, 440), intervalo_qtc: randomNumber(380, 430),
                segmento_st: 'Isoeléctrico', onda_t: 'Normal', clasificacion: Math.random() > 0.8 ? 'anormalidad_leve' : 'normal',
                hallazgos: 'Trazado normal, sin alteraciones agudas evidentes.',
                calidad_prueba: 'Excelente', realizado_por: 'Dr. Alejandro Demo',
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
            });

            // 4.3 ESPIRÓMETRIA
            await supabase.from('espirometrias').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Téc. Demo Neumo', calidad_prueba: 'A',
                fvc_pred: (randomNumber(350, 500) / 100).toFixed(2), fvc_obs: (randomNumber(340, 490) / 100).toFixed(2), fvc_pct: randomNumber(90, 105),
                fev1_pred: (randomNumber(280, 400) / 100).toFixed(2), fev1_obs: (randomNumber(280, 390) / 100).toFixed(2), fev1_pct: randomNumber(90, 105),
                fev1_fvc_pred: randomNumber(78, 85), fev1_fvc_obs: randomNumber(80, 85), fev1_fvc_pct: randomNumber(95, 105),
                pef_pred: (randomNumber(600, 800) / 100).toFixed(2), pef_obs: (randomNumber(600, 750) / 100).toFixed(2), pef_pct: randomNumber(90, 105),
                diagnostico: 'Espirometría normal', patron: 'Normal', semaforo: 'verde',
                aptitud_respiratoria: 'Apto', hallazgos: 'Curva flujo-volumen conservada.'
            });

            // 4.4 AUDIOMETRIA
            await supabase.from('audiometrias').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Dra. Demo Audio', calidad_prueba: 'Buena',
                od_250: randomNumber(10, 20), od_500: randomNumber(10, 20), od_1000: randomNumber(10, 20), od_2000: randomNumber(10, 25), od_3000: randomNumber(10, 30), od_4000: randomNumber(10, 35), od_6000: randomNumber(15, 35), od_8000: randomNumber(15, 40),
                oi_250: randomNumber(10, 20), oi_500: randomNumber(10, 20), oi_1000: randomNumber(10, 20), oi_2000: randomNumber(10, 25), oi_3000: randomNumber(10, 30), oi_4000: randomNumber(10, 35), oi_6000: randomNumber(15, 35), oi_8000: randomNumber(15, 40),
                promedio_tonal_od: randomNumber(10, 25), promedio_tonal_oi: randomNumber(10, 25),
                diagnostico_od: 'Audición normal', diagnostico_oi: 'Audición normal',
                diagnostico_general: 'Audición dentro de límites normales', semaforo_general: 'verde',
                requiere_proteccion_especifica: false, hallazgos: 'Sin alteraciones.'
            });

            // 4.5 VISION
            await supabase.from('estudios_visuales').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                realizado_por: 'Opt. Demo', usa_lentes: Math.random() > 0.5,
                agudeza_sc_od: '20/20', agudeza_sc_oi: '20/20', agudeza_sc_ao: '20/20',
                campimetria_od: 'Normal', campimetria_oi: 'Normal', vision_profundidad: 'Normal', percepcion_colores: 'Normal',
                diagnostico: 'Emetropía.', requiere_lentes_trabajo: false, semaforo: 'verde', hallazgos: 'Capacidad visual conservada.'
            });

            // 4.6 RAYOS X
            await supabase.from('rayos_x').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                fecha_estudio: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                tipo_estudio: 'Radiografía de Tórax PA', proyeccion: 'PA', tecnico_radiologo: 'Téc. RX', medico_interprete: 'Dr. Rad.',
                calidad_tecnica: 'Buena', descripcion_hallazgos: 'Silueta cardíaca normal.\nCampos pulmonares limpios.',
                impresion_diagnostica: 'Radiografía de tórax normal.', semaforo: 'verde', hallazgos: 'Normal'
            });

            // 4.7 LABORATORIO
            await supabase.from('laboratorios').insert({
                id: window.crypto.randomUUID(), empresa_id, paciente_id,
                tipo_perfil: 'Perfil Laboral Básico', fecha_toma: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                fecha_resultados: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                laboratorio_referencia: 'GP Medical Lab', estado: 'completado',
                resultados: [
                    { "grupo": "Química Sanguínea", "resultados": [{ "parametro": "Glucosa", "resultado": randomNumber(80, 99), "unidad": "mg/dL", "bandera": "normal" }, { "parametro": "Triglicéridos", "resultado": randomNumber(100, 149), "unidad": "mg/dL", "bandera": "normal" }, { "parametro": "Colesterol Total", "resultado": randomNumber(150, 199), "unidad": "mg/dL", "bandera": "normal" }] },
                    { "grupo": "Biometría Hemática", "resultados": [{ "parametro": "Hemoglobina", "resultado": 14.5, "unidad": "g/dL", "bandera": "normal" }, { "parametro": "Hematocrito", "resultado": 45.2, "unidad": "%", "bandera": "normal" }, { "parametro": "Plaquetas", "resultado": 250, "unidad": "10^3/µL", "bandera": "normal" }, { "parametro": "Leucocitos", "resultado": 7.5, "unidad": "10^3/µL", "bandera": "normal" }] }
                ],
                interpretacion_medica: 'Estudios normales.', semaforo: 'verde', hallazgos: 'Sin alteraciones.'
            });

            // Exámenes Aleatorios para Dictamen
            const formsAptitud = ['apto', 'apto_con_restriccion', 'apto', 'no_apto', 'apto'];

            // Generar un resultado de dictamen (Aptitud)
            await supabase.from('dictamenes').insert({
                id: window.crypto.randomUUID(),
                expediente_id: exp.id,
                paciente_id: exp.paciente_id,
                empresa_id: exp.empresa_id,
                tipo_evaluacion: 'periodico',
                resultado: formsAptitud[Math.floor(Math.random() * formsAptitud.length)],
                fecha_evaluacion: new Date().toISOString(),
                vigencia_meses: 12,
                restricciones: 'Uso de EPP',
                created_at: new Date().toISOString()
            });
        }

        // 5. Update Inventory (Simulate usage of tests/exams)
        toast.loading("Actualizando estadísticas e inventarios...", { id: toastId });
        try {
            // Find inventory items to deduct (just doing a simple deduction if items exist)
            const { data: invItems } = await supabase
                .from('inventory')
                .select('id, cantidad_disponible')
                .eq('empresa_id', empresaId)
                .limit(2);

            if (invItems && invItems.length > 0) {
                for (const item of invItems) {
                    if (item.cantidad_disponible > 5) {
                        await supabase
                            .from('inventory')
                            .update({ cantidad_disponible: item.cantidad_disponible - 5 })
                            .eq('id', item.id);
                    }
                }
            }
        } catch (e) { /* Ignore inventory error if table doesn't exist/match */ }

        toast.success("¡5 pacientes de demo insertados correctamente en producción!", { id: toastId });

        // Optional: reload the page to refresh all contexts and queries immediately
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error: any) {
        console.error("Error seeding patients:", error);
        toast.error(`Error: ${error.message}`, { id: toastId });
    }
};
