/**
 * ============================================================
 * Tipos para el Formulario de Historia Clínica Unificado
 * GP Medical Health ERP — Portado del Consolidador IA
 * ============================================================
 */

export interface AccidentEntry {
    fecha: string;
    nombre_empresa: string;
    tipo_accidente: string;
    parte_cuerpo_afectada: string;
    dias_ausencia_laboral: string;
    secuelas: string;
}

export interface HeredofamiliaresCondition {
    has: 'SI' | 'NO' | '';
    parentescos: {
        padre: boolean;
        madre: boolean;
        hermanos: boolean;
        otros: boolean;
    };
    especifique: string;
}

export interface PathologicalCondition {
    has: 'SI' | 'NO' | '';
    especifique: string;
}

export interface ClinicalHistoryFormData {
    folio: string;
    datosGenerales: {
        tipoEvaluacion: {
            ingreso: boolean;
            periodico: boolean;
            regreso: boolean;
            retiro: boolean;
            reubicacion: boolean;
            otros: boolean;
        };
        lugar: string;
        fechaEvaluacion: string;
        apellidos: string;
        nombres: string;
        nombreEmpresa: string;
        giroActividadEmpresa: string;
        edad: string;
        lugarNacimiento: string;
        telefono: string;
        fechaNacimiento: string;
        sexo: 'M' | 'F' | '';
        estadoCivil: {
            casado: boolean;
            soltero: boolean;
            viudo: boolean;
            divorciado: boolean;
            unionLibre: boolean;
        };
        nivelEducacion: {
            primaria: boolean;
            secundaria: boolean;
            tecnicoBachillerato: boolean;
            licenciatura: boolean;
            otro: boolean;
        };
    };
    riesgoLaboral: {
        nombreEmpresa: string;
        puesto: string;
        tiempoExposicion: string;
        riesgos: {
            fisicos: { ruidos: boolean; vibraciones: boolean; iluminacion: boolean; radiaciones: boolean; presiones: boolean; temperaturas: boolean; };
            quimicos: { gases: boolean; vapores: boolean; humos: boolean; particulas: boolean; aerosoles: boolean; polvos: boolean; };
            ergonomicos: { posturasInadecuadas: boolean; cargasManuales: boolean; sobreesfuerzoFisico: boolean; actividadesRepetitivas: boolean; visual: boolean; };
            biologicos: { bacterias: boolean; virus: boolean; hongos: boolean; parasitos: boolean; };
            psicosociales: { trabajoMonotono: boolean; trabajoDuroBajoPresion: boolean; jornadaLaboralExtensa: boolean; };
            electricos: { bajaTension: boolean; altaTension: boolean; electricidadEstatica: boolean; };
            mecanicos: { mecanismosEnMovimiento: boolean; proyeccionParticulas: boolean; herramientasManuales: boolean; };
            locativos: { superficiales: boolean; almacenamiento: boolean; estructuras: boolean; instalaciones: boolean; espacioDeTrabajo: boolean; alturas: boolean; };
        };
    };
    historiaLaboral: {
        nombreEmpresa: string;
        fechaInicioLaboral: string;
        turno: 'Diurno' | 'Nocturno' | 'Mixto' | '';
        puestoTrabajo: string;
        descripcionFunciones: string;
        maquinasEquiposHerramientas: string;
    };
    accidentesEnfermedades: {
        haSufridoAccidentes: 'SI' | 'NO' | '';
        accidentes: AccidentEntry[];
        epp: { casco: boolean; lentesCareta: boolean; proteccionAuditiva: boolean; proteccionRespiratoria: boolean; proteccionCorporal: boolean; calzadoSeguridad: boolean; };
        diagnosticadoEnfermedadTrabajo: 'SI' | 'NO' | '';
        diagnostico: string;
        fechaDiagnostico: string;
    };
    antecedentes: {
        heredofamiliares: Record<string, HeredofamiliaresCondition>;
        personalesNoPatologicos: {
            vacunacion: 'ESQUEMA COMPLETO' | 'ESQUEMA INCOMPLETO' | 'LO IGNORA' | '';
            tabaquismo: {
                has: 'SI' | 'NO' | '';
                numeroCigarros: '1-5' | '6-10' | '11-15' | '16-20' | '>20' | '';
                frecuencia: 'Diario' | 'Semanal' | 'Cada 15 días' | 'Mensual' | '';
            };
            alcoholismo: {
                has: 'SI' | 'NO' | '';
                frecuencia: 'Diario' | 'Semanal' | 'Cada 15 días' | 'Mensual' | '';
            };
        };
        personalesPatologicos: Record<string, PathologicalCondition>;
        ginecoObstetricos: {
            visible: boolean;
            menarca: string;
            ciclos: string;
            fum: string;
            metodoAnticonceptivo: string;
            papanicolaou: {
                realizado: 'SI' | 'NO' | '';
                fecha: string;
                resultado: string;
            };
            paridad: { g: string; p: string; a: string; c: string; };
            fup: string;
            fuc: string;
            fua: string;
        };
    };
    exploracionFisica: {
        signosVitales: { ta: string; fc: string; fr: string; peso: string; talla: string; imc: string; temperatura: string; satO2: string; manoDominante: string; };
        examenSistemas: Record<string, { status: 'NORMAL' | 'ANORMAL' | ''; comentarios: string; }>;
    };
    estudiosComplementarios: {
        audiometria: {
            realizada: 'SI' | 'NO' | '';
            resultado: 'Normal' | 'Anormal' | '';
            reporte: Record<string, { derecho: string; izquierdo: string; }>;
        };
        espirometria: {
            realizada: 'SI' | 'NO' | '';
            resultado: 'Normal' | 'Anormal' | '';
            predicho_fvc: string;
            predicho_fev1: string;
            fev1: string;
            fvc: string;
            reporte: string;
        };
        optometria: {
            realizada: 'SI' | 'NO' | '';
            resultado: 'Normal' | 'Anormal' | '';
            visionLejana: { odSC: string; odCC: string; oiSC: string; oiCC: string; };
            visionCercana: { odSC: string; odCC: string; oiSC: string; oiCC: string; };
            visionCromatica: 'Normal' | 'Anormal' | '';
            reporte: string;
        };
        electrocardiograma: {
            realizada: 'SI' | 'NO' | '';
            resultado: 'Normal' | 'Anormal' | '';
            ritmo: string;
            frecuenciaCardiaca: string;
        };
    };
    pruebasLaboratorio: {
        glucosa: string;
        antidoping: string;
        radiografiaTorax: { realizada: 'SI' | 'NO' | ''; resultado: 'Normal' | 'Anormal' | ''; reporte: string; };
        radiografiaColumnaLumbar: { realizada: 'SI' | 'NO' | ''; resultado: 'Normal' | 'Anormal' | ''; reporte: string; };
        otros: { realizado: 'SI' | 'NO' | ''; reporte: string; };
    };
    diagnostico: {
        lista: string;
        sospechaEnfermedadProfesional: 'SI' | 'NO' | '';
        cual: string;
    };
    concepto: {
        resumen: string;
        puestoDe: string;
        aptitud: 'Apto con restricciones' | 'Apto sin restricciones' | 'No Apto' | '';
        limitacionesRestricciones: string;
    };
    recomendaciones: string;
}

// ── Datos iniciales ──

const HEREDOFAMILIARES_KEYS = ['ARTRITIS', 'CÁNCER', 'CARDIOPATÍAS', 'DEPRESIÓN', 'DIABETES MELLITUS', 'OBESIDAD', 'PRESIÓN ARTERIAL ALTA', 'OTRO'];
const PERSONALES_PATOLOGICOS_KEYS = [
    'Enfermedades cognitivas', 'Órganos de los sentidos', 'Oftalmológicos', 'Neurológicos', 'Psiquiátricos', 'Respiratorios', 'Cardiovasculares', 'Gastrointestinales', 'Genitourinarios', 'Nefrológicos', 'Reumatológicos', 'Músculo-Esqueléticos', 'Alérgico-Inmunológicos', 'Dermatológicos', 'Hemato-Linfáticos', 'Quirúrgicos', 'Infecto-contagiosos', 'Endocrinológicos', 'Oncológicos', 'Otorrinolaringológicos', 'Metabólicos', 'Fármacos'
];
const EXAMEN_SISTEMAS_KEYS = [
    'CABEZA', 'OJOS', 'NARIZ', 'BOCA', 'OÍDOS', 'CUELLO', 'TÓRAX', 'ABDOMEN', 'GENITALES', 'COLUMNA VERTEBRAL', 'EXTREMIDADES', 'NEUROLÓGICO', 'PIEL', 'OSTEOMUSCULAR'
];
const AUDIOMETRIA_FREQUENCIES = ['125', '250', '500', '1000', '2000', '3000', '4000', '6000', '8000'];

export function getInitialClinicalHistoryFormData(): ClinicalHistoryFormData {
    return {
        folio: '',
        datosGenerales: {
            tipoEvaluacion: { ingreso: false, periodico: false, regreso: false, retiro: false, reubicacion: false, otros: false },
            lugar: '', fechaEvaluacion: '', apellidos: '', nombres: '', nombreEmpresa: '', giroActividadEmpresa: '', edad: '', lugarNacimiento: '', telefono: '', fechaNacimiento: '', sexo: '',
            estadoCivil: { casado: false, soltero: false, viudo: false, divorciado: false, unionLibre: false },
            nivelEducacion: { primaria: false, secundaria: false, tecnicoBachillerato: false, licenciatura: false, otro: false },
        },
        riesgoLaboral: {
            nombreEmpresa: '', puesto: '', tiempoExposicion: '',
            riesgos: {
                fisicos: { ruidos: false, vibraciones: false, iluminacion: false, radiaciones: false, presiones: false, temperaturas: false },
                quimicos: { gases: false, vapores: false, humos: false, particulas: false, aerosoles: false, polvos: false },
                ergonomicos: { posturasInadecuadas: false, cargasManuales: false, sobreesfuerzoFisico: false, actividadesRepetitivas: false, visual: false },
                biologicos: { bacterias: false, virus: false, hongos: false, parasitos: false },
                psicosociales: { trabajoMonotono: false, trabajoDuroBajoPresion: false, jornadaLaboralExtensa: false },
                electricos: { bajaTension: false, altaTension: false, electricidadEstatica: false },
                mecanicos: { mecanismosEnMovimiento: false, proyeccionParticulas: false, herramientasManuales: false },
                locativos: { superficiales: false, almacenamiento: false, estructuras: false, instalaciones: false, espacioDeTrabajo: false, alturas: false },
            },
        },
        historiaLaboral: {
            nombreEmpresa: '', fechaInicioLaboral: '', turno: '', puestoTrabajo: '', descripcionFunciones: '', maquinasEquiposHerramientas: '',
        },
        accidentesEnfermedades: {
            haSufridoAccidentes: '', accidentes: [],
            epp: { casco: false, lentesCareta: false, proteccionAuditiva: false, proteccionRespiratoria: false, proteccionCorporal: false, calzadoSeguridad: false },
            diagnosticadoEnfermedadTrabajo: '', diagnostico: '', fechaDiagnostico: '',
        },
        antecedentes: {
            heredofamiliares: HEREDOFAMILIARES_KEYS.reduce((acc, key) => ({ ...acc, [key]: { has: '', parentescos: { padre: false, madre: false, hermanos: false, otros: false }, especifique: '' } }), {}),
            personalesNoPatologicos: {
                vacunacion: '',
                tabaquismo: { has: '', numeroCigarros: '', frecuencia: '' },
                alcoholismo: { has: '', frecuencia: '' },
            },
            personalesPatologicos: PERSONALES_PATOLOGICOS_KEYS.reduce((acc, key) => ({ ...acc, [key]: { has: 'NO', especifique: '' } }), {}),
            ginecoObstetricos: { visible: false, menarca: '', ciclos: '', fum: '', metodoAnticonceptivo: '', papanicolaou: { realizado: '', fecha: '', resultado: '' }, paridad: { g: '', p: '', a: '', c: '' }, fup: '', fuc: '', fua: '' },
        },
        exploracionFisica: {
            signosVitales: { ta: '', fc: '', fr: '', peso: '', talla: '', imc: '', temperatura: '', satO2: '', manoDominante: '' },
            examenSistemas: EXAMEN_SISTEMAS_KEYS.reduce((acc, key) => ({ ...acc, [key]: { status: 'NORMAL', comentarios: '' } }), {}),
        },
        estudiosComplementarios: {
            audiometria: { realizada: '', resultado: '', reporte: AUDIOMETRIA_FREQUENCIES.reduce((acc, freq) => ({ ...acc, [freq]: { derecho: '', izquierdo: '' } }), {}) },
            espirometria: { realizada: '', resultado: '', predicho_fvc: '', predicho_fev1: '', fev1: '', fvc: '', reporte: '' },
            optometria: { realizada: '', resultado: '', visionLejana: { odSC: '', odCC: '', oiSC: '', oiCC: '' }, visionCercana: { odSC: '', odCC: '', oiSC: '', oiCC: '' }, visionCromatica: '', reporte: '' },
            electrocardiograma: { realizada: '', resultado: '', ritmo: '', frecuenciaCardiaca: '' },
        },
        pruebasLaboratorio: {
            glucosa: '', antidoping: '',
            radiografiaTorax: { realizada: '', resultado: '', reporte: '' },
            radiografiaColumnaLumbar: { realizada: '', resultado: '', reporte: '' },
            otros: { realizado: '', reporte: '' },
        },
        diagnostico: {
            lista: '', sospechaEnfermedadProfesional: '', cual: '',
        },
        concepto: {
            resumen: '', puestoDe: '', aptitud: '', limitacionesRestricciones: '',
        },
        recomendaciones: '',
    };
}
